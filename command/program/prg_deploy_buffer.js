const { Command, Argument } = require("commander");
const { getPath, readKeypair, getConnection } = require("../utils");
const { WALLET_PATH } = require("../../lib/constants");
const Loader = require("./loader");
const chalk = require("chalk");
const nacl = require("tweetnacl");
const fs = require("node:fs");
const { PublicKey, Transaction } = require("@solana/web3.js");
const { stat } = require("node:fs/promises");

const deployBufferCommand = new Command("deploy-buffer")
  .option(
    "--cluster <cluster>",
    "solana cluster: mainnet, testnet, devnet, localnet, <custom>",
  )
  .option(
    "--authority <authority>",
    "the authority keypair file (default: " + WALLET_PATH + ")",
  )
  .option("--payer <payer>", "the default payer: " + WALLET_PATH)
  .description("Deploy a program from the buffer account.");
const programId = new Argument(
  "programId",
  "programId: the program id is the keypair",
);
programId.required = true;
const buffer = new Argument(
  "buffer",
  "buffer: the buffer account (base58 value)",
);
buffer.required = true;
const file = new Argument("path", "path: the program file path.");
file.required = true;
deployBufferCommand
  .addArgument(file)
  .addArgument(buffer)
  .addArgument(programId)
  .action(async (file, buffer, programId, options) => {
    options.authority = options.authority || getPath(WALLET_PATH);
    options.payer = options.payer || getPath(WALLET_PATH);
    options.cluster = options.cluster || "localnet";
    try {
      const authorityKeypair = readKeypair(options.authority);
      const payerKeypair = readKeypair(options.payer);

      const programIdPK = readKeypair(programId);
      const bufferPK = new PublicKey(buffer);
      const state = fs.statSync(file);

      const connection = getConnection(options.cluster);
      const deployTx = await Loader.getDeployBufferTransaction(
        connection,
        payerKeypair.publicKey,
        { length: state.size },
        programIdPK.publicKey,
        bufferPK,
        authorityKeypair.publicKey,
      );

      deployTx.recentBlockhash = (
        await connection.getLatestBlockhash()
      ).blockhash;
      deployTx.feePayer = payerKeypair.publicKey;
      const message = deployTx.compileMessage();
      const messageBytes = message.serialize();
      let signature = nacl.sign.detached(
        messageBytes,
        authorityKeypair.secretKey,
      );

      deployTx.addSignature(authorityKeypair.publicKey, signature);

      signature = nacl.sign.detached(messageBytes, programIdPK.secretKey);
      deployTx.addSignature(programIdPK.publicKey, signature);

      signature = nacl.sign.detached(messageBytes, payerKeypair.secretKey);
      deployTx.addSignature(payerKeypair.publicKey, signature);

      const tx = await connection.sendRawTransaction(deployTx.serialize());
      console.log(chalk.green("program deploy success: " + tx));
    } catch (e) {
      console.log(chalk.red("program deploy fail: " + e));
    }
  });

module.exports = deployBufferCommand;
