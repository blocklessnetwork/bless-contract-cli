const SOLANA_CLUSTERS = [
  {
    name: "mainnet",
    url: "https://api.mainnet-beta.solana.com",
    cluster: "mainnet-beta",
  },
  {
    name: "testnet",
    url: "https://api.testnet.solana.com",
    cluster: "testnet",
  },
  {
    name: "devnet",
    url: "https://api.devnet.solana.com",
  },
  {
    name: "localnet",
    url: "http://localhost:8899",
    cluster: "custom",
  },
];

const WALLET_PATH = "~/.config/solana/id.json";

module.exports = {
  SOLANA_CLUSTERS,
  WALLET_PATH,
};
