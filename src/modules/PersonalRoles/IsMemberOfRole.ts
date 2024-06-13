import PersonalRolesEntity from '#entities/PersonalRoles';
import { Snowflake } from 'discord.js';

export default async (userId: Snowflake, roleId: Snowflake) => {
    return PersonalRolesEntity.findOneBy({
        userId,
        roleId
    });
};