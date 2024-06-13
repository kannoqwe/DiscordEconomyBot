"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _structure_1 = require("#structure");
function default_1(client, userId) {
    const game = client.activeGames.get(userId);
    return `https://discord.com/channels/${_structure_1.Config.guild}/${game?.channelId}/${game?.messageId}`;
}
exports.default = default_1;
