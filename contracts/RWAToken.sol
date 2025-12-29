// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title RWAToken
 * @dev ERC20 token representing a Real World Asset with compliance and yield
 */
contract RWAToken is ERC20, Ownable, ReentrancyGuard {
    enum AssetType {
        RealEstate,
        Bond,
        Invoice,
        Commodity,
        Equipment
    }
    
    // Asset metadata
    AssetType public assetType;
    uint256 public totalAssetValue; // in USD cents
    uint256 public yieldRate; // in basis points (100 = 1%)
    uint256 public maturityDate;
    string public jurisdiction;
    string public assetURI; // Link to asset documentation
    
    // Compliance
    address public complianceRegistry;
    mapping(address => bool) public whitelist;
    bool public complianceRequired;
    
    // Yield tracking
    mapping(address => uint256) public lastYieldClaim;
    mapping(address => uint256) public accumulatedYield;
    uint256 public totalYieldDistributed;
    
    // Events
    event YieldDistributed(uint256 amount, uint256 timestamp);
    event YieldClaimed(address indexed user, uint256 amount);
    event AddressWhitelisted(address indexed user);
    event AddressRemovedFromWhitelist(address indexed user);
    
    constructor(
        string memory name,
        string memory symbol,
        uint256 totalSupply,
        AssetType _assetType,
        uint256 _totalAssetValue,
        uint256 _yieldRate,
        uint256 _maturityDate,
        string memory _jurisdiction,
        address _complianceRegistry,
        bool _complianceRequired
    ) ERC20(name, symbol) Ownable(msg.sender) {
        assetType = _assetType;
        totalAssetValue = _totalAssetValue;
        yieldRate = _yieldRate;
        maturityDate = _maturityDate;
        jurisdiction = _jurisdiction;
        complianceRegistry = _complianceRegistry;
        complianceRequired = _complianceRequired;
        
        _mint(msg.sender, totalSupply * 10**decimals());
        
        // Creator is automatically whitelisted
        whitelist[msg.sender] = true;
    }
    
    /**
     * @dev Override transfer to enforce compliance
     */
    function transfer(address to, uint256 amount) 
        public 
        virtual 
        override 
        returns (bool) 
    {
        _checkCompliance(msg.sender, to);
        return super.transfer(to, amount);
    }
    
    /**
     * @dev Override transferFrom to enforce compliance
     */
    function transferFrom(address from, address to, uint256 amount)
        public
        virtual
        override
        returns (bool)
    {
        _checkCompliance(from, to);
        return super.transferFrom(from, to, amount);
    }
    
    /**
     * @dev Internal compliance check
     */
    function _checkCompliance(address from, address to) internal view {
        if (complianceRequired) {
            require(whitelist[from], "Sender not whitelisted");
            require(whitelist[to], "Recipient not whitelisted");
        }
    }
    
    /**
     * @dev Add address to whitelist
     */
    function addToWhitelist(address user) external onlyOwner {
        whitelist[user] = true;
        emit AddressWhitelisted(user);
    }
    
    /**
     * @dev Remove address from whitelist
     */
    function removeFromWhitelist(address user) external onlyOwner {
        whitelist[user] = false;
        emit AddressRemovedFromWhitelist(user);
    }
    
    /**
     * @dev Batch whitelist addresses
     */
    function batchWhitelist(address[] calldata users) external onlyOwner {
        for (uint256 i = 0; i < users.length; i++) {
            whitelist[users[i]] = true;
            emit AddressWhitelisted(users[i]);
        }
    }
    
    /**
     * @dev Distribute yield to all token holders
     */
    function distributeYield(uint256 yieldAmount) 
        external 
        onlyOwner 
        nonReentrant 
    {
        require(yieldAmount > 0, "Yield must be > 0");
        
        totalYieldDistributed += yieldAmount;
        emit YieldDistributed(yieldAmount, block.timestamp);
    }
    
    /**
     * @dev Calculate claimable yield for a user
     */
    function getClaimableYield(address user) public view returns (uint256) {
        uint256 balance = balanceOf(user);
        if (balance == 0) return 0;
        
        uint256 timeElapsed = block.timestamp - lastYieldClaim[user];
        if (timeElapsed == 0) return accumulatedYield[user];
        
        // Calculate yield: (balance * yieldRate * timeElapsed) / (10000 * 365 days)
        uint256 newYield = (balance * yieldRate * timeElapsed) / 
                          (10000 * 365 days);
        
        return accumulatedYield[user] + newYield;
    }
    
    /**
     * @dev Claim accumulated yield
     */
    function claimYield() external nonReentrant returns (uint256) {
        uint256 claimable = getClaimableYield(msg.sender);
        require(claimable > 0, "No yield to claim");
        
        accumulatedYield[msg.sender] = 0;
        lastYieldClaim[msg.sender] = block.timestamp;
        
        // In production, this would transfer USDC or other yield token
        // For now, we'll emit an event
        emit YieldClaimed(msg.sender, claimable);
        
        return claimable;
    }
    
    /**
     * @dev Update asset metadata
     */
    function updateAssetURI(string memory newURI) external onlyOwner {
        assetURI = newURI;
    }
    
    /**
     * @dev Get asset information
     */
    function getAssetInfo() external view returns (
        AssetType,
        uint256,
        uint256,
        uint256,
        string memory,
        string memory
    ) {
        return (
            assetType,
            totalAssetValue,
            yieldRate,
            maturityDate,
            jurisdiction,
            assetURI
        );
    }
}