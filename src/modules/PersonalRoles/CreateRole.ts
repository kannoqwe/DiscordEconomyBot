import { ColorResolvable, GuildMember } from 'discord.js';
import { Utils, Config } from '#structure';
import PersonalRolesEntity from '#entities/PersonalRoles';

export default async (member: GuildMember, name: string, color: string) => {
    const personalRolePosition = member.guild.roles.cache.get(Config.roles.parents.personalRoles)?.position;
    const nextPosition = personalRolePosition !== undefined ? personalRolePosition + 1 : 0;
    const role = await member.guild.roles.create({
        name,
        color: Utils.resolveColor(color) as ColorResolvable,
        position: nextPosition
    });

    await member.roles.add(role);

    await PersonalRolesEntity.create({
        userId: member.id,
        roleId: role.id,
        type: 'OWNER',
        payTimestamp: Utils.unixTime() + 2592000,
        payNotifyTimestamp: Utils.unixTime() + 2505600
    }).save();
    return role;
};