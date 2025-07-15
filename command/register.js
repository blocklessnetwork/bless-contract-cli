const { Command, Argument } = require("commander");
const regInitCommand = require("./reg_init");
const registerSetDeadlineCommand = require("./reg_set_deadline");
const registerDoCommand = require("./reg_register");
const registerSetPauseCommand = require("./reg_pause");
const registerAcceptAdminCommand = require("./reg_accept_admin");
const registerSetPendingAdminCommand = require("./reg_set_pending_admin");

const registerCommand = new Command("register").description(
  "register: the operations for registration conract.",
);
registerCommand.addCommand(regInitCommand);
registerCommand.addCommand(registerSetDeadlineCommand);
registerCommand.addCommand(registerDoCommand);
registerCommand.addCommand(registerSetPauseCommand);
registerCommand.addCommand(registerAcceptAdminCommand);
registerCommand.addCommand(registerSetPendingAdminCommand);

module.exports = registerCommand;
