import { GuildMember, Message } from 'discord.js';
import { Client, Config } from '#structure';

export default class ActiveGame {
    public client: Client;
    public member: GuildMember;
    public message!: Message;

    constructor(client: Client, member: GuildMember) {
        this.client = client;
        this.member = member;
    }

    check() {
        return !!this.client.activeGames.get(this.member.id);
    }

    create(message: Message) {
        this.message = message;
        this.client.activeGames.set(this.member.id, this);
    }

    end() {
        this.client.activeGames.delete(this.member.id);
    }

    get description() {
        if (!this.message) {
            throw new Error('Message not found');
        }
        const link = `https://discord.com/channels/${Config.guild}/${this.message.channel.id}/${this.message.id}`;
        return `${this.member.toString()}, у вас есть [активная игра](${link}).`;
    }
}