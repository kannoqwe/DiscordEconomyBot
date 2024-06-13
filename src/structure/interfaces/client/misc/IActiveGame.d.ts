import { Snowflake } from 'discord.js';

export default interface IActiveGame {
    channelId: Snowflake,
    messageId: Snowflake,
    timestamp: number
}