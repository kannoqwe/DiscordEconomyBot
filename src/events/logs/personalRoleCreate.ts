import { Event, Config } from '#structure';
import { EmbedBuilder, GuildMember, Role, TextChannel } from 'discord.js';

export default class PRoleCreateEvent extends Event {
    constructor() {
        super('personalRoleCreate');
    }

    async execute(role: Role, member: GuildMember, creator: GuildMember = member) {
        const { guild } = member;
        const channel = guild.channels.cache.get(Config.channels.personalRoles) as TextChannel;
        if (!channel) return;

        const embed = new EmbedBuilder()
            .setTitle('Создание личной роли')
            .addFields(
                { name: `${Config.emoji.boarder} Создал:`, value: `${Config.emoji.dot}${creator.toString()}
                    ${Config.emoji.dot}${creator.id}`, inline: true },
                { name: `${Config.emoji.boarder} Владелец:`, value: `${Config.emoji.dot}${member.toString()}
                    ${Config.emoji.dot}${member.id}`, inline: true },
                { name: `${Config.emoji.boarder} Роль`, value: `${Config.emoji.dot}${role.toString() }
                    ${Config.emoji.dot}${role.id}`, inline: false }
            )
            .setColor(Config.colors.main)
            .setTimestamp()
            .setThumbnail(member.displayAvatarURL());
        return channel.send({ embeds: [embed] });
    }
}