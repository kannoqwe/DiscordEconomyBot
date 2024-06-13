"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _structure_1 = require("#structure");
const discord_js_1 = require("discord.js");
class PRoleCreateEvent extends _structure_1.Event {
    constructor() {
        super('personalRoleCreate');
    }
    async execute(role, member, creator = member) {
        const { guild } = member;
        const channel = guild.channels.cache.get(_structure_1.Config.channels.personalRoles);
        if (!channel)
            return;
        const embed = new discord_js_1.EmbedBuilder()
            .setTitle('Создание личной роли')
            .addFields({ name: `${_structure_1.Config.emoji.boarder} Создал:`, value: `${_structure_1.Config.emoji.dot}${creator.toString()}
                    ${_structure_1.Config.emoji.dot}${creator.id}`, inline: true }, { name: `${_structure_1.Config.emoji.boarder} Владелец:`, value: `${_structure_1.Config.emoji.dot}${member.toString()}
                    ${_structure_1.Config.emoji.dot}${member.id}`, inline: true }, { name: `${_structure_1.Config.emoji.boarder} Роль`, value: `${_structure_1.Config.emoji.dot}${role.toString()}
                    ${_structure_1.Config.emoji.dot}${role.id}`, inline: false })
            .setColor(_structure_1.Config.colors.main)
            .setTimestamp()
            .setThumbnail(member.displayAvatarURL());
        return channel.send({ embeds: [embed] });
    }
}
exports.default = PRoleCreateEvent;
