"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const _structure_1 = require("#structure");
const discord_js_1 = require("discord.js");
const BaseHandler_1 = __importDefault(require("../client/base/BaseHandler"));
const Permissions_1 = __importDefault(require("../utils/Permissions"));
class MsgCommandHandler extends BaseHandler_1.default {
    constructor(client, directory) {
        super(client, { directory, handleClass: _structure_1.MsgCommand });
        this.commands = new discord_js_1.Collection();
        this.aliases = new discord_js_1.Collection();
        void this._init();
    }
    async _init() {
        this.client.on('messageCreate', async (message) => {
            if (message.guild?.id !== _structure_1.Config.guild)
                return;
            if (message.content.startsWith(_structure_1.Config.prefix))
                await this._getCommand(message);
        });
    }
    async _getCommand(message) {
        const commandName = message.content.toString().slice(_structure_1.Config.prefix.length).trim().split(' ')[0];
        const command = this.commands.get(commandName) ?? this.commands.get(this.aliases.get(commandName));
        if (!command)
            return;
        const messageArgs = message.content.slice(_structure_1.Config.prefix.length).trim();
        let args = [];
        if (messageArgs.toLowerCase().startsWith(commandName))
            args = messageArgs.slice(commandName.length).trim().split(' ')
                .filter((arg) => arg !== '');
        await message.delete();
        if (args.length < command.minArgs)
            return;
        if (!Permissions_1.default.check(message.member, command.permissions))
            return;
        command.execute(message, ...args);
    }
    async load(command) {
        if (command.ignore)
            return;
        this.commands.set(command.id, command);
        if (command.aliases) {
            command.aliases.forEach((alias) => {
                this.aliases.set(alias, command.id);
            });
        }
    }
}
exports.default = MsgCommandHandler;
