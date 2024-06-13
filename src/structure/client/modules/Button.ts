import { ButtonInteraction } from 'discord.js';
import BaseModule from '../base/BaseModule';

export default abstract class Button extends BaseModule {
    protected constructor(id: string) {
        super(id);
    }

    abstract execute(interaction: ButtonInteraction, ...args: any): any;
}