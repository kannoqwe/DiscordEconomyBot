"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const _structure_1 = require("#structure");
class Permissions {
    static types(member) {
        const types = [];
        if (member.permissions.has(discord_js_1.PermissionsBitField.Flags.Administrator))
            types.push('ADMIN');
        member.roles.cache.map((role) => {
            const roleType = _structure_1.Config.staff.find(staff => staff.id === role.id)?.type;
            if (roleType) {
                types.push(roleType);
            }
        });
        return types;
    }
    static check(member, types) {
        const memberTypes = Permissions.types(member);
        const isOwner = member.id === member.guild.ownerId;
        const isDeveloper = _structure_1.Config.developers.some(id => id === member.id);
        if (isDeveloper || isOwner)
            return true;
        if (types.length <= 0)
            return true;
        return types.some(type => memberTypes.includes(type));
    }
}
exports.default = Permissions;
