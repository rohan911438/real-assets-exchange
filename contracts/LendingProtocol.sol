// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

/**
 * @title LendingProtocol
 * @dev Simple lending protocol for borrowing stablecoins against RWA collateral
 */
contract LendingProtocol is ReentrancyGuard, Ownable, Pausable {
    
    struct CollateralPosition {
        address collateralToken;
        uint256 collateralAmount;
        uint256 borrowedAmount;
        uint256 borrowTimestamp;
        uint256 lastInterestUpdate;
        bool active;
    }
    
    // User address => Position ID => CollateralPosition
    mapping(address => mapping(uint256 => CollateralPosition)) public positions;
    
    // User address => Number of positions
    mapping(address => uint256) public userPositionCount;
    
    // Collateral token => Loan-to-Value ratio (in basis points, 5000 = 50%)
    mapping(address => uint256) public ltvRatios;
    
    // Collateral token => Is accepted as collateral
    mapping(address => bool) public acceptedCollateral;
    
    // Price oracle address
    address public priceOracle;
    
    // Borrowed token (USDC)
    address public immutable borrowToken;
    
    // Interest rate (annual percentage in basis points, 600 = 6%)
    uint256 public interestRate = 600;
    
    // Liquidation threshold (health factor below this triggers liquidation)
    uint256 public constant LIQUIDATION_THRESHOLD = 10000; // 1.0 in basis points scale
    
    // Liquidation bonus (5% = 500 basis points)
    uint256 public liquidationBonus = 500;
    
    // Total borrowed amount across all users
    uint256 public totalBorrowed;
    
    // Events
    event CollateralDeposited(
        address indexed user,
        uint256 indexed positionId,
        address collateralToken,
        uint256 amount
    );
    
    event Borrowed(
        address indexed user,
        uint256 indexed positionId,
        uint256 amount
    );
    
    event Repaid(
        address indexed user,
        uint256 indexed positionId,
        uint256 amount,
        uint256 interest
    );
    
    event CollateralWithdrawn(
        address indexed user,
        uint256 indexed positionId,
        uint256 amount
    );
    
    event Liquidated(
        address indexed user,
        uint256 indexed positionId,
        address liquidator,
        uint256 collateralLiquidated,
        uint256 debtRepaid
    );
    
    event CollateralAccepted(address indexed token, uint256 ltvRatio);
    
    constructor(address _borrowToken, address _priceOracle) Ownable(msg.sender) {
        require(_borrowToken != address(0), "Invalid borrow token");
        require(_priceOracle != address(0), "Invalid oracle");
        
        borrowToken = _borrowToken;
        priceOracle = _priceOracle;
    }
    
    /**
     * @dev Accept a token as collateral
     */
    function acceptCollateralToken(address token, uint256 ltvRatio) 
        external 
        onlyOwner 
    {
        require(token != address(0), "Invalid token");
        require(ltvRatio > 0 && ltvRatio <= 8000, "Invalid LTV"); // Max 80%
        
        acceptedCollateral[token] = true;
        ltvRatios[token] = ltvRatio;
        
        emit CollateralAccepted(token, ltvRatio);
    }
    
    /**
     * @dev Deposit collateral and create position
     */
    function depositCollateral(address collateralToken, uint256 amount)
        external
        nonReentrant
        whenNotPaused
        returns (uint256 positionId)
    {
        require(acceptedCollateral[collateralToken], "Collateral not accepted");
        require(amount > 0, "Invalid amount");
        
        // Transfer collateral to contract
        require(
            IERC20(collateralToken).transferFrom(msg.sender, address(this), amount),
            "Transfer failed"
        );
        
        positionId = userPositionCount[msg.sender];
        userPositionCount[msg.sender]++;
        
        positions[msg.sender][positionId] = CollateralPosition({
            collateralToken: collateralToken,
            collateralAmount: amount,
            borrowedAmount: 0,
            borrowTimestamp: block.timestamp,
            lastInterestUpdate: block.timestamp,
            active: true
        });
        
        emit CollateralDeposited(msg.sender, positionId, collateralToken, amount);
        
        return positionId;
    }
    
    /**
     * @dev Borrow against collateral
     */
    function borrow(uint256 positionId, uint256 amount)
        external
        nonReentrant
        whenNotPaused
    {
        CollateralPosition storage position = positions[msg.sender][positionId];
        require(position.active, "Position not active");
        require(amount > 0, "Invalid amount");
        
        // Update accrued interest before borrowing more
        _updateInterest(msg.sender, positionId);
        
        uint256 newBorrowedAmount = position.borrowedAmount + amount;
        
        // Check borrowing capacity
        uint256 maxBorrow = getBorrowingCapacity(msg.sender, positionId);
        require(newBorrowedAmount <= maxBorrow, "Exceeds borrowing capacity");
        
        // Check health factor
        uint256 healthFactor = calculateHealthFactor(
            msg.sender,
            positionId,
            newBorrowedAmount
        );
        require(healthFactor >= LIQUIDATION_THRESHOLD, "Health factor too low");
        
        position.borrowedAmount = newBorrowedAmount;
        totalBorrowed += amount;
        
        // Transfer borrowed tokens to user
        require(
            IERC20(borrowToken).transfer(msg.sender, amount),
            "Transfer failed"
        );
        
        emit Borrowed(msg.sender, positionId, amount);
    }
    
    /**
     * @dev Repay borrowed amount
     */
    function repay(uint256 positionId, uint256 amount)
        external
        nonReentrant
    {
        CollateralPosition storage position = positions[msg.sender][positionId];
        require(position.active, "Position not active");
        require(amount > 0, "Invalid amount");
        
        // Update accrued interest
        _updateInterest(msg.sender, positionId);
        
        uint256 totalDebt = position.borrowedAmount;
        require(amount <= totalDebt, "Amount exceeds debt");
        
        // Transfer repayment from user
        require(
            IERC20(borrowToken).transferFrom(msg.sender, address(this), amount),
            "Transfer failed"
        );
        
        uint256 interestPaid = amount > position.borrowedAmount ?
            amount - position.borrowedAmount : 0;
        
        position.borrowedAmount -= (amount - interestPaid);
        if (position.borrowedAmount > totalBorrowed) {
            totalBorrowed = 0;
        } else {
            totalBorrowed -= (amount - interestPaid);
        }
        
        emit Repaid(msg.sender, positionId, amount, interestPaid);
    }
    
    /**
     * @dev Withdraw collateral (must have no debt or sufficient over-collateralization)
     */
    function withdrawCollateral(uint256 positionId, uint256 amount)
        external
        nonReentrant
    {
        CollateralPosition storage position = positions[msg.sender][positionId];
        require(position.active, "Position not active");
        require(amount > 0 && amount <= position.collateralAmount, "Invalid amount");
        
        // Update interest
        _updateInterest(msg.sender, positionId);
        
        // If there's debt, check health factor after withdrawal
        if (position.borrowedAmount > 0) {
            uint256 remainingCollateral = position.collateralAmount - amount;
            uint256 collateralValue = getCollateralValue(
                position.collateralToken,
                remainingCollateral
            );
            uint256 borrowValue = position.borrowedAmount;
            
            uint256 ltvRatio = ltvRatios[position.collateralToken];
            uint256 maxBorrow = (collateralValue * ltvRatio) / 10000;
            
            require(borrowValue <= maxBorrow, "Would exceed LTV ratio");
            
            uint256 healthFactor = (collateralValue * 10000) / 
                                  (borrowValue > 0 ? borrowValue : 1);
            require(healthFactor >= LIQUIDATION_THRESHOLD, "Health factor too low");
        }
        
        position.collateralAmount -= amount;
        
        // If no collateral and no debt left, deactivate position
        if (position.collateralAmount == 0 && position.borrowedAmount == 0) {
            position.active = false;
        }
        
        // Transfer collateral back to user
        require(
            IERC20(position.collateralToken).transfer(msg.sender, amount),
            "Transfer failed"
        );
        
        emit CollateralWithdrawn(msg.sender, positionId, amount);
    }
    
    /**
     * @dev Liquidate an unhealthy position
     */
    function liquidate(address user, uint256 positionId)
        external
        nonReentrant
    {
        CollateralPosition storage position = positions[user][positionId];
        require(position.active, "Position not active");
        require(position.borrowedAmount > 0, "No debt to liquidate");
        
        // Update interest
        _updateInterest(user, positionId);
        
        // Check if position is unhealthy
        uint256 healthFactor = calculateHealthFactor(user, positionId, position.borrowedAmount);
        require(healthFactor < LIQUIDATION_THRESHOLD, "Position is healthy");
        
        uint256 debtToRepay = position.borrowedAmount;
        uint256 collateralValue = getCollateralValue(
            position.collateralToken,
            position.collateralAmount
        );
        
        // Calculate liquidation amount with bonus
        uint256 liquidationValue = (debtToRepay * (10000 + liquidationBonus)) / 10000;
        uint256 collateralToLiquidate = liquidationValue <= collateralValue ?
            (position.collateralAmount * liquidationValue) / collateralValue :
            position.collateralAmount;
        
        // Transfer debt repayment from liquidator
        require(
            IERC20(borrowToken).transferFrom(msg.sender, address(this), debtToRepay),
            "Repayment transfer failed"
        );
        
        // Transfer collateral to liquidator
        require(
            IERC20(position.collateralToken).transfer(msg.sender, collateralToLiquidate),
            "Collateral transfer failed"
        );
        
        // Update position
        position.borrowedAmount = 0;
        position.collateralAmount -= collateralToLiquidate;
        totalBorrowed -= debtToRepay;
        
        if (position.collateralAmount == 0) {
            position.active = false;
        }
        
        emit Liquidated(user, positionId, msg.sender, collateralToLiquidate, debtToRepay);
    }
    
    /**
     * @dev Update accrued interest for a position
     */
    function _updateInterest(address user, uint256 positionId) internal {
        CollateralPosition storage position = positions[user][positionId];
        
        if (position.borrowedAmount == 0) return;
        
        uint256 timeElapsed = block.timestamp - position.lastInterestUpdate;
        if (timeElapsed == 0) return;
        
        // Simple interest: principal * rate * time / (100 * year)
        uint256 interest = (position.borrowedAmount * interestRate * timeElapsed) /
                          (10000 * 365 days);
        
        position.borrowedAmount += interest;
        position.lastInterestUpdate = block.timestamp;
    }
    
    /**
     * @dev Get collateral value in borrow token terms
     */
    function getCollateralValue(address collateralToken, uint256 amount)
        public
        view
        returns (uint256)
    {
        // Get price from oracle (price should be in borrow token per collateral

        // Simplified: assume 1:1 for demo
    return amount;
}

/**
 * @dev Calculate borrowing capacity based on collateral
 */
function getBorrowingCapacity(address user, uint256 positionId)
    public
    view
    returns (uint256)
{
    CollateralPosition memory position = positions[user][positionId];
    if (!position.active) return 0;
    
    uint256 collateralValue = getCollateralValue(
        position.collateralToken,
        position.collateralAmount
    );
    
    uint256 ltvRatio = ltvRatios[position.collateralToken];
    return (collateralValue * ltvRatio) / 10000;
}

/**
 * @dev Calculate health factor for a position
 * Health factor = (collateral value) / (borrowed amount)
 * Returns value in basis points (10000 = 1.0)
 */
function calculateHealthFactor(
    address user,
    uint256 positionId,
    uint256 borrowedAmount
) public view returns (uint256) {
    CollateralPosition memory position = positions[user][positionId];
    if (borrowedAmount == 0) return type(uint256).max;
    
    uint256 collateralValue = getCollateralValue(
        position.collateralToken,
        position.collateralAmount
    );
    
    return (collateralValue * 10000) / borrowedAmount;
}

/**
 * @dev Get position details
 */
function getPosition(address user, uint256 positionId)
    external
    view
    returns (
        address collateralToken,
        uint256 collateralAmount,
        uint256 borrowedAmount,
        uint256 healthFactor,
        uint256 borrowingCapacity,
        bool active
    )
{
    CollateralPosition memory position = positions[user][positionId];
    
    return (
        position.collateralToken,
        position.collateralAmount,
        position.borrowedAmount,
        calculateHealthFactor(user, positionId, position.borrowedAmount),
        getBorrowingCapacity(user, positionId),
        position.active
    );
}

/**
 * @dev Get total debt with accrued interest for a position
 */
function getTotalDebt(address user, uint256 positionId)
    external
    view
    returns (uint256)
{
    CollateralPosition memory position = positions[user][positionId];
    
    if (position.borrowedAmount == 0) return 0;
    
    uint256 timeElapsed = block.timestamp - position.lastInterestUpdate;
    uint256 interest = (position.borrowedAmount * interestRate * timeElapsed) /
                      (10000 * 365 days);
    
    return position.borrowedAmount + interest;
}

// Admin functions
function setInterestRate(uint256 rate) external onlyOwner {
    require(rate <= 2000, "Rate too high"); // Max 20%
    interestRate = rate;
}

function setLiquidationBonus(uint256 bonus) external onlyOwner {
    require(bonus <= 1000, "Bonus too high"); // Max 10%
    liquidationBonus = bonus;
}

function setPriceOracle(address oracle) external onlyOwner {
    require(oracle != address(0), "Invalid oracle");
    priceOracle = oracle;
}

function pause() external onlyOwner {
    _pause();
}

function unpause() external onlyOwner {
    _unpause();
}

/**
 * @dev Emergency withdraw in case of contract issues
 */
function emergencyWithdraw(address token, uint256 amount) 
    external 
    onlyOwner 
{
    require(
        IERC20(token).transfer(owner(), amount),
        "Transfer failed"
    );
}
}