const { Command, Argument } = require("commander");
const anchor = require("@coral-xyz/anchor");
const chalk = require("chalk");
const ed = require("@noble/ed25519");
const { getBlsRegisterClient, getPath, readKeypair } = require("./utils");
const { WALLET_PATH } = require("../lib/constants");
const { PublicKey } = require("@solana/web3.js");

const registerDoCommand = new Command("register")
  .option(
    "--cluster <cluster>",
    "solana cluster: mainnet, testnet, devnet, localnet, <custom>",
  )
  .option(
    "--pindex <page index>",
    "page index: solana bless node page index, default: 0",
  )
  .option("--wallet <wallet>", "wallet: user wallet, default: " + WALLET_PATH)
  .option(
    "--bnsigner <bnsigner>",
    "bnsigner: backend signer, default: " + WALLET_PATH,
  )
  .description("register: register node id on chain");
const nodeid = new Argument(
  "nodeid",
  "nodeid: the node id combime with page index as bless node id, nodeid must be base58 of 32 bytes ",
);
nodeid.required = true;
registerDoCommand.addArgument(nodeid).action(async (nodeid, options) => {
  let pindex = 0;
  if (!isNaN(options.pindex)) {
    pindex = parseInt(options.pindex);
  }

  options.wallet = options.wallet || getPath(WALLET_PATH);
  options.bnsigner = options.bnsigner || getPath(WALLET_PATH);
  options.cluster = options.cluster || "localnet";
  try {
    if (nodeid == null) {
      throw new Error("nodeid must not be null.");
    }
    const blessNodeId = new Uint8Array(36);
    blessNodeId.set(new anchor.BN(pindex).toBuffer("le", 4), 0);
    const nodeId = new PublicKey(nodeid).toBytes();

    blessNodeId.set(nodeId, 4);
    const signTimestamp = new anchor.BN(new Date().getTime());
    const keypair = readKeypair(options.wallet);
    const client = getBlsRegisterClient(options.cluster, keypair);
    const backendSigner = readKeypair(options.bnsigner);
    const signMsg = await client.nodeRegistrationClient.createRegisterMessage(
      blessNodeId,
      keypair.publicKey,
      signTimestamp,
    );
    const signature = await ed.sign(
      signMsg,
      backendSigner.secretKey.slice(0, 32),
    );

    await client.nodeRegistrationClient.register(
      blessNodeId,
      backendSigner.publicKey,
      signTimestamp,
      signature,
      {
        signer: keypair.publicKey,
        signerKeypair: keypair,
      },
    );
    console.log(chalk.green("register success "));
    process.exit(0);
  } catch (e) {
    console.log(chalk.red("register bless node id fail: " + e));
    process.exit(1);
  }
});

module.exports = registerDoCommand;
