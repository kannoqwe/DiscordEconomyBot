import { EmbedBuilder, Message } from 'discord.js';
import { Config, Client } from '#structure';

export default class GuildSettings {
    public client: Client;
    public message: Message;
    public embed!: EmbedBuilder;

    constructor (client: Client, message: Message) {
        this.client = client;
        this.message = message;

        void this._init();
    }

    private _init(): Promise<void> {
        this.embed = new EmbedBuilder()
            .setTitle('Настройки сервера')
            .setDescription(`${this.message.author.toString()}, вы можете **взаимодействовать** с серверои при помощи **кнопок**.`)
            .setColor(Config.colors.main)
            .setThumbnail(this.message.author.displayAvatarURL());
        return this._start();
    }

    private async _start() {
        await this.message.channel.send({
            embeds: [this.embed],
            components: []
        });
    }
}