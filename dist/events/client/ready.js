"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _structure_1 = require("#structure");
const discord_js_1 = require("discord.js");
class ReadyEvent extends _structure_1.Event {
    constructor() {
        super(discord_js_1.Events.ClientReady, {
            once: true
        });
    }
    execute() {
        _structure_1.Logger.log(`${this.client.user?.tag} Бот в сети!`);
    }
}
exports.default = ReadyEvent;
