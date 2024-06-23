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
        const game = this.client.activeGames.get(this.member.id);
        if (!game) {
            throw new Error('Game not found');
        }
        if (!game.message) {
            throw new Error('Message not found');
        }
        const link = `https://discord.com/channels/${Config.guild}/${game.message.channel.id}/${game.message.id}`;
        return `${this.member.toString()}, у вас есть [активная игра](${link}).`;
    }
}