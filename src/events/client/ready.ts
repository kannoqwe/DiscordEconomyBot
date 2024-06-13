import { Event, Logger } from '#structure';
import { Events } from 'discord.js';

export default class ReadyEvent extends Event {
    constructor() {
        super(Events.ClientReady, {
            once: true
        });
    }

    execute() {
        Logger.log(`${this.client.user?.tag} Бот в сети!`);
    }
}
