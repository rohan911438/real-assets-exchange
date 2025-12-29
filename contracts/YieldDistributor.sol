
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title YieldDistributor
 * @dev Manages yield distribution for RWA token holders
 */
contract YieldDistributor is Ownable, ReentrancyGuard {
    struct Distribution {
        uint256 totalAmount;
        uint256 perTokenAmount;
        uint256 timestamp;
        uint256 totalClaimed;
    }
    
    // Token => Distribution ID => Distribution
    mapping(address => mapping(uint256 => Distribution)) public distributions;
    
    // Token => Current distribution ID
    mapping(address => uint256) public currentDistributionId;
    
    // Token => User => Distribution ID => Claimed
    mapping(address => mapping(address => mapping(uint256 => bool))) public hasClaimed;
    
    // Token => User => Total claimed
    mapping(address => mapping(address => uint256)) public totalClaimed;
    
    // Yield token (USDC)
    address public immutable yieldToken;
    
    // Events
    event YieldDeposited(address indexed token, uint256 distributionId, uint256 amount);
    event YieldClaimed(address indexed token, address indexed user, uint256 amount);
    
    constructor(address _yieldToken) Ownable(msg.sender) {
        yieldToken = _yieldToken;
    }
    
    /**
     * @dev Deposit yield for distribution
     */
    function depositYield(address rwaToken, uint256 amount) 
        external 
        onlyOwner 
        nonReentrant 
    {
        require(amount > 0, "Amount must be > 0");
        
        uint256 totalSupply = IERC20(rwaToken).totalSupply();
        require(totalSupply > 0, "No tokens in circulation");
        
        uint256 distributionId = currentDistributionId[rwaToken];
        currentDistributionId[rwaToken]++;
        
        distributions[rwaToken][distributionId] = Distribution({
            totalAmount: amount,
            perTokenAmount: (amount * 1e18) / totalSupply,
            timestamp: block.timestamp,
            totalClaimed: 0
        });
        
        // Transfer yield tokens to contract
        IERC20(yieldToken).transferFrom(msg.sender, address(this), amount);
        
        emit YieldDeposited(rwaToken, distributionId, amount);
    }
    
    /**
     * @dev Claim yield for specific distribution
     */
    function claimYield(address rwaToken, uint256 distributionId) 
        external 
        nonReentrant 
        returns (uint256) 
    {
        require(distributionId < currentDistributionId[rwaToken], "Invalid distribution");
        require(!hasClaimed[rwaToken][msg.sender][distributionId], "Already claimed");
        
        uint256 userBalance = IERC20(rwaToken).balanceOf(msg.sender);
        require(userBalance > 0, "No tokens held");
        
        Distribution storage dist = distributions[rwaToken][distributionId];
        uint256 claimAmount = (userBalance * dist.perTokenAmount) / 1e18;
        
        require(claimAmount > 0, "Nothing to claim");
        
        hasClaimed[rwaToken][msg.sender][distributionId] = true;
        totalClaimed[rwaToken][msg.sender] += claimAmount;
        dist.totalClaimed += claimAmount;
        
        IERC20(yieldToken).transfer(msg.sender, claimAmount);
        
        emit YieldClaimed(rwaToken, msg.sender, claimAmount);
        
        return claimAmount;
    }
    
    /**
     * @dev Claim all unclaimed yield
     */
    function claimAllYield(address rwaToken) 
        external 
        nonReentrant 
        returns (uint256 totalAmount) 
    {
        uint256 maxDistId = currentDistributionId[rwaToken];
        uint256 userBalance = IERC20(rwaToken).balanceOf(msg.sender);
        require(userBalance > 0, "No tokens held");
        
        for (uint256 i = 0; i < maxDistId; i++) {
            if (!hasClaimed[rwaToken][msg.sender][i]) {
                Distribution storage dist = distributions[rwaToken][i];
                uint256 claimAmount = (userBalance * dist.perTokenAmount) / 1e18;
                
                if (claimAmount > 0) {
                    hasClaimed[rwaToken][msg.sender][i] = true;
                    totalClaimed[rwaToken][msg.sender] += claimAmount;
                    dist.totalClaimed += claimAmount;
                    totalAmount += claimAmount;
                }
            }
        }
        
        require(totalAmount > 0, "Nothing to claim");
        
        IERC20(yieldToken).transfer(msg.sender, totalAmount);
        
        emit YieldClaimed(rwaToken, msg.sender, totalAmount);
        
        return totalAmount;
    }
    
    /**
     * @dev Get claimable yield for user
     */
    function getClaimableYield(address rwaToken, address user) 
        external 
        view 
        returns (uint256 totalClaimable) 
    {
        uint256 maxDistId = currentDistributionId[rwaToken];
        uint256 userBalance = IERC20(rwaToken).balanceOf(user);
        
        if (userBalance == 0) return 0;
        
        for (uint256 i = 0; i < maxDistId; i++) {
            if (!hasClaimed[rwaToken][user][i]) {
                Distribution memory dist = distributions[rwaToken][i];
                uint256 claimAmount = (userBalance * dist.perTokenAmount) / 1e18;
                totalClaimable += claimAmount;
            }
        }
        
        return totalClaimable;
    }
    
    /**
     * @dev Get distribution info
     */
    function getDistribution(address rwaToken, uint256 distributionId) 
        external 
        view 
        returns (
            uint256 totalAmount,
            uint256 perTokenAmount,
            uint256 timestamp,
            uint256 claimed
        ) 
    {
        Distribution memory dist = distributions[rwaToken][distributionId];
        return (
            dist.totalAmount,
            dist.perTokenAmount,
            dist.timestamp,
            dist.totalClaimed
        );
    }
}
