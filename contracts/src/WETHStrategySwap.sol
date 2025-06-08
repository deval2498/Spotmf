// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

interface IHyperSwapV3 {
    struct ExactInputSingleParams {
        address tokenIn;
        address tokenOut;
        uint24 fee;
        address recipient;
        uint256 deadline;
        uint256 amountIn;
        uint256 amountOutMinimum;
        uint160 sqrtPriceLimitX96;
    }

    function exactInputSingle(
        ExactInputSingleParams calldata params
    ) external returns (uint256 amountOut);
}

// src/UETHStrategySwap.sol
contract UETHStrategySwap is ReentrancyGuard, Ownable {
    IERC20 public immutable USDT;
    IERC20 public immutable UETH;
    IHyperSwapV3 public immutable hyperSwap;
    uint24 public constant poolFee = 3000; // 0.3%

    error InsufficientApproval();
    error SwapFailed();
    error TransferFailed();

    event UETHStrategyExecuted(
        address indexed user,
        uint256 usdtAmount,
        uint256 UETHReceived,
        uint256 timestamp
    );

    constructor(
        address _usdt,
        address _ueth,
        address _hyperSwap
    ) Ownable(msg.sender) {
        USDT = IERC20(_usdt);
        UETH = IERC20(_ueth);
        hyperSwap = IHyperSwapV3(_hyperSwap);
    }

    function swapUSDTtoUETH(
        address user,
        uint256 amount,
        uint256 amountOutMinimum,
        uint160 sqrtPriceLimitX96
    ) external nonReentrant onlyOwner {
        if (USDT.allowance(user, address(this)) < amount) {
            revert InsufficientApproval();
        }

        bool success = USDT.transferFrom(user, address(this), amount);
        if (!success) revert TransferFailed();

        USDT.approve(address(hyperSwap), amount);

        IHyperSwapV3.ExactInputSingleParams memory params = IHyperSwapV3
            .ExactInputSingleParams({
                tokenIn: address(USDT),
                tokenOut: address(UETH),
                fee: poolFee,
                recipient: user,
                deadline: block.timestamp + 300,
                amountIn: amount,
                amountOutMinimum: amountOutMinimum,
                sqrtPriceLimitX96: sqrtPriceLimitX96
            });

        uint256 UETHReceived = hyperSwap.exactInputSingle(params);
        if (UETHReceived == 0) revert SwapFailed();

        emit UETHStrategyExecuted(user, amount, UETHReceived, block.timestamp);
    }

    function getUserAllowance(address user) external view returns (uint256) {
        return USDT.allowance(user, address(this));
    }
}
