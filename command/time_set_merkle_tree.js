const { Command, Argument } = require("commander");
const { getBlsTimeContractClient, getPath, readKeypair } = require("./utils");
const { WALLET_PATH } = require("../lib/constants");
const chalk = require("chalk");
const { PublicKey } = require("@solana/web3.js");
const timeSetMerkleRootCommand = new Command("merkle-root")
  .option(
    "--cluster <cluster>",
    "solana cluster: mainnet, testnet, devnet, localnet, <custom>",
  )
  .option(
    "--signer <signer>",
    "the signer is the admin of  the time contract: " + WALLET_PATH,
  )
  .description("merkle-root: set the merkle tree root.");
const merkleTreeRoot = new Argument(
  "root",
  "root: the root is merkle tree root value， must be base58 encoding.",
);
merkleTreeRoot.required = true;
const mint = new Argument(
  "mint",
  "mint: the mint is the mint token base58 value ",
);
mint.required = true;
timeSetMerkleRootCommand
  .addArgument(mint)
  .addArgument(merkleTreeRoot)
  .action(async (mint, merkleTreeRoot, options) => {
    options.cluster = options.cluster || "localnet";
    options.signer = options.signer || getPath(WALLET_PATH);
    try {
      const keypair = readKeypair(options.signer);
      const client = getBlsTimeContractClient(options.cluster, keypair);
      let merkleTreeRootBuff = null;
      try {
        merkleTreeRootBuff = new PublicKey(merkleTreeRoot).toBuffer();
      } catch (e) {
        console.log(chalk.red("invaild merkle tree parameter: " + e));
        process.exit(1);
      }
      await client.blessTimeClient.setMerkleTreeRoot(mint, merkleTreeRootBuff);
      console.log(chalk.green("set merkle tree success."));
      process.exit(0);
    } catch (e) {
      console.log(chalk.red("set merkle tree fail: " + e));
      process.exit(1);
    }
  });

module.exports = timeSetMerkleRootCommand;
