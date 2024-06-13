import { Client, Config, MsgCommand } from '#structure';
import { Collection, GuildMember, Message } from 'discord.js';
import BaseHandler from '../client/base/BaseHandler';
import Permissions from '../utils/Permissions';

export default class MsgCommandHandler extends BaseHandler {
    public commands: Collection<string, MsgCommand> = new Collection();
    public aliases: Collection<string, string> = new Collection();

    constructor(client: Client, directory: string) {
        super(client, { directory, handleClass: MsgCommand });

        void this._init();
    }

    private async _init() {
        this.client.on('messageCreate', async (message: Message) => {
            if (message.guild?.id !== Config.guild) return;
            if (message.content.startsWith(Config.prefix)) await this._getCommand(message);
        });
    }

    private async _getCommand(message: Message) {
        const commandName = message.content.toString().slice(Config.prefix.length).trim().split(' ')[0];
        const command = this.commands.get(commandName) ?? this.commands.get(<string> this.aliases.get(commandName));

        if (!command) return;
        const messageArgs = message.content.slice(Config.prefix.length).trim();
        let args: string[] = [];
        if (messageArgs.toLowerCase().startsWith(commandName)) args = messageArgs.slice(commandName.length).trim().split(' ')
            .filter((arg) => arg !== '');

        await message.delete();

        if (args.length < command.minArgs) return;
        if (!Permissions.check(message.member as GuildMember, command.permissions)) return;

        command.execute(message, ...args);
    }

    protected async load(command: MsgCommand) {
        if (command.ignore) return;

        this.commands.set(command.id, command);
        if (command.aliases) {
            command.aliases.forEach((alias: string) => {
                this.aliases.set(alias, command.id);
            });
        }
    }
}
