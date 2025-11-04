const { Command } = require("commander");
const stakeInitializeCommand = require("./stake_init.js");
const setPendingAdminCommand = require("./set_pending_admin.js");
const acceptAdminCommand = require("./accept_admin.js");
const setAprCommand = require("./set_apr.js");
const setAprFactorCommand = require("./set_apr_factor.js");
const setPauseCommand = require("./pause.js");
const depositCommand = require("./deposit.js");
const unstakeCommand = require("./unstake.js");

const stakeCommand = new Command("stake").description(
  "stake: The operations for stake conract.",
);

stakeCommand.addCommand(stakeInitializeCommand);
stakeCommand.addCommand(setPendingAdminCommand);
stakeCommand.addCommand(setAprFactorCommand);
stakeCommand.addCommand(acceptAdminCommand);
stakeCommand.addCommand(setPauseCommand);
stakeCommand.addCommand(depositCommand);
stakeCommand.addCommand(unstakeCommand);
stakeCommand.addCommand(setAprCommand);

module.exports = stakeCommand;
