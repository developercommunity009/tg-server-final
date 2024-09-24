require('dotenv').config();
const hre = require("hardhat");
const { ethers } = hre;

const Web3 = require('web3');
const fs = require('fs');
const path = require('path');
const solc = require('solc');



const deployContract = async (name, ticker, description, totalSupply, liquidity ,telegramLink , twitterLink , website) => {
    console.log("deployContract    ===>>",name, ticker, description, totalSupply, liquidity ,telegramLink , twitterLink , website)
    try {
        

        // Use the private key passed from the frontend
        const wallet = new hre.ethers.Wallet(privateKey, hre.ethers.provider);

        // Compile the contract with optimization
        await hre.run('compile');

        // Get the contract factory
        const Contract = await hre.ethers.getContractFactory("MyToken", wallet);

        // Create a deployment transaction
        const deployTransaction = Contract.getDeployTransaction(
            taxwallet, 
            teamWallet, 
            liqFee * 10, 
            mFee * 10, 
            uFee * 10, 
            tFee * 10, 
            bFee * 10
        );

        // Estimate the gas limit for the deployment transaction
        const estimatedGasLimit = await hre.ethers.provider.estimateGas({
            ...deployTransaction,
            from: wallet.address
        });

        // Get the current gas price and set a slightly higher gas price if necessary
        const gasPrice = await hre.ethers.provider.getGasPrice();

        // Set higher priority fee to avoid underpriced transaction error
        const maxPriorityFeePerGas = hre.ethers.utils.parseUnits('30', 'gwei'); // 30 Gwei tip
        const maxFeePerGas = gasPrice.add(maxPriorityFeePerGas);
        // Calculate the estimated gas fee in ETH
        const estimatedGasFeeInWei = estimatedGasLimit.mul(maxFeePerGas);
        const estimatedGasFeeInEth = hre.ethers.utils.formatEther(estimatedGasFeeInWei);
        // Estimated gas fee in ETH

        console.log(`Estimated gas fee: ${estimatedGasFeeInEth} ETH`);

        // Deploy the contract with optimization and adjusted gas parameters
        const contract = await Contract.deploy(
            taxwallet, 
            teamWallet, 
            liqFee * 10, 
            mFee * 10, 
            uFee * 10, 
            tFee * 10, 
            bFee * 10, 
            {
                gasLimit: estimatedGasLimit,
                maxPriorityFeePerGas: maxPriorityFeePerGas,
                maxFeePerGas: maxFeePerGas
            }
        );

        // Wait for the deployment to complete
        await contract.deployed();

        console.log(`Contract deployed at address: ${contract.address}`);

        return {
            contractAddress: contract.address
        };
    } catch (error) {
        console.error('Deployment error:', error);
        throw error;
    }
};








module.exports = deployContract;



