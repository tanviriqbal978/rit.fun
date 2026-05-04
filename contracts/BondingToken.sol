// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface ITokenFactory {
    function emitTrade(address token, address trader, uint256 amount, uint256 price, bool isBuy) external;
}

contract BondingToken {
    string public name;
    string public symbol;
    string public description;
    address public creator;
    address public factory;

    uint256 public totalSupply;
    mapping(address => uint256) public balanceOf;
    
    uint256 public constant MAX_SUPPLY = 1_000_000_000 * 10**18; // 1 Billion
    uint256 public constant INITIAL_PRICE = 0.0000001 ether;
    uint256 public constant PRICE_STEP = 0.0000000001 ether; // Simple linear increase
    
    uint256 public constant FUNDING_GOAL = 69_000 ether;
    bool public fundingReached = false;

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Trade(address indexed trader, uint256 amount, uint256 price, bool isBuy, uint256 timestamp);

    constructor(
        string memory _name,
        string memory _symbol,
        string memory _description,
        address _creator,
        address _factory
    ) {
        name = _name;
        symbol = _symbol;
        description = _description;
        creator = _creator;
        factory = _factory;
    }

    function getBuyPrice(uint256 amount) public view returns (uint256) {
        // Price = Initial + (Step * CurrentSupply/1e18) * amount/1e18
        // This is a rough linear approximation for simplicity
        uint256 currentPrice = INITIAL_PRICE + (PRICE_STEP * (totalSupply / 10**18));
        return (currentPrice * amount) / 10**18;
    }

    function getSellPrice(uint256 amount) public view returns (uint256) {
        uint256 currentPrice = INITIAL_PRICE + (PRICE_STEP * (totalSupply / 10**18));
        // Apply a small fee or just return market value
        return (currentPrice * amount) / 10**18;
    }

    function buy(uint256 amount) external payable {
        require(!fundingReached, "Funding goal reached, bonding curve closed");
        uint256 cost = getBuyPrice(amount);
        require(msg.value >= cost, "Insufficient RITUAL sent");

        totalSupply += amount;
        require(totalSupply <= MAX_SUPPLY, "Exceeds max supply");
        balanceOf[msg.sender] += amount;

        emit Transfer(address(0), msg.sender, amount);
        emit Trade(msg.sender, amount, cost / (amount / 10**18), true, block.timestamp);
        
        // Notify factory for global event tracking if needed
        try ITokenFactory(factory).emitTrade(address(this), msg.sender, amount, cost / (amount / 10**18), true) {} catch {}

        if (address(this).balance >= FUNDING_GOAL) {
            fundingReached = true;
            // Logic for auto-liquidity would go here
        }
    }

    function sell(uint256 amount) external {
        require(!fundingReached, "Funding goal reached, bonding curve closed");
        require(balanceOf[msg.sender] >= amount, "Insufficient balance");

        uint256 refund = getSellPrice(amount);
        require(address(this).balance >= refund, "Insufficient contract liquidity");

        balanceOf[msg.sender] -= amount;
        totalSupply -= amount;

        emit Transfer(msg.sender, address(0), amount);
        emit Trade(msg.sender, amount, refund / (amount / 10**18), false, block.timestamp);
        
        try ITokenFactory(factory).emitTrade(address(this), msg.sender, amount, refund / (amount / 10**18), false) {} catch {}

        payable(msg.sender).transfer(refund);
    }
}
