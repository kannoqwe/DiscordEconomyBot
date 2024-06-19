import BaseModule from '../base/BaseModule';
import IAppCommand from '../../interfaces/client/modules/IAppCommand';
import {
    ApplicationCommandOptionData,
    ApplicationCommandType,
    CommandInteraction
} from 'discord.js';
import StaffType from '../../../types/StaffType';

export default abstract class AppCommand extends BaseModule {
    public commandName: string;
    public description: string;
    public options: ApplicationCommandOptionData[];
    public type: ApplicationCommandType = ApplicationCommandType.ChatInput;
    public subCommand: boolean = false;
    public messageCommand: boolean = false;
    public ignore: boolean;
    public permissions: StaffType[];

    protected constructor(id: string, args?: IAppCommand) {
        super(id);
        this.commandName = id;
        this.description = args?.description ?? '-';
        this.options = args?.options ?? [];
        this.ignore = args?.ignore ?? false;
        this.permissions = args?.permissions || [];
    }
    abstract execute(interaction: CommandInteraction, args: Record<string, any>): any;
}

