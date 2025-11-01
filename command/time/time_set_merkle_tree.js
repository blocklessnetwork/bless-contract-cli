const { Command, Argument } = require("commander");
const {
  getBlsTimeContractClient,
  getPath,
  readKeypair,
  bs58Message,
} = require("../utils");
const { WALLET_PATH } = require("../../lib/constants");
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
  .option(
    "--programId <programId>",
    "Program ID: Specify the program ID when working on devnet, testnet, or localnet; it will not work on mainnet.",
  )
  .option(
    "--squads <true/false>",
    "squads: if squads true, use squads to signature, default is false.",
  )
  .option(
    "--admin <admin>",
    "pending: if squads true, use admin to signature in squads",
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
      let mintPubkey = null;
      try {
        mintPubkey = new PublicKey(mint);
      } catch (e) {
        console.log(chalk.red("invalid mint parameter: " + e));
        process.exit(1);
      }
      const client = getBlsTimeContractClient(
        options.cluster,
        keypair,
        options.programId,
      );
      const state = await client.blessTimeClient.getTimeState(mintPubkey);
      if (options.squads) {
        if (options.admin == null) {
          console.log(chalk.green("admin is required."));
          process.exit(1);
        }
        const admin = new PublicKey(options.admin);
        if (state.adminAccount.toBase58() != admin.toBase58()) {
          console.log(
            chalk.red(
              "set merkle tree is denied, admin is not matched, the state  admin is " +
              state.adminAccount.toBase58(),
            ),
          );
          process.exit(1);
        }
        let merkleTreeRootBuff = null;
        try {
          merkleTreeRootBuff = new PublicKey(merkleTreeRoot).toBuffer();
        } catch (e) {
          console.log(chalk.red("invalid merkle tree parameter: " + e));
          process.exit(1);
        }
        const tx = await client.blessTimeClient.getSetMerkleTreeRootTx(
          mintPubkey,
          merkleTreeRootBuff,
          { signer: admin },
        );
        const itx = await bs58Message(
          client.connection,
          tx.instructions,
          keypair,
        );
        console.log(
          "bless time set merkle tree root transaction created: \n" + itx,
        );
      } else {
        const keypair = readKeypair(options.signer);
        if (state.adminAccount.toBase58() != keypair.publicKey.toBase58()) {
          console.log(
            chalk.red(
              "set merkle tree is denied, admin is not matched, the state  admin is " +
              state.adminAccount.toBase58(),
            ),
          );
          process.exit(1);
        }

        let merkleTreeRootBuff = null;
        try {
          merkleTreeRootBuff = new PublicKey(merkleTreeRoot).toBuffer();
        } catch (e) {
          console.log(chalk.red("invalid merkle tree parameter: " + e));
          process.exit(1);
        }
        await client.blessTimeClient.setMerkleTreeRoot(
          mintPubkey,
          merkleTreeRootBuff,
        );
        console.log(chalk.green("set merkle tree success."));
        process.exit(0);
      }
    } catch (e) {
      console.log(chalk.red("set merkle tree fail: " + e));
      process.exit(1);
    }
  });

module.exports = timeSetMerkleRootCommand;
