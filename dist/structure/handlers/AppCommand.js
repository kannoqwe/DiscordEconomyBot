"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const _structure_1 = require("#structure");
const discord_js_1 = require("discord.js");
const BaseHandler_1 = __importDefault(require("../client/base/BaseHandler"));
const Permissions_1 = __importDefault(require("../utils/Permissions"));
class AppCommandHandler extends BaseHandler_1.default {
    constructor(client, directory) {
        super(client, { directory, handleClass: _structure_1.AppCommand });
        this.appCommands = new discord_js_1.Collection();
        this._init();
    }
    _init() {
        this.client.once('ready', async () => {
            await this.loadModules();
            await this._initCommands();
            await this._deleteOldCommands();
            this.client.on('interactionCreate', async (interaction) => {
                if (interaction.guild?.id !== _structure_1.Config.guild)
                    return;
                if (interaction.isCommand())
                    await this._runCommand(interaction);
            });
        });
    }
    async _initCommands() {
        this.oldCommands = [
            ...(await this.client.application.commands.fetch()).values(),
            ...(await this.client.guilds.cache.get(_structure_1.Config.guild).commands.fetch()).values()
        ];
    }
    async _deleteOldCommands() {
        await Promise.all(this.oldCommands
            .filter(command => !this.appCommands.get(command.name))
            .map(command => command.delete()));
    }
    async load(command) {
        const guild = this.client.guilds.cache.get(_structure_1.Config.guild);
        if (!guild)
            return;
        if (command.messageCommand)
            return;
        command.client = this.client;
        this.appCommands.set(command.commandName, command);
        if (!command.subCommand) {
            const guild = this.client.guilds.cache.get(_structure_1.Config.guild);
            if (!guild)
                return;
            await guild.commands.create({
                name: command.commandName,
                description: command.description,
                options: command.options,
                type: discord_js_1.ApplicationCommandType.ChatInput
            });
        }
    }
    _convertOptionsToObject(interaction) {
        const options = {};
        for (const option of interaction.options.data) {
            if (option.type === discord_js_1.ApplicationCommandOptionType.Subcommand && option.options) {
                for (const subOption of option.options) {
                    options[_structure_1.Utils.snakeToCamelCase(subOption.name)] =
                        subOption.member
                            || subOption.user
                            || subOption.channel
                            || subOption.role
                            || subOption.value;
                }
            }
            else
                options[_structure_1.Utils.snakeToCamelCase(option.name)] =
                    option.member
                        || option.user
                        || option.channel
                        || option.role
                        || option.value;
        }
        return options;
    }
    async _runCommand(interaction) {
        const command = this.appCommands.get(`${interaction.commandName} ${interaction.options.getSubcommand(false)}`)
            ?? this.appCommands.get(interaction.commandName);
        if (!command)
            return;
        if (_structure_1.Config.commandsChannel.length > 1
            && interaction.channel
            && !_structure_1.Config.commandsChannel.includes(interaction.channel.id))
            return;
        if (!Permissions_1.default.check(interaction.member, command.permissions))
            return;
        command.execute(interaction, this._convertOptionsToObject(interaction));
    }
}
exports.default = AppCommandHandler;
