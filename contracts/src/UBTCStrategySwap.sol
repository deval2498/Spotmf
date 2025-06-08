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

// src/UBTCStrategySwap.sol
contract UBTCStrategySwap is ReentrancyGuard, Ownable {
    IERC20 public immutable USDT;
    IERC20 public immutable UBTC;
    IHyperSwapV3 public immutable hyperSwap;
    uint24 public constant poolFee = 3000; // 0.3%

    error InsufficientApproval();
    error SwapFailed();
    error TransferFailed();

    event UBTCStrategyExecuted(
        address indexed user,
        uint256 usdtAmount,
        uint256 ubtcReceived,
        uint256 timestamp
    );

    constructor(
        address _usdt,
        address _ubtc,
        address _hyperSwap
    ) Ownable(msg.sender) {
        USDT = IERC20(_usdt);
        UBTC = IERC20(_ubtc);
        hyperSwap = IHyperSwapV3(_hyperSwap);
    }

    function swapUSDTtoUBTC(
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
                tokenOut: address(UBTC),
                fee: poolFee,
                recipient: user,
                deadline: block.timestamp + 300,
                amountIn: amount,
                amountOutMinimum: amountOutMinimum,
                sqrtPriceLimitX96: sqrtPriceLimitX96
            });

        uint256 ubtcReceived = hyperSwap.exactInputSingle(params);
        if (ubtcReceived == 0) revert SwapFailed();

        emit UBTCStrategyExecuted(user, amount, ubtcReceived, block.timestamp);
    }

    function getUserAllowance(address user) external view returns (uint256) {
        return USDT.allowance(user, address(this));
    }
}
