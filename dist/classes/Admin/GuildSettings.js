"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const _structure_1 = require("#structure");
class GuildSettings {
    constructor(client, message) {
        this.client = client;
        this.message = message;
        void this._init();
    }
    _init() {
        this.embed = new discord_js_1.EmbedBuilder()
            .setTitle('Настройки сервера')
            .setDescription(`${this.message.author.toString()}, вы можете **взаимодействовать** с серверои при помощи **кнопок**.`)
            .setColor(_structure_1.Config.colors.main)
            .setThumbnail(this.message.author.displayAvatarURL());
        return this._start();
    }
    async _start() {
        await this.message.channel.send({
            embeds: [this.embed],
            components: []
        });
    }
}
exports.default = GuildSettings;
