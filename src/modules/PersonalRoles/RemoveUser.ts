import PersonalRolesEntity from '#entities/PersonalRoles';
import { GuildMember, Role } from 'discord.js';

export default async function (member: GuildMember, role: Role) {
    const row = await PersonalRolesEntity.findOneBy({ userId: member.id, roleId: role.id, type: 'USER' });
    if (row) await row.remove();

    return member.roles.remove(role).catch(e => e);
}