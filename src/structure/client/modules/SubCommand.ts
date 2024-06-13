import { CommandInteraction } from 'discord.js';
import AppCommand from './AppCommand';

export default abstract class SubCommand extends AppCommand {
    public commandName: string;
    public subCommand: boolean = true;
    public messageCommand: boolean = false;

    protected constructor(id: string) {
        super(id);
        this.commandName = id;
    }

    abstract execute (interaction: CommandInteraction, ...args: any): any;
}

