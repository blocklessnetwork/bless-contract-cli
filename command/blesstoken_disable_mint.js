const { Command, Argument } = require("commander");
const {
  getBlsContractClient,
  getPath,
  readKeypair,
  bs58Message,
} = require("./utils");
const { WALLET_PATH } = require("../lib/constants");
const chalk = require("chalk");
const { PublicKey } = require("@solana/web3.js");
const BLESS_CONTRACT_STATE_SEED = "bless_contract_state";

const blessTokenDisableMintCommand = new Command("blesstoken-disable-mint")
  .alias("blesstoken_disable_mint")
  .alias("disable-mint")
  .alias("disable_mint")
  .option(
    "--cluster <cluster>",
    "solana cluster: mainnet, testnet, devnet, localnet, <custom>",
  )
  .option(
    "--signer <signer>",
    "the signer is the payer/admin of bless token meta: " + WALLET_PATH,
  )
  .option(
    "--programId <programId>",
    "Program ID: Specify the program ID when working on devnet, testnet, or localnet; it will not work on mainnet.",
  )
  .option(
    "--squads <true/false>",
    "squads: if squads true, use squads to signature, default is false.",
  )
  .option("--admin <admin>", "admin pubkey when using squads mode.")
  .description("disable-mint: disable bless token mint authority.");

const mint = new Argument(
  "mint",
  "mint: the mint is the mint token base58 value ",
);
mint.required = true;

blessTokenDisableMintCommand.addArgument(mint).action(async (mint, options) => {
  options.cluster = options.cluster || "localnet";
  options.signer = options.signer || getPath(WALLET_PATH);
  try {
    const keypair = readKeypair(options.signer);
    let mintPubkey = null;
    try {
      mintPubkey = new PublicKey(mint);
    } catch (e) {
      console.log(chalk.red("invaild mint parameter: " + e));
      process.exit(1);
    }
    const client = getBlsContractClient(
      options.cluster,
      keypair,
      options.programId,
    );
    const [blessStatePda] = PublicKey.findProgramAddressSync(
      [Buffer.from(BLESS_CONTRACT_STATE_SEED), mintPubkey.toBuffer()],
      client.programId,
    );
    const state = await client.blessTokenClient.getBlessTokenMetaState(mintPubkey);

    if (options.squads) {
      if (options.admin == null) {
        console.log(chalk.red("admin is required."));
        process.exit(1);
      }
      const admin = new PublicKey(options.admin);
      if (state.admin.toBase58() != admin.toBase58()) {
        console.log(
          chalk.red(
            "disable mint is denied, admin is not matched, the state admin is " +
              state.admin.toBase58(),
          ),
        );
        process.exit(1);
      }
      const tx = await client.blessTokenClient.getDisableMintTx(
        mintPubkey,
        { signer: admin },
      );
      const itx = await bs58Message(
        client.connection,
        tx.instructions,
        keypair,
      );
      console.log("bless token disable mint transaction created: \n" + itx);
    } else {
      if (state.admin.toBase58() != keypair.publicKey.toBase58()) {
        console.log(
          chalk.red(
            "disable mint is denied, admin is not matched, the state admin is " +
              state.admin.toBase58(),
          ),
        );
        process.exit(1);
      }

      await client.blessTokenClient.disableMint(
        mintPubkey,
        blessStatePda,
        {
          signer: keypair.publicKey,
          signerKeypair: [keypair],
        },
      );
      console.log(chalk.green("disable mint success."));
      process.exit(0);
    }
  } catch (e) {
    console.log(e);
    console.log(chalk.red("disable mint fail: " + e));
    process.exit(1);
  }
});

module.exports = blessTokenDisableMintCommand;
