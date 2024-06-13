"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _structure_1 = require("#structure");
const discord_js_1 = require("discord.js");
class MessageDeleteEvent extends _structure_1.Event {
    constructor() {
        super(discord_js_1.Events.MessageDelete);
    }
    execute(message) {
        this.client.activeGames = this.client.activeGames.filter((activeGame) => activeGame.messageId !== message.id);
    }
}
exports.default = MessageDeleteEvent;
