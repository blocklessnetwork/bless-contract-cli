const { Command, Argument } = require("commander");
const timeInitCommand = require("./time_init");
const timeAcceptAdminCommand = require("./time_accept_admin");
const timeSetPendingAdminCommand = require("./time_set_pending_admin");
const timeSetMerkleRootCommand = require("./time_set_merkle_tree");

const timeCommand = new Command("time").description(
  "Operations for the Time contract.",
);
timeCommand.addCommand(timeInitCommand);
timeCommand.addCommand(timeAcceptAdminCommand);
timeCommand.addCommand(timeSetPendingAdminCommand);
timeCommand.addCommand(timeSetMerkleRootCommand);

module.exports = timeCommand;
