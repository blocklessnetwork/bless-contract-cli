const { Command } = require("commander");
const stakeInitializeCommand = require("./stake_init.js");
const setPendingAdminCommand = require("./set_pending_admin.js");
const acceptAdminCommand = require("./accept_admin.js");

const stakeCommand = new Command("stake").description(
    "stake: The operations for stake conract.",
);

stakeCommand.addCommand(stakeInitializeCommand);
stakeCommand.addCommand(setPendingAdminCommand);
stakeCommand.addCommand(acceptAdminCommand);

module.exports = stakeCommand;