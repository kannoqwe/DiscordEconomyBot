import { Snowflake } from 'discord.js';
import UserEntity from '#entities/UserEntity';

export default async function IsUserHaveAmount (userId: Snowflake, amount: number) {
    const row = await UserEntity.findOrCreate({ userId });
    return row.balance >= amount;
}
