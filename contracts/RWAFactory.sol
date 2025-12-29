// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./RWAToken.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title RWAFactory
 * @dev Factory for deploying RWA tokens
 */
contract RWAFactory is Ownable {
    // Array of all created tokens
    address[] public allTokens;
    
    // Mapping of token address to creator
    mapping(address => address) public tokenCreator;
    
    // Authorized issuers who can create tokens
    mapping(address => bool) public authorizedIssuers;
    
    // Creation fee in native token
    uint256 public creationFee = 0.01 ether;
    
    // Compliance registry address
    address public complianceRegistry;
    
    // Events
    event TokenCreated(
        address indexed tokenAddress,
        address indexed creator,
        string name,
        string symbol,
        RWAToken.AssetType assetType
    );
    event IssuerAuthorized(address indexed issuer);
    event IssuerRevoked(address indexed issuer);
    
    constructor(address _complianceRegistry) Ownable(msg.sender) {
        complianceRegistry = _complianceRegistry;
        authorizedIssuers[msg.sender] = true;
    }
    
    modifier onlyAuthorizedIssuer() {
        require(
            authorizedIssuers[msg.sender] || msg.sender == owner(),
            "Not authorized issuer"
        );
        _;
    }
    
    /**
     * @dev Create a new RWA token
     */
    function createRWAToken(
        string memory name,
        string memory symbol,
        uint256 totalSupply,
        RWAToken.AssetType assetType,
        uint256 totalAssetValue,
        uint256 yieldRate,
        uint256 maturityDate,
        string memory jurisdiction,
        bool complianceRequired
    ) external payable onlyAuthorizedIssuer returns (address) {
        require(msg.value >= creationFee, "Insufficient creation fee");
        
        RWAToken newToken = new RWAToken(
            name,
            symbol,
            totalSupply,
            assetType,
            totalAssetValue,
            yieldRate,
            maturityDate,
            jurisdiction,
            complianceRegistry,
            complianceRequired
        );
        
        address tokenAddress = address(newToken);
        
        // Transfer ownership to creator
        newToken.transferOwnership(msg.sender);
        
        // Record token
        allTokens.push(tokenAddress);
        tokenCreator[tokenAddress] = msg.sender;
        
        emit TokenCreated(
            tokenAddress,
            msg.sender,
            name,
            symbol,
            assetType
        );
        
        return tokenAddress;
    }
    
    /**
     * @dev Get total number of created tokens
     */
    function totalTokens() external view returns (uint256) {
        return allTokens.length;
    }
    
    /**
     * @dev Get all tokens created by a specific issuer
     */
    function getTokensByIssuer(address issuer) 
        external 
        view 
        returns (address[] memory) 
    {
        uint256 count = 0;
        
        // Count tokens
        for (uint256 i = 0; i < allTokens.length; i++) {
            if (tokenCreator[allTokens[i]] == issuer) {
                count++;
            }
        }
        
        // Create array
        address[] memory issuerTokens = new address[](count);
        uint256 index = 0;
        
        for (uint256 i = 0; i < allTokens.length; i++) {
            if (tokenCreator[allTokens[i]] == issuer) {
                issuerTokens[index] = allTokens[i];
                index++;
            }
        }
        
        return issuerTokens;
    }
    
    // Admin functions
    function authorizeIssuer(address issuer) external onlyOwner {
        authorizedIssuers[issuer] = true;
        emit IssuerAuthorized(issuer);
    }
    
    function revokeIssuer(address issuer) external onlyOwner {
        authorizedIssuers[issuer] = false;
        emit IssuerRevoked(issuer);
    }
    
    function setCreationFee(uint256 fee) external onlyOwner {
        creationFee = fee;
    }
    
    function setComplianceRegistry(address registry) external onlyOwner {
        complianceRegistry = registry;
    }
    
    function withdrawFees() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }
}