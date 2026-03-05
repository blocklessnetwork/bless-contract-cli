const { Command } = require("commander");
const upgradeCommand = require("./prg_upgrade");
const deployCommand = require("./prg_deploy_buffer");
const extendCommand = require("./prg_extend");

const programCommand = new Command("program").description(
  "program: the operations for program.",
);
programCommand.addCommand(upgradeCommand);
programCommand.addCommand(deployCommand);
programCommand.addCommand(extendCommand);

module.exports = programCommand;
