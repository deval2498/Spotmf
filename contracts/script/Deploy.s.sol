// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {Script, console} from "forge-std/Script.sol";
import {UBTCStrategySwap} from "../src/UBTCStrategySwap.sol";

/**
 * @title DeployUBTCStrategySwap
 * @dev Deployment script for UBTCStrategySwap contract
 *
 * Usage:
 * forge script script/Deploy.s.sol:DeployUBTCStrategySwap --rpc-url $RPC_URL --private-key $PRIVATE_KEY --broadcast --verify
 *
 * Environment variables needed:
 * - PRIVATE_KEY: Deployer private key
 * - RPC_URL: Network RPC URL
 * - ETHERSCAN_API_KEY: For contract verification
 * - USDT_ADDRESS: USDT token address (optional, will use chain defaults)
 * - UBTC_ADDRESS: UBTC token address (optional, will use chain defaults)
 * - HYPERSWAP_ADDRESS: HyperSwap V3 router address (optional, will use chain defaults)
 */
contract DeployUBTCStrategySwap is Script {
    struct NetworkConfig {
        address usdt;
        address ubtc;
        address hyperSwap;
        string networkName;
    }

    // State variable to track deployed contract
    UBTCStrategySwap public ubtcStrategySwap;

    // Events for tracking deployment
    event UBTCStrategySwapDeployed(
        address contractAddress,
        uint256 blockNumber,
        uint256 chainId
    );

    function run() external {
        // Load network configuration
        NetworkConfig memory config = getNetworkConfig();

        // Validate configuration
        validateConfig(config);

        // Start broadcasting transactions
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        // Get deployer address and log deployment info
        address deployer = vm.addr(deployerPrivateKey);
        console.log("=== UBTCStrategySwap Deployment ===");
        console.log("Network:", config.networkName);
        console.log("Chain ID:", block.chainid);
        console.log("Deployer:", deployer);
        console.log("Deployer balance:", deployer.balance);

        // Ensure sufficient balance for deployment
        require(
            deployer.balance > 0.01 ether,
            "Insufficient balance for deployment"
        );

        // Log constructor parameters
        console.log("\nConstructor Parameters:");
        console.log("USDT address:", config.usdt);
        console.log("UBTC address:", config.ubtc);
        console.log("HyperSwap address:", config.hyperSwap);

        // Deploy the contract
        console.log("\nDeploying UBTCStrategySwap...");
        ubtcStrategySwap = new UBTCStrategySwap(
            config.usdt,
            config.ubtc,
            config.hyperSwap
        );

        // Emit deployment event
        emit UBTCStrategySwapDeployed(
            address(ubtcStrategySwap),
            block.number,
            block.chainid
        );

        // Stop broadcasting
        vm.stopBroadcast();

        // Verify deployment
        verifyDeployment(config);

        // Log deployment summary
        logDeploymentSummary(config);
    }

    function getNetworkConfig() internal view returns (NetworkConfig memory) {
        uint256 chainId = block.chainid;

        // Try to load from environment variables first
        address envUsdt = vm.envOr("USDT_ADDRESS", address(0));
        address envUbtc = vm.envOr("UBTC_ADDRESS", address(0));
        address envHyperSwap = vm.envOr("HYPERSWAP_ADDRESS", address(0));

        if (
            envUsdt != address(0) &&
            envUbtc != address(0) &&
            envHyperSwap != address(0)
        ) {
            return
                NetworkConfig({
                    usdt: envUsdt,
                    ubtc: envUbtc,
                    hyperSwap: envHyperSwap,
                    networkName: "Custom"
                });
        }

        // Network-specific configurations
        if (chainId == 1) {
            // Ethereum Mainnet
            return
                NetworkConfig({
                    usdt: 0xdAC17F958D2ee523a2206206994597C13D831ec7, // USDT
                    ubtc: 0x0000000000000000000000000000000000000000, // Replace with actual UBTC address
                    hyperSwap: 0x0000000000000000000000000000000000000000, // Replace with actual HyperSwap address
                    networkName: "Ethereum Mainnet"
                });
        } else if (chainId == 11155111) {
            // Sepolia Testnet
            return
                NetworkConfig({
                    usdt: 0x0000000000000000000000000000000000000000, // Replace with Sepolia USDT
                    ubtc: 0x0000000000000000000000000000000000000000, // Replace with Sepolia UBTC
                    hyperSwap: 0x0000000000000000000000000000000000000000, // Replace with Sepolia HyperSwap
                    networkName: "Sepolia Testnet"
                });
        } else if (chainId == 137) {
            // Polygon Mainnet
            return
                NetworkConfig({
                    usdt: 0xc2132D05D31c914a87C6611C10748AEb04B58e8F, // USDT on Polygon
                    ubtc: 0x0000000000000000000000000000000000000000, // Replace with Polygon UBTC
                    hyperSwap: 0x0000000000000000000000000000000000000000, // Replace with Polygon HyperSwap
                    networkName: "Polygon Mainnet"
                });
        } else if (chainId == 42161) {
            // Arbitrum One
            return
                NetworkConfig({
                    usdt: 0xdAC17F958D2ee523a2206206994597C13D831ec7, // USDT on Arbitrum
                    ubtc: 0x0000000000000000000000000000000000000000, // Replace with Arbitrum UBTC
                    hyperSwap: 0x0000000000000000000000000000000000000000, // Replace with Arbitrum HyperSwap
                    networkName: "Arbitrum One"
                });
        } else if (chainId == 999) {
            // Hyperliquid Mainnet
            return
                NetworkConfig({
                    usdt: 0xB8CE59FC3717ada4C02eaDF9682A9e934F625ebb, // USDT on Polygon
                    ubtc: 0x9FDBdA0A5e284c32744D2f17Ee5c74B284993463, // Replace with Polygon UBTC
                    hyperSwap: 0x4E2960a8cd19B467b82d26D83fAcb0fAE26b094D, // Replace with Polygon HyperSwap
                    networkName: "Hyperliquid Mainnet"
                });
        } else {
            // Unknown network - require env variables
            revert(
                "Unknown network. Please set USDT_ADDRESS, UBTC_ADDRESS, and HYPERSWAP_ADDRESS environment variables"
            );
        }
    }

    function validateConfig(NetworkConfig memory config) internal pure {
        require(config.usdt != address(0), "USDT address cannot be zero");
        require(config.ubtc != address(0), "UBTC address cannot be zero");
        require(
            config.hyperSwap != address(0),
            "HyperSwap address cannot be zero"
        );
        require(
            config.usdt != config.ubtc,
            "USDT and UBTC addresses must be different"
        );
    }

    function verifyDeployment(NetworkConfig memory config) internal view {
        console.log("\nVerifying deployment...");

        // Check contract was deployed
        require(
            address(ubtcStrategySwap) != address(0),
            "Contract deployment failed"
        );

        // Verify constructor parameters were set correctly
        require(
            address(ubtcStrategySwap.USDT()) == config.usdt,
            "USDT address mismatch"
        );
        require(
            address(ubtcStrategySwap.UBTC()) == config.ubtc,
            "UBTC address mismatch"
        );
        require(
            address(ubtcStrategySwap.hyperSwap()) == config.hyperSwap,
            "HyperSwap address mismatch"
        );

        // Verify owner is set correctly
        address deployer = vm.addr(vm.envUint("PRIVATE_KEY"));
        require(
            ubtcStrategySwap.owner() == deployer,
            "Owner not set correctly"
        );

        // Verify pool fee constant
        require(
            ubtcStrategySwap.poolFee() == 3000,
            "Pool fee not set correctly"
        );

        console.log("Deployment verification passed!");
    }

    function logDeploymentSummary(NetworkConfig memory config) internal view {
        console.log("\n=== DEPLOYMENT SUMMARY ===");
        console.log("Network:", config.networkName);
        console.log("Chain ID:", block.chainid);
        console.log("Block Number:", block.number);
        console.log("Gas Price:", tx.gasprice);
        console.log("Timestamp:", block.timestamp);

        console.log("Contract Details:");
        console.log("UBTCStrategySwap:", address(ubtcStrategySwap));
        console.log("Owner:", ubtcStrategySwap.owner());
        console.log("Pool Fee:", ubtcStrategySwap.poolFee());

        console.log("\nToken Addresses:");
        console.log("USDT:", address(ubtcStrategySwap.USDT()));
        console.log("UBTC:", address(ubtcStrategySwap.UBTC()));
        console.log("HyperSwap:", address(ubtcStrategySwap.hyperSwap()));

        console.log("\nVerification Command:");
        console.log("forge verify-contract", address(ubtcStrategySwap));
        console.log("src/UBTCStrategySwap.sol:UBTCStrategySwap");
        console.log("--chain-id", vm.toString(block.chainid));
        console.log("--constructor-args", encodeConstructorArgs(config));
        console.log("--etherscan-api-key $ETHERSCAN_API_KEY");

        console.log("\nSave this address for your records:");
        console.log("UBTCStrategySwap:", address(ubtcStrategySwap));
        console.log("==========================\n");
    }

    function encodeConstructorArgs(
        NetworkConfig memory config
    ) internal pure returns (string memory) {
        bytes memory encodedArgs = abi.encode(
            config.usdt,
            config.ubtc,
            config.hyperSwap
        );
        return vm.toString(encodedArgs);
    }
}
