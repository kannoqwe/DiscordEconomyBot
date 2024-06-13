import { Message } from 'discord.js';
import MsgCommand from '../../structure/client/modules/MsgCommand';
import GuildSettings from '../../classes/Admin/GuildSettings';

export default class GuildSettingsCmd extends MsgCommand {
    constructor() {
        super('guild', {
            permissions: ['ADMIN']
        });
    }   

    async execute(message: Message) {
        new GuildSettings(this.client, message);
    }
}