import { Config, MsgCommand } from '#structure';
import { Message } from 'discord.js';
import Award from '../../classes/Admin/Award';

export default class CommandAward extends MsgCommand {
    constructor() {
        super('award', {
            minArgs: 1,
            permissions: ['ADMIN', 'CURATOR', 'MASTER']
        });
    }

    async execute(message: Message, memberId: string) {
        const target = message.mentions.users.first() || this.client.users.cache.get(memberId);
        if (!target) return message.channel.send({
            embeds: [{
                title: 'Управление балансом',
                description: `${message.author.toString()}, не удалось **найти** пользователя.`,
                color: Config.colors.main,
                thumbnail: { url: message.author.displayAvatarURL() }
            }]
        })
            .then(msg => {
                setTimeout(() => {
                    msg.delete().catch(e => e);
                }, 30000);
            });

        new Award(this.client, message, target);
    }
}