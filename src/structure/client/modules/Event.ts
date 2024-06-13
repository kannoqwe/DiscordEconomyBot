import BaseModule from '../base/BaseModule';
import IEvent from '../../interfaces/client/modules/IEvent';
import { Events } from 'discord.js';

export default abstract class Event extends BaseModule {
    public eventName: string;
    public once!: boolean;
    public ignore!: boolean;
    public isCustom!: boolean;

    protected constructor(id: Events | string, options?: IEvent) {
        super(id);
        this.eventName = id;
        this.once = options?.once || false;
        this.ignore = options?.ignore || false;
        this.isCustom = options?.isCustom || false;
    }

    abstract execute(...args: any): any;
}
