import { GuildMember, Message } from 'discord.js';

export default interface IActiveGame {
    member: GuildMember;
    message: Message;
}