import BaseModule from '../base/BaseModule';
import { Message } from 'discord.js';
import ICommand from '../../interfaces/client/modules/ICommand';
import StaffType from '../../../types/StaffType';

export default abstract class MsgCommand extends BaseModule {
    public id: string;
    public commandName: string;
    public ignore!: boolean;
    public minArgs!: number;
    public aliases: string[];
    public permissions: StaffType[];

    protected constructor(id: string, options?: ICommand) {
        super(id);
        this.id = id;
        this.commandName = id;
        this.ignore = options?.ignore || false;
        this.minArgs = options?.minArgs || 0;
        this.aliases = options?.aliases || [];
        this.permissions = options?.permissions || [];
    }

    abstract execute(message: Message, ...args: any): any;
}
