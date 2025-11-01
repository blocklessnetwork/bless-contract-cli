const blessMetaInitCommand = require("./bles_meta_init.js")
const tokenMetaSetAdminCommand = require("./bles_meta_set_pending_admin.js")
const blessMetaUpdateCommand = require("./bles_meta_update.js")
const blessMetaCreateCommand = require("./bles_meta_create.js")
const tokenMetaAcceptAdminCommand = require("./bles_meta_accept_admin.js")

const commands = {
    blessMetaInitCommand,
    blessMetaCreateCommand,
    blessMetaUpdateCommand,
    tokenMetaSetAdminCommand,
    tokenMetaAcceptAdminCommand,
};

module.exports = commands;
module.exports.default = commands;
