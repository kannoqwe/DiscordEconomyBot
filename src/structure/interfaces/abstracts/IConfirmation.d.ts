import { GuildMember } from 'discord.js';

export default interface IConfirmation {
    title: string;
    description: string;
    confirmingUser: GuildMember;
    collectorTime?: number;
    dm?: boolean;
}