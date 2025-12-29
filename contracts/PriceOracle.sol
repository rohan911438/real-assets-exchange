// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

/**
 * @title PriceOracle
 * @dev Manages price feeds for RWA tokens
 */
contract PriceOracle is Ownable, Pausable {
    struct PriceData {
        uint256 price;
        uint256 timestamp;
        uint256 confidence; // 0-100
        address updater;
    }
    
    // Token address => Price data
    mapping(address => PriceData) public prices;
    
    // Token => array of historical prices for TWAP
    mapping(address => uint256[]) public priceHistory;
    
    // Authorized price updaters
    mapping(address => bool) public authorizedUpdaters;
    
    // Price staleness threshold (default 1 hour)
    uint256 public stalenessThreshold = 1 hours;
    
    // Maximum price change percentage (10% = 1000 basis points)
    uint256 public maxPriceChangePercent = 1000; // 10%
    
    // Events
    event PriceUpdated(
        address indexed token,
        uint256 price,
        uint256 timestamp,
        address updater
    );
    event UpdaterAuthorized(address indexed updater);
    event UpdaterRevoked(address indexed updater);
    
    constructor() Ownable(msg.sender) {
        authorizedUpdaters[msg.sender] = true;
    }
    
    modifier onlyAuthorized() {
        require(authorizedUpdaters[msg.sender], "Not authorized");
        _;
    }
    
    /**
     * @dev Update price for a token
     */
    function updatePrice(
        address token,
        uint256 price,
        uint256 confidence
    ) external onlyAuthorized whenNotPaused {
        require(token != address(0), "Invalid token");
        require(price > 0, "Price must be > 0");
        require(confidence <= 100, "Invalid confidence");
        
        // Check for price manipulation (circuit breaker)
        if (prices[token].price > 0) {
            uint256 oldPrice = prices[token].price;
            uint256 priceChange = price > oldPrice ? 
                                  price - oldPrice : 
                                  oldPrice - price;
            uint256 changePercent = (priceChange * 10000) / oldPrice;
            
            require(
                changePercent <= maxPriceChangePercent,
                "Price change too large"
            );
        }
        
        prices[token] = PriceData({
            price: price,
            timestamp: block.timestamp,
            confidence: confidence,
            updater: msg.sender
        });
        
        // Store for TWAP calculation (keep last 100 prices)
        priceHistory[token].push(price);
        if (priceHistory[token].length > 100) {
            // Remove oldest price
            for (uint i = 0; i < priceHistory[token].length - 1; i++) {
                priceHistory[token][i] = priceHistory[token][i + 1];
            }
            priceHistory[token].pop();
        }
        
        emit PriceUpdated(token, price, block.timestamp, msg.sender);
    }
    
    /**
     * @dev Get current price for a token
     */
    function getPrice(address token) 
        external 
        view 
        returns (uint256 price, uint256 timestamp) 
    {
        PriceData memory data = prices[token];
        require(data.price > 0, "Price not available");
        require(
            block.timestamp - data.timestamp <= stalenessThreshold,
            "Price too stale"
        );
        
        return (data.price, data.timestamp);
    }
    
    /**
     * @dev Get TWAP (Time Weighted Average Price) for a token
     */
    function getTWAP(address token, uint256 periods) 
        external 
        view 
        returns (uint256) 
    {
        uint256[] memory history = priceHistory[token];
        require(history.length > 0, "No price history");
        
        uint256 numPrices = periods < history.length ? 
                            periods : 
                            history.length;
        uint256 sum = 0;
        
        for (uint256 i = history.length - numPrices; i < history.length; i++) {
            sum += history[i];
        }
        
        return sum / numPrices;
    }
    
    /**
     * @dev Check if price is fresh
     */
    function isPriceFresh(address token) public view returns (bool) {
        PriceData memory data = prices[token];
        return data.price > 0 && 
               (block.timestamp - data.timestamp) <= stalenessThreshold;
    }
    
    // Admin functions
    function authorizeUpdater(address updater) external onlyOwner {
        authorizedUpdaters[updater] = true;
        emit UpdaterAuthorized(updater);
    }
    
    function revokeUpdater(address updater) external onlyOwner {
        authorizedUpdaters[updater] = false;
        emit UpdaterRevoked(updater);
    }
    
    function setStalenessThreshold(uint256 threshold) external onlyOwner {
        stalenessThreshold = threshold;
    }
    
    function setMaxPriceChange(uint256 maxChange) external onlyOwner {
        maxPriceChangePercent = maxChange;
    }
    
    function pause() external onlyOwner {
        _pause();
    }
    
    function unpause() external onlyOwner {
        _unpause();
    }
}