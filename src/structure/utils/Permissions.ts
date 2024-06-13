import { GuildMember, PermissionsBitField } from 'discord.js';
import StaffType from '../../types/StaffType';
import { Config } from '#structure';

export default class Permissions {
    static types(member: GuildMember): StaffType[] {
        const types: StaffType[] = [];
        if (member.permissions.has(PermissionsBitField.Flags.Administrator)) types.push('ADMIN');
        
        member.roles.cache.map((role) => {
            const roleType: string | undefined = Config.staff.find(staff => staff.id === role.id)?.type;
            if (roleType) {
                types.push(roleType as StaffType);
            }
        });
        return types;
    }

    static check(member: GuildMember, types: StaffType[]): boolean {
        const memberTypes: StaffType[] = Permissions.types(member);

        const isOwner: boolean = member.id === member.guild.ownerId;
        const isDeveloper: boolean = Config.developers.some(id => id === member.id);

        if (isDeveloper || isOwner) return true;
        if (types.length <= 0) return true;

        return types.some(type => memberTypes.includes(type));
    }
}