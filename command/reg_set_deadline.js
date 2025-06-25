const { Command, Argument } = require("commander");

const registrySetDeadlineCommand = new Command("deadline")
  .option(
    "--cluster <cluster>",
    "solana cluster: mainnet, testnet, devnet, localnet, <custom>",
  )
  .description("deactive: registry deactive wallet");
