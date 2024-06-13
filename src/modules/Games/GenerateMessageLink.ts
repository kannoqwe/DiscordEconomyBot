import { Snowflake } from 'discord.js';
import { Client, Config } from '#structure';

export default function(client: Client, userId: Snowflake): string {
    const game = client.activeGames.get(userId);
    return `https://discord.com/channels/${Config.guild}/${game?.channelId}/${game?.messageId}`;
}