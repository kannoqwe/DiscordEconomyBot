import { Client, Config, Utils, AppCommand } from '#structure';
import {
    ApplicationCommand,
    ChatInputCommandInteraction,
    Collection,
    APIApplicationCommandOption,
    ApplicationCommandType, CommandInteraction, ApplicationCommandOptionType,
    GuildMember
} from 'discord.js';
import BaseHandler from '../client/base/BaseHandler';
import Permissions from '../utils/Permissions';

export default class AppCommandHandler extends BaseHandler {
    public appCommands: Collection<string, AppCommand> = new Collection();
    public oldCommands!: ApplicationCommand[];

    constructor(client: Client, directory: string) {
        super(client, { directory, handleClass: AppCommand });

        this._init();
    }

    private _init() {
        this.client.once('ready', async () => {
            await this.loadModules();
            await this._initCommands();
            await this._deleteOldCommands();
            this.client.on('interactionCreate', async (interaction) => {
                if (interaction.guild?.id !== Config.guild) return;
                if (interaction.isCommand()) await this._runCommand(interaction as ChatInputCommandInteraction<'cached'>);
            });
        });
    }

    private async _initCommands() {
        this.oldCommands = [
            ...(await this.client.application!.commands.fetch()).values(),
            ...(await this.client.guilds.cache.get(Config.guild)!.commands.fetch()).values()
        ];
    }

    private async _deleteOldCommands () {
        await Promise.all(this.oldCommands
            .filter(command => !this.appCommands.get(command.name))
            .map(command => command.delete())
        );
    }

    protected async load(command: AppCommand) {
        const guild = this.client.guilds.cache.get(Config.guild);
        if (!guild) return;

        if (command.messageCommand) return;
        command.client = this.client;

        this.appCommands.set(command.commandName, command);

        if (!command.subCommand) {
            const guild = this.client.guilds.cache.get(Config.guild);
            if (!guild) return;
            await guild.commands.create({
                name: command.commandName,
                description: command.description,
                options: command.options as APIApplicationCommandOption[],
                type: ApplicationCommandType.ChatInput
            });
        }
    }

    private _convertOptionsToObject(interaction: CommandInteraction<'cached'>) {
        const options: Record<string, any> = {};
        for (const option of interaction.options.data) {
            if (option.type === ApplicationCommandOptionType.Subcommand && option.options) {
                for (const subOption of option.options) {
                    options[Utils.snakeToCamelCase(subOption.name)] =
                        subOption.member
                        || subOption.user
                        || subOption.channel
                        || subOption.role
                        || subOption.value;
                }
            } else options[Utils.snakeToCamelCase(option.name)] =
                option.member
                || option.user
                || option.channel
                || option.role
                || option.value;
        }
        return options;
    }

    private async _runCommand(interaction: ChatInputCommandInteraction<'cached'>) {
        const command: AppCommand | undefined = this.appCommands.get(`${interaction.commandName} ${interaction.options.getSubcommand(false)}`)
            ?? this.appCommands.get(interaction.commandName);
        if (!command) return;

        if (Config.commandsChannel.length > 1
            && interaction.channel
            && !Config.commandsChannel.includes(interaction.channel.id)) return;
        if (!Permissions.check(interaction.member as GuildMember, command.permissions)) return;

        command.execute(interaction, this._convertOptionsToObject(interaction as CommandInteraction<'cached'>));
    }
}
