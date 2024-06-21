import { Snowflake } from 'discord.js';
import UserEntity from '#entities/UsersEntity';

export default async function HasBalance (userId: Snowflake, amount: number) {
    const row = await UserEntity.findOrCreate({ userId });
    return row.balance >= amount;
}
