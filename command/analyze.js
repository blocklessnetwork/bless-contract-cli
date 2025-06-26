const { Command, Argument } = require("commander");
const { getBlsRegisterClient, getPath, readKeypair } = require("./utils");
const anchor = require("@coral-xyz/anchor");
const chalk = require("chalk");
const { Keypair } = require("@solana/web3.js");
const fs = require("node:fs");
const analyzeCommand = new Command("analyze")
  .option(
    "--pindex <page index>",
    "page index: solana bless node page index, default: 0",
  )
  .description("analyze: analyze the register user assests");
const file = new Argument(
  "whitelist",
  `the assests whitelist, the whitelist contents like {"TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA": 150}`,
);
file.required = false;
analyzeCommand.addArgument(file).action(async (file, options) => {
  options.cluster = options.cluster || "localnet";
  const keypair = Keypair.generate();
  const client = getBlsRegisterClient(options.cluster, keypair);
  let rs = null;
  let pageIndex = 0;
  if (!isNaN(options.pindex)) {
    pageIndex = parseInt(options.pindex);
  }
  let whiteList = null;

  if (file != null && fs.existsSync(file)) {
    whiteList = JSON.parse(fs.readFileSync(file, "utf8"));
  }

  do {
    rs =
      await client.nodeRegistrationClient.listUserAccountsByPaginationIndex(
        pageIndex,
      );
    for (const account of rs) {
      const user = account.toBase58();
      console.log(`user: ${user}`);
      const userTokens =
        await client.nodeRegistrationClient.listAllTokenAccountInfo(account);
      for (const userToken of userTokens) {
        let print = true;
        if (whiteList != null) {
          const limit = whiteList[userToken.mint];
          if (userToken.amount < limit) print = false;
        }
        if (print) {
          const mint = userToken.mint.toBase58();
          const amount = userToken.amount;
          console.log(`        mint: ${mint} amount:${amount}`);
        }
      }
    }
    pageIndex += 1;
  } while (rs != null && rs.length > 0);
});
module.exports = analyzeCommand;
