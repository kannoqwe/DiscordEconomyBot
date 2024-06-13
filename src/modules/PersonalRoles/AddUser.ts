import PersonalRolesEntity from '#entities/PersonalRoles';
import { GuildMember, Role } from 'discord.js';

export default async function (member: GuildMember, role: Role) {
    await PersonalRolesEntity.create({
        userId: member.id,
        roleId: role.id
    }).save();

    return member.roles.add(role);
}