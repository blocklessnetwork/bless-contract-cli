#!/usr/bin/env node

const packageJson = require("./package.json");
const Box = require("cli-box");
const chalk = require("chalk");
const { Command } = require("commander");
const registerCommand = require("./command/register.js");
const blesstokenCommand = require("./command/bless_token.js");
const timeCommand = require("./command/time.js");
const analyzeCommand = require("./command/analyze.js");
const programCommand = require("./command/program.js");
const toolsCommand = require("./command/tools.js");
const tokenMetaSetAdminCommand = require("./command/bles_meta_set_pending_admin.js");
const tokenMetaAcceptAdminCommand = require("./command/bles_meta_accept_admin.js");
const blessMetaUpdateCommand = require("./command/bles_meta_update.js");
const blessMetaCreateCommand = require("./command/bles_meta_create.js");
const blessMetaInitCommand = require("./command/bles_meta_init.js");
const program = new Command();

async function main() {
  const b2 = new Box(
    {
      w: process.stdout.columns,
      h: 12,
      stretch: true,
      stringify: false,
    },
    `
    ${chalk.yellow("Welcome to BlessContract CLI!")}
    Run: npx bless-contract-cli help
    `,
  );
  program.addHelpText(
    "after",
    `\nvisit ${chalk.blue("https://docs.bless.network")} for more information.`,
  );
  program
    .name(packageJson.name)
    .description(packageJson.description)
    .version(packageJson.version);

  program.addCommand(registerCommand);
  program.addCommand(blesstokenCommand);
  program.addCommand(analyzeCommand);
  program.addCommand(timeCommand);
  program.addCommand(programCommand);
  program.addCommand(toolsCommand);
  const tokenMetaCommand = new Command("token-meta").description(
    "token-meta: the operations for the bless token meta.",
  );
  tokenMetaCommand.addCommand(tokenMetaSetAdminCommand);
  tokenMetaCommand.addCommand(tokenMetaAcceptAdminCommand);
  tokenMetaCommand.addCommand(blessMetaCreateCommand);
  tokenMetaCommand.addCommand(blessMetaUpdateCommand);
  tokenMetaCommand.addCommand(blessMetaInitCommand);
  program.addCommand(tokenMetaCommand);
  await program.parseAsync(process.argv);
}

main().catch((error) => {
  console.error("Error:", error);
  process.exit(1);
});
