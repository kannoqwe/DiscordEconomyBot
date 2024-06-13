import { GuildMember, Role } from 'discord.js';

declare module 'discord.js' {
    interface ClientEvents {
        personalRoleCreate: [role: Role, member: GuildMember, creator?: GuildMember]
    }
}