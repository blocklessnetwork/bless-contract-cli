const { Command, Argument } = require("commander");
const chalk = require("chalk");
const anchor = require("@coral-xyz/anchor");
const { WALLET_PATH } = require("../../lib/constants");
const {
  getBlsContractClient,
  getPath,
  readKeypair,
  getMetadata,
  bs58Message,
} = require("../utils");
const { PublicKey } = require("@solana/web3.js");

const blessMetaCreateCommand = new Command("create")
  .option(
    "--cluster <cluster>",
    "solana cluster: mainnet, testnet, devnet, localnet, <custom>",
  )
  .option(
    "--programId <programId>",
    "Program ID: Specify the program ID when working on devnet, testnet, or localnet; it will not work on mainnet.",
  )
  .option(
    "--signer <signer>",
    "signer: the signer is the payer of the bless meta, default: " +
    WALLET_PATH,
  )
  .option("--multisig <multisig>", "multisig:  the multisig of the bless meta")
  .option(
    "--squads <true/false>",
    "squads: if squads true, use squads to signature, default is false.",
  )
  .option(
    "--admin <admin>",
    "admin: the admin of the bless meta, the admin will as  payer in squads mode ",
  )
  .description(
    "create-meta: create meta account of the bless meta, the value is base58",
  );
const mint = new Argument("mint", "mint: the public key of the mint token");
mint.required = true;
const uri = new Argument("uri", "the meta data uri.");
uri.required = true;

blessMetaCreateCommand
  .addArgument(mint)
  .addArgument(uri)
  .action(async (mint, uri, options) => {
    options.cluster = options.cluster || "localnet";
    options.signer = options.signer || getPath(WALLET_PATH);
    options.squads = options.squads || false;
    try {
      const keypair = readKeypair(options.signer);
      const client = getBlsContractClient(
        options.cluster,
        keypair,
        options.programId,
      );

      const metaJson = await getMetadata(uri);
      let mintPubkey = new PublicKey(mint);
      const state =
        await client.blessTokenClient.getBlessTokenMetaState(mintPubkey);
      if (options.squads) {
        if (options.multisig == null) {
          console.log(chalk.red("multisig is required."));
          process.exit(1);
        }
        const multisigPda = new PublicKey(options.multisig);
        if (options.admin == null) {
          console.log(chalk.red("admin is required."));
          process.exit(1);
        }
        const adminPubkey = new PublicKey(options.admin);
        if (state.admin.toBase58() != adminPubkey.toBase58()) {
          console.log(
            chalk.red(
              "create is denied, admin is not matched, the state admin is " +
              state.admin.toBase58(),
            ),
          );
          process.exit(1);
        }
        const tx = await client.blessTokenClient.getCreateMetadataTx(
          mintPubkey,
          adminPubkey,
          {
            name: metaJson.name,
            symbol: metaJson.symbol,
            uri,
          },
          { signer: adminPubkey },
        );
        const itx = await bs58Message(
          client.connection,
          tx.instructions,
          keypair,
        );
        console.log(
          "bless token metadata create account transaction created, " + itx,
        );
      } else {
        options.admin = options.admin || getPath(WALLET_PATH);
        const adminKeypair = readKeypair(options.admin);
        if (state.admin.toBase58() != adminKeypair.publicKey.toBase58()) {
          console.log(
            chalk.red(
              "create is denied, admin is not matched, the state admin is " +
              state.admin.toBase58(),
            ),
          );
          process.exit(1);
        }
        await client.blessTokenClient.createMetadata(
          mintPubkey,
          adminKeypair.publicKey,
          {
            name: metaJson.name,
            symbol: metaJson.symbol,
            uri,
          },
          {
            signer: keypair.publicKey,
            signerKeypair: [keypair, adminKeypair],
          },
        );
      }
      console.log(chalk.green("bless token metadata create account success."));
      process.exit(0);
    } catch (e) {
      console.log(chalk.red("bless token metadata create account fail: " + e));
      process.exit(1);
    }
  });

module.exports = blessMetaCreateCommand;
