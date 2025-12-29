// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

/**
 * @title DEXCore
 * @dev Hybrid DEX with AMM pools and order book
 */
contract DEXCore is ERC20, ReentrancyGuard, Ownable, Pausable {
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
    
    // Order ID => Order
    mapping(uint256 => LimitOrder) public orders;
    uint256 public nextOrderId;
    
    // User => Token => LP balance
    mapping(address => mapping(address => uint256)) public lpBalances;
    
    // Fee configuration (in basis points)
    uint256 public tradingFee = 30; // 0.3%
    uint256 public constant FEE_DENOMINATOR = 10000;
    
    // USDC address (stable pair)
    address public immutable USDC;
    
    // Events
    event PoolCreated(address indexed token, uint256 reserve0, uint256 reserve1);
    event LiquidityAdded(address indexed provider, address indexed token, uint256 amount0, uint256 amount1, uint256 liquidity);
    event LiquidityRemoved(address indexed provider, address indexed token, uint256 amount0, uint256 amount1);
    event Swap(address indexed user, address indexed tokenIn, address indexed tokenOut, uint256 amountIn, uint256 amountOut);
    event OrderCreated(uint256 indexed orderId, address indexed maker, address tokenIn, address tokenOut, uint256 amountIn, uint256 amountOut);
    event OrderFilled(uint256 indexed orderId, uint256 amountFilled);
    event OrderCancelled(uint256 indexed orderId);
    
    constructor(address _usdc) ERC20("RWA-DEX LP", "RWA-LP") Ownable(msg.sender) {
        USDC = _usdc;
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
        
        // Transfer tokens
        IERC20(token).transferFrom(msg.sender, address(this), amountToken);
        IERC20(USDC).transferFrom(msg.sender, address(this), amountUSDC);
        
        if (pool.totalLiquidity == 0) {
            // First liquidity provider
            liquidity = sqrt(amountToken * amountUSDC);
            require(liquidity >= minLiquidity, "Insufficient liquidity");
            
            pool.reserve0 = amountToken;
            pool.reserve1 = amountUSDC;
            pool.totalLiquidity = liquidity;
            pool.lastPrice = (amountUSDC * 1e18) / amountToken;
            pool.lastUpdateTime = block.timestamp;
            
            emit PoolCreated(token, amountToken, amountUSDC);
        } else {
            // Subsequent liquidity
            uint256 liquidity0 = (amountToken * pool.totalLiquidity) / pool.reserve0;
            uint256 liquidity1 = (amountUSDC * pool.totalLiquidity) / pool.reserve1;
            
            liquidity = liquidity0 < liquidity1 ? liquidity0 : liquidity1;
            require(liquidity >= minLiquidity, "Insufficient liquidity");
            
            pool.reserve0 += amountToken;
            pool.reserve1 += amountUSDC;
            pool.totalLiquidity += liquidity;
        }
        
        lpBalances[msg.sender][token] += liquidity;
        
        emit LiquidityAdded(msg.sender, token, amountToken, amountUSDC, liquidity);
        
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
        require(liquidity > 0, "Invalid liquidity");
        require(lpBalances[msg.sender][token] >= liquidity, "Insufficient LP balance");
        
        Pool storage pool = pools[token];
        require(pool.totalLiquidity > 0, "Pool not initialized");
        
        amount0 = (liquidity * pool.reserve0) / pool.totalLiquidity;
        amount1 = (liquidity * pool.reserve1) / pool.totalLiquidity;
        
        require(amount0 >= minAmount0 && amount1 >= minAmount1, "Slippage exceeded");
        
        lpBalances[msg.sender][token] -= liquidity;
        pool.reserve0 -= amount0;
        pool.reserve1 -= amount1;
        pool.totalLiquidity -= liquidity;
        
        IERC20(token).transfer(msg.sender, amount0);
        IERC20(USDC).transfer(msg.sender, amount1);
        
        emit LiquidityRemoved(msg.sender, token, amount0, amount1);
        
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
        require(amountIn > 0, "Invalid amount");
        require(
            (tokenIn != USDC && tokenOut == USDC) || 
            (tokenIn == USDC && tokenOut != USDC),
            "Invalid pair"
        );
        
        address token = tokenIn == USDC ? tokenOut : tokenIn;
        Pool storage pool = pools[token];