import { Event } from '#structure';
import { Events, Message } from 'discord.js';

export default class MessageDeleteEvent extends Event {
    constructor() {
        super(Events.MessageDelete);
    }

    execute(message: Message) {
        this.client.activeGames = this.client.activeGames.filter(
            (activeGame) => activeGame.messageId !== message.id
        );
    }
}
