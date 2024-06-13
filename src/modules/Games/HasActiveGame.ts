import { Snowflake, TextChannel, Message } from 'discord.js';
import { Client, Config, Utils } from '#structure';

export default async function(client: Client, userId: Snowflake): Promise<boolean> {
    if (client.activeGames.has(userId)) {
        const game = client.activeGames.get(userId);
        const guild = client.guilds.cache.get(Config.guild);
        const channel = guild!.channels.cache.get(game!.channelId) as TextChannel;

        const messages = await channel.messages.fetch();
        const filteredMessages = messages.filter((m: Message) => m.id === game!.messageId);
        const message = filteredMessages.first();

        if (Utils.unixTime() >= game!.timestamp && message) {
            client.activeGames.delete(userId);
            return false;
        } else return true;
    } else return false;
}