import PersonalRolesEntity from '#entities/PersonalRoles';
import { Config } from '#structure';
import { Snowflake } from 'discord.js';

export default async (userId: Snowflake) => {
    const rows = await PersonalRolesEntity.findBy({ userId, type: 'OWNER' });
    return Config.personalRoles.price * (rows.length + 1);
};