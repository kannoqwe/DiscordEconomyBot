import { Snowflake } from 'discord.js';
import CouplesEntity from '#entities/CouplesEntity';

export default async function IsMarried(userId: Snowflake) {
    return !!await CouplesEntity.findOneBy({ firstUserId: userId });
}