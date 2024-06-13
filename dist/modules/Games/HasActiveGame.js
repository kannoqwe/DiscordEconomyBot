"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _structure_1 = require("#structure");
async function default_1(client, userId) {
    if (client.activeGames.has(userId)) {
        const game = client.activeGames.get(userId);
        const guild = client.guilds.cache.get(_structure_1.Config.guild);
        const channel = guild.channels.cache.get(game.channelId);
        const messages = await channel.messages.fetch();
        const filteredMessages = messages.filter((m) => m.id === game.messageId);
        const message = filteredMessages.first();
        if (_structure_1.Utils.unixTime() >= game.timestamp && message) {
            client.activeGames.delete(userId);
            return false;
        }
        else
            return true;
    }
    else
        return false;
}
exports.default = default_1;
