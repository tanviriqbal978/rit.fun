// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./BondingToken.sol";

contract TokenFactory {
    struct TokenInfo {
        address tokenAddress;
        string name;
        string symbol;
        string description;
        address creator;
        uint256 createdAt;
    }

    TokenInfo[] public allTokens;
    mapping(address => bool) public isTokenDeployed;

    event TokenCreated(address indexed tokenAddress, string name, string symbol, address creator);
    event GlobalTrade(address indexed token, address indexed trader, uint256 amount, uint256 price, bool isBuy, uint256 timestamp);

    function createToken(string memory name, string memory symbol, string memory description) external returns (address) {
        BondingToken newToken = new BondingToken(
            name,
            symbol,
            description,
            msg.sender,
            address(this)
        );
        
        address tokenAddress = address(newToken);
        allTokens.push(TokenInfo({
            tokenAddress: tokenAddress,
            name: name,
            symbol: symbol,
            description: description,
            creator: msg.sender,
            createdAt: block.timestamp
        }));
        
        isTokenDeployed[tokenAddress] = true;
        
        emit TokenCreated(tokenAddress, name, symbol, msg.sender);
        return tokenAddress;
    }

    function getAllTokens() external view returns (TokenInfo[] memory) {
        return allTokens;
    }

    function getTokenCount() external view returns (uint256) {
        return allTokens.length;
    }

    // Called by BondingToken to notify factory of trades
    function emitTrade(address token, address trader, uint256 amount, uint256 price, bool isBuy) external {
        require(isTokenDeployed[msg.sender], "Only deployed tokens can emit trades");
        emit GlobalTrade(token, trader, amount, price, isBuy, block.timestamp);
    }
}
