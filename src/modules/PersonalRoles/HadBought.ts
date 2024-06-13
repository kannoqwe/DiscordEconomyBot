import PersonalRolesEntity from '#entities/PersonalRoles';
import { Snowflake } from 'discord.js';

export default async function (userId: Snowflake, roleId: Snowflake) {
    const row = await PersonalRolesEntity.findOneBy({ userId, roleId, type: 'USER', bought: true });
    return !!row;
}