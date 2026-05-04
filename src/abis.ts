
export const FACTORY_ABI = [
  "function createToken(string name, string symbol, string description) external returns (address)",
  "function getAllTokens() external view returns (tuple(address tokenAddress, string name, string symbol, string description, address creator, uint256 createdAt)[])",
  "function getTokenCount() external view returns (uint256)",
  "event TokenCreated(address indexed tokenAddress, string name, string symbol, address creator)",
  "event GlobalTrade(address indexed token, address indexed trader, uint256 amount, uint256 price, bool isBuy, uint256 timestamp)"
];

export const TOKEN_ABI = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function description() view returns (string)",
  "function creator() view returns (address)",
  "function totalSupply() view returns (uint256)",
  "function balanceOf(address) view returns (uint256)",
  "function fundingReached() view returns (bool)",
  "function getBuyPrice(uint256 amount) view returns (uint256)",
  "function getSellPrice(uint256 amount) view returns (uint256)",
  "function buy(uint256 amount) payable",
  "function sell(uint256 amount)",
  "event Transfer(address indexed from, address indexed to, uint256 value)",
  "event Trade(address indexed trader, uint256 amount, uint256 price, bool isBuy, uint256 timestamp)"
];
