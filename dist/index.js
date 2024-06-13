"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _structure_1 = require("#structure");
const discord_js_1 = require("discord.js");
const client = new _structure_1.Client({
    token: _structure_1.Config.token,
    intents: 131071,
    partials: [discord_js_1.Partials.Channel, discord_js_1.Partials.Message, discord_js_1.Partials.User, discord_js_1.Partials.GuildMember, discord_js_1.Partials.Reaction]
});
void client.start();
