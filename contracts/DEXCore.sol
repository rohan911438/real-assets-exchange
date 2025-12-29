// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

/**
 * @title DEXCore
 * @dev Hybrid DEX with AMM pools and order book for RWA trading
 */
contract DEXCore is ReentrancyGuard, Ownable, Pausable {
    struct Pool {
        uint256 reserve0; // RWA token reserve
        uint256 reserve1; // USDC reserve
        uint256 totalLiquidity;
        uint256 lastPrice;
        uint256 lastUpdateTime;
    }
    
    struct LimitOrder {
        address maker;
        address tokenIn;
        address tokenOut;
        uint256 amountIn;
        uint256 amountOut;
        uint256 filled;
        bool active;
    }
    
    // Token pair => Pool
    mapping(address => Pool) public pools;
    
    // User => Token => LP balance
    mapping(address => mapping(address => uint256)) public lpBalances;
    
    // Order ID => Order
    mapping(uint256 => LimitOrder) public orders;
    uint256 public nextOrderId;
    
    // Fee configuration (in basis points)
    uint256 public tradingFee = 30; // 0.3%
    uint256 public constant FEE_DENOMINATOR = 10000;
    
    // Protocol fee collector
    address public feeCollector;
    
    // USDC address (stable pair token)
    address public immutable USDC;
    
    // Events
    event PoolCreated(
        address indexed token,
        uint256 reserve0,
        uint256 reserve1
    );
    
    event LiquidityAdded(
        address indexed provider,
        address indexed token,
        uint256 amount0,
        uint256 amount1,
        uint256 liquidity
    );
    
    event LiquidityRemoved(
        address indexed provider,
        address indexed token,
        uint256 amount0,
        uint256 amount1,
        uint256 liquidity
    );
    
    event Swap(
        address indexed user,
        address indexed tokenIn,
        address indexed tokenOut,
        uint256 amountIn,
        uint256 amountOut,
        uint256 fee
    );
    
    event OrderCreated(
        uint256 indexed orderId,
        address indexed maker,
        address tokenIn,
        address tokenOut,
        uint256 amountIn,
        uint256 amountOut
    );
    
    event OrderFilled(
        uint256 indexed orderId,
        address indexed taker,
        uint256 amountFilled
    );
    
    event OrderCancelled(uint256 indexed orderId);
    
    constructor(address _usdc) Ownable(msg.sender) {
        require(_usdc != address(0), "Invalid USDC address");
        USDC = _usdc;
        feeCollector = msg.sender;
    }
    
    /**
     * @dev Add liquidity to a pool
     */
    function addLiquidity(
        address token,
        uint256 amountToken,
        uint256 amountUSDC,
        uint256 minLiquidity
    ) external nonReentrant whenNotPaused returns (uint256 liquidity) {
        require(token != address(0) && token != USDC, "Invalid token");
        require(amountToken > 0 && amountUSDC > 0, "Invalid amounts");
        
        Pool storage pool = pools[token];
        
        // Transfer tokens from user
        require(
            IERC20(token).transferFrom(msg.sender, address(this), amountToken),
            "Token transfer failed"
        );
        require(
            IERC20(USDC).transferFrom(msg.sender, address(this), amountUSDC),
            "USDC transfer failed"
        );
        
        if (pool.totalLiquidity == 0) {
            // First liquidity provider - initialize pool
            liquidity = sqrt(amountToken * amountUSDC);
            require(liquidity > 1000, "Insufficient initial liquidity");
            require(liquidity >= minLiquidity, "Slippage: liquidity too low");
            
            // Lock minimum liquidity
            liquidity -= 1000;
            
            pool.reserve0 = amountToken;
            pool.reserve1 = amountUSDC;
            pool.totalLiquidity = liquidity + 1000;
            pool.lastPrice = (amountUSDC * 1e18) / amountToken;
            pool.lastUpdateTime = block.timestamp;
            
            lpBalances[address(0)][token] = 1000; // Burn minimum liquidity
            
            emit PoolCreated(token, amountToken, amountUSDC);
        } else {
            // Subsequent liquidity addition
            uint256 liquidity0 = (amountToken * pool.totalLiquidity) / pool.reserve0;
            uint256 liquidity1 = (amountUSDC * pool.totalLiquidity) / pool.reserve1;
            
            liquidity = liquidity0 < liquidity1 ? liquidity0 : liquidity1;
            require(liquidity >= minLiquidity, "Slippage: liquidity too low");
            
            pool.reserve0 += amountToken;
            pool.reserve1 += amountUSDC;
            pool.totalLiquidity += liquidity;
        }
        
        lpBalances[msg.sender][token] += liquidity;
        
        emit LiquidityAdded(
            msg.sender,
            token,
            amountToken,
            amountUSDC,
            liquidity
        );
        
        return liquidity;
    }
    
    /**
     * @dev Remove liquidity from a pool
     */
    function removeLiquidity(
        address token,
        uint256 liquidity,
        uint256 minAmount0,
        uint256 minAmount1
    ) external nonReentrant returns (uint256 amount0, uint256 amount1) {
        require(liquidity > 0, "Invalid liquidity amount");
        require(
            lpBalances[msg.sender][token] >= liquidity,
            "Insufficient LP balance"
        );
        
        Pool storage pool = pools[token];
        require(pool.totalLiquidity > 0, "Pool not initialized");
        
        // Calculate token amounts to return
        amount0 = (liquidity * pool.reserve0) / pool.totalLiquidity;
        amount1 = (liquidity * pool.reserve1) / pool.totalLiquidity;
        
        require(
            amount0 >= minAmount0 && amount1 >= minAmount1,
            "Slippage: amounts too low"
        );
        
        // Update state
        lpBalances[msg.sender][token] -= liquidity;
        pool.reserve0 -= amount0;
        pool.reserve1 -= amount1;
        pool.totalLiquidity -= liquidity;
        
        // Transfer tokens to user
        require(
            IERC20(token).transfer(msg.sender, amount0),
            "Token transfer failed"
        );
        require(
            IERC20(USDC).transfer(msg.sender, amount1),
            "USDC transfer failed"
        );
        
        emit LiquidityRemoved(msg.sender, token, amount0, amount1, liquidity);
        
        return (amount0, amount1);
    }
    
    /**
     * @dev Swap tokens using AMM
     */
    function swap(
        address tokenIn,
        address tokenOut,
        uint256 amountIn,
        uint256 minAmountOut
    ) external nonReentrant whenNotPaused returns (uint256 amountOut) {
        require(amountIn > 0, "Invalid input amount");
        require(
            (tokenIn != USDC && tokenOut == USDC) || 
            (tokenIn == USDC && tokenOut != USDC),
            "Invalid token pair"
        );
        
        address token = tokenIn == USDC ? tokenOut : tokenIn;
        Pool storage pool = pools[token];
        require(pool.totalLiquidity > 0, "Pool not initialized");
        
        // Calculate fee
        uint256 feeAmount = (amountIn * tradingFee) / FEE_DENOMINATOR;
        uint256 amountInAfterFee = amountIn - feeAmount;
        
        // Calculate output amount using constant product formula
        if (tokenIn == USDC) {
            // Buy RWA token with USDC
            uint256 numerator = amountInAfterFee * pool.reserve0;
            uint256 denominator = pool.reserve1 + amountInAfterFee;
            amountOut = numerator / denominator;
            
            require(amountOut >= minAmountOut, "Slippage: output too low");
            require(amountOut < pool.reserve0, "Insufficient liquidity");
            
            // Update reserves
            pool.reserve1 += amountIn; // Include fee in reserve
            pool.reserve0 -= amountOut;
        } else {
            // Sell RWA token for USDC
            uint256 numerator = amountInAfterFee * pool.reserve1;
            uint256 denominator = pool.reserve0 + amountInAfterFee;
            amountOut = numerator / denominator;
            
            require(amountOut >= minAmountOut, "Slippage: output too low");
            require(amountOut < pool.reserve1, "Insufficient liquidity");
            
            // Update reserves
            pool.reserve0 += amountIn; // Include fee in reserve
            pool.reserve1 -= amountOut;
        }
        
        // Update price
        pool.lastPrice = (pool.reserve1 * 1e18) / pool.reserve0;
        pool.lastUpdateTime = block.timestamp;
        
        // Transfer tokens
        require(
            IERC20(tokenIn).transferFrom(msg.sender, address(this), amountIn),
            "Input transfer failed"
        );
        require(
            IERC20(tokenOut).transfer(msg.sender, amountOut),
            "Output transfer failed"
        );
        
        emit Swap(msg.sender, tokenIn, tokenOut, amountIn, amountOut, feeAmount);
        
        return amountOut;
    }
    
    /**
     * @dev Create a limit order
     */
    function createLimitOrder(
        address tokenIn,
        address tokenOut,
        uint256 amountIn,
        uint256 minAmountOut
    ) external nonReentrant whenNotPaused returns (uint256 orderId) {
        require(amountIn > 0 && minAmountOut > 0, "Invalid amounts");
        require(
            (tokenIn != USDC && tokenOut == USDC) || 
            (tokenIn == USDC && tokenOut != USDC),
            "Invalid token pair"
        );
        
        orderId = nextOrderId++;
        
        orders[orderId] = LimitOrder({
            maker: msg.sender,
            tokenIn: tokenIn,
            tokenOut: tokenOut,
            amountIn: amountIn,
            amountOut: minAmountOut,
            filled: 0,
            active: true
        });
        
        // Lock tokens
        require(
            IERC20(tokenIn).transferFrom(msg.sender, address(this), amountIn),
            "Token lock failed"
        );
        
        emit OrderCreated(orderId, msg.sender, tokenIn, tokenOut, amountIn, minAmountOut);
        
        return orderId;
    }
    
    /**
     * @dev Fill a limit order (partially or fully)
     */
    function fillOrder(uint256 orderId, uint256 amountToFill) 
        external 
        nonReentrant 
        whenNotPaused 
        returns (uint256 amountOut) 
    {
        LimitOrder storage order = orders[orderId];
        require(order.active, "Order not active");
        require(amountToFill > 0, "Invalid fill amount");
        
        uint256 remainingIn = order.amountIn - order.filled;
        require(amountToFill <= remainingIn, "Fill amount too large");
        
        // Calculate output amount proportionally
        amountOut = (amountToFill * order.amountOut) / order.amountIn;
        
        // Update order
        order.filled += amountToFill;
        if (order.filled == order.amountIn) {
            order.active = false;
        }
        
        // Transfer tokens
        require(
            IERC20(order.tokenOut).transferFrom(msg.sender, order.maker, amountOut),
            "Output transfer failed"
        );
        require(
            IERC20(order.tokenIn).transfer(msg.sender, amountToFill),
            "Input transfer failed"
        );
        
        emit OrderFilled(orderId, msg.sender, amountToFill);
        
        return amountOut;
    }
    
    /**
     * @dev Cancel a limit order
     */
    function cancelOrder(uint256 orderId) external nonReentrant {
        LimitOrder storage order = orders[orderId];
        require(order.active, "Order not active");
        require(order.maker == msg.sender, "Not order maker");
        
        order.active = false;
        
        // Return unfilled tokens
        uint256 remaining = order.amountIn - order.filled;
        if (remaining > 0) {
            require(
                IERC20(order.tokenIn).transfer(msg.sender, remaining),
                "Token return failed"
            );
        }
        
        emit OrderCancelled(orderId);
    }
    
    /**
     * @dev Get current price for a token in USDC
     */
    function getPrice(address token) external view returns (uint256) {
        Pool memory pool = pools[token];
        require(pool.totalLiquidity > 0, "Pool not initialized");
        return pool.lastPrice;
    }
    
    /**
     * @dev Preview swap output and price impact
     */
    function previewSwap(
        address tokenIn,
        address tokenOut,
        uint256 amountIn
    ) external view returns (
        uint256 amountOut,
        uint256 priceImpact,
        uint256 fee
    ) {
        require(
            (tokenIn != USDC && tokenOut == USDC) || 
            (tokenIn == USDC && tokenOut != USDC),
            "Invalid token pair"
        );
        
        address token = tokenIn == USDC ? tokenOut : tokenIn;
        Pool memory pool = pools[token];
        require(pool.totalLiquidity > 0, "Pool not initialized");
        
        // Calculate fee
        fee = (amountIn * tradingFee) / FEE_DENOMINATOR;
        uint256 amountInAfterFee = amountIn - fee;
        
        // Calculate output
        if (tokenIn == USDC) {
            uint256 numerator = amountInAfterFee * pool.reserve0;
            uint256 denominator = pool.reserve1 + amountInAfterFee;
            amountOut = numerator / denominator;
        } else {
            uint256 numerator = amountInAfterFee * pool.reserve1;
            uint256 denominator = pool.reserve0 + amountInAfterFee;
            amountOut = numerator / denominator;
        }
        
        // Calculate price impact (in basis points)
        uint256 executionPrice = tokenIn == USDC ?
            (amountIn * 1e18) / amountOut :
            (amountOut * 1e18) / amountIn;
            
        if (executionPrice > pool.lastPrice) {
            priceImpact = ((executionPrice - pool.lastPrice) * 10000) / pool.lastPrice;
        } else {
            priceImpact = ((pool.lastPrice - executionPrice) * 10000) / pool.lastPrice;
        }
        
        return (amountOut, priceImpact, fee);
    }
    
    /**
     * @dev Get pool reserves and liquidity
     */
    function getPoolInfo(address token) 
        external 
        view 
        returns (
            uint256 reserve0,
            uint256 reserve1,
            uint256 totalLiquidity,
            uint256 lastPrice,
            uint256 lastUpdateTime
        ) 
    {
        Pool memory pool = pools[token];
        return (
            pool.reserve0,
            pool.reserve1,
            pool.totalLiquidity,
            pool.lastPrice,
            pool.lastUpdateTime
        );
    }
    
    /**
     * @dev Get user's LP balance for a token
     */
    function getLPBalance(address user, address token) 
        external 
        view 
        returns (uint256) 
    {
        return lpBalances[user][token];
    }
    
    /**
     * @dev Get order details
     */
    function getOrder(uint256 orderId) 
        external 
        view 
        returns (
            address maker,
            address tokenIn,
            address tokenOut,
            uint256 amountIn,
            uint256 amountOut,
            uint256 filled,
            bool active
        ) 
    {
        LimitOrder memory order = orders[orderId];
        return (
            order.maker,
            order.tokenIn,
            order.tokenOut,
            order.amountIn,
            order.amountOut,
            order.filled,
            order.active
        );
    }
    
    // Admin functions
    function setTradingFee(uint256 fee) external onlyOwner {
        require(fee <= 100, "Fee too high"); // Max 1%
        tradingFee = fee;
    }
    
    function setFeeCollector(address collector) external onlyOwner {
        require(collector != address(0), "Invalid address");
        feeCollector = collector;
    }
    
    function pause() external onlyOwner {
        _pause();
    }
    
    function unpause() external onlyOwner {
        _unpause();
    }
    
    // Helper function for square root
    function sqrt(uint256 x) internal pure returns (uint256) {
        if (x == 0) return 0;
        uint256 z = (x + 1) / 2;
        uint256 y = x;
        while (z < y) {
            y = z;
            z = (x / z + z) / 2;
        }
        return y;
    }
}