const { Command, Argument } = require("commander");
const { getPath, readKeypair, getConnection } = require("./utils");
const { WALLET_PATH } = require("../lib/constants");
const Loader = require("./loader");
const chalk = require("chalk");
const nacl = require("tweetnacl");
const { PublicKey, Transaction } = require("@solana/web3.js");

const upgradeCommand = new Command("upgrade")
  .option(
    "--cluster <cluster>",
    "solana cluster: mainnet, testnet, devnet, localnet, <custom>",
  )
  .option(
    "--authority <authority>",
    "the authority is the keypair, defualt: " + WALLET_PATH,
  )
  .option("--payer <payer>", "the default payer: " + WALLET_PATH)
  .description("upgrade: upgrade the account");
const programId = new Argument(
  "programId",
  "programId: the program id (base58 value)",
);
const buffer = new Argument(
  "buffer",
  "buffer: the buffer account (base58 value)",
);
upgradeCommand
  .addArgument(buffer)
  .addArgument(programId)
  .action(async (buffer, programId, options) => {
    options.authority = options.authority || getPath(WALLET_PATH);
    options.payer = options.payer || getPath(WALLET_PATH);
    options.cluster = options.cluster || "localnet";
    try {
      const authorityKeypair = readKeypair(options.authority);
      const payerKeypair = readKeypair(options.payer);

      const programIdPK = new PublicKey(programId);
      const bufferPK = new PublicKey(buffer);
      const upgradeIx = await Loader.upgradeInstruction(
        programIdPK,
        bufferPK,
        authorityKeypair.publicKey,
        authorityKeypair.publicKey,
      );
      const connection = getConnection(options.cluster);
      const transaction = new Transaction();
      transaction.instructions = [upgradeIx];

      transaction.recentBlockhash = (
        await connection.getLatestBlockhash()
      ).blockhash;
      transaction.feePayer = payerKeypair.publicKey;
      const message = transaction.compileMessage();
      const messageBytes = message.serialize();
      const signature = nacl.sign.detached(
        messageBytes,
        authorityKeypair.secretKey,
      );
      transaction.sign(payerKeypair);
      transaction.addSignature(authorityKeypair.publicKey, signature);
      transaction.verifySignatures();
      const tx = await connection.sendRawTransaction(transaction.serialize());
      console.log(chalk.green("program upgrade success: " + tx));
    } catch (e) {
      console.log(chalk.red("program upgrade fail: " + e));
    }
  });

module.exports = upgradeCommand;
