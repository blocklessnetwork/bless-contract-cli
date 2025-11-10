const { Command, Argument } = require("commander");
const {
  getBlsContractClient,
  getPath,
  readKeypair,
  BlessTokenAccounts,
} = require("./utils");
const { WALLET_PATH } = require("../lib/constants");
const anchor = require("@coral-xyz/anchor");
const chalk = require("chalk");
const { PublicKey } = require("@solana/web3.js");
const blesstokenCommand = new Command("blesstoken")
  .option(
    "--cluster <cluster>",
    "solana cluster: mainnet, testnet, devnet, localnet, <custom>",
  )
  .option(
    "--programId <programId>",
    "Program ID: Specify the program ID when working on devnet, testnet, or localnet; it will not work on mainnet.",
  )
  .option("--payer <payer>", "the default payer: " + WALLET_PATH)
  .description(
    "blesstoken: initial blesstoken token mint and disptch bless token to wallet1-5 by rules. ",
  );
const wallets = new Argument(
  "wallets",
  "wallets: wallets is the wallet 1-5 that distrubuted the bless token by the contract, value should be base58 sperate by `,`. \n" +
    "Wallet1 is Investor, Wallet2 is (Team + advisor), Wallet3 is Foundation, Wallet4 is (Ecosystem + Liquidity Provision + TGE Marketing), Wallet5 is (Community Rewards)",
);
wallets.required = true;
const mint = new Argument("mint", "mint: the mint token public key(base58)");
mint.required = true;
const mintAuthority = new Argument(
  "mintAuthority",
  "mintAuthority: the mint authority, the value is file path of mintAuthority",
);
blesstokenCommand
  .addArgument(wallets)
  .addArgument(mint)
  .addArgument(mintAuthority)
  .action(async (wallets, mint, mintAuthority, options) => {
    options.cluster = options.cluster || "localnet";
    options.signer = options.payer || getPath(WALLET_PATH);
    try {
      const keypair = readKeypair(options.signer);
      const client = getBlsContractClient(
        options.cluster,
        keypair,
        options.programId,
      );
      if (wallets == null || wallets == "") {
        console.log(chalk.red("invalid wallet parameter."));
        process.exit(1);
      }

      if (mint == null || mint == "") {
        console.log(chalk.red("invalid mint parameter."));
        process.exit(1);
      }

      if (mintAuthority == null || mintAuthority == "") {
        console.log(chalk.red("invalid mintAuthority parameter."));
        process.exit(1);
      }

      mintAuthority = readKeypair(mintAuthority);

      let walletList = wallets.split(",");
      if (walletList.length != 5) {
        console.log(chalk.green("wallet must be 1-5 value, sperate by `,`"));
        process.exit(1);
      }
      let walletPk = [];
      for (let wallat of walletList) {
        walletPk.push(new PublicKey(wallat));
      }
      mint = new PublicKey(mint);
      let accts = new BlessTokenAccounts();
      accts.walletInvestor = walletPk[0];
      accts.walletTeamAdvisor = walletPk[1];
      accts.walletFoundation = walletPk[2];
      accts.walletEcosystemLiquidityprovisionTgtmarketing = walletPk[3];
      accts.walletCommunityRewards = walletPk[4];

      await client.blessTokenClient.initialBlessTokenState(
        accts,
        mint,
        mintAuthority,
        {
          signer: keypair.publicKey,
          signerKeypair: [keypair, mintAuthority],
        },
      );
      console.log(chalk.green("bless token initial success."));
      process.exit(0);
    } catch (e) {
      console.log(chalk.red("bless token  initial failed: " + e));
      process.exit(1);
    }
  });

module.exports = blesstokenCommand;
