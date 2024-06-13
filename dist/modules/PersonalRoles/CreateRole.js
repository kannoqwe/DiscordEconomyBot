"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const _structure_1 = require("#structure");
const PersonalRoles_1 = __importDefault(require("#entities/PersonalRoles"));
exports.default = async (member, name, color) => {
    const personalRolePosition = member.guild.roles.cache.get(_structure_1.Config.roles.parents.personalRoles)?.position;
    const nextPosition = personalRolePosition !== undefined ? personalRolePosition + 1 : 0;
    const role = await member.guild.roles.create({
        name,
        color: _structure_1.Utils.resolveColor(color),
        position: nextPosition
    });
    await member.roles.add(role);
    await PersonalRoles_1.default.create({
        userId: member.id,
        roleId: role.id,
        type: 'OWNER',
        payTimestamp: _structure_1.Utils.unixTime() + 2592000,
        payNotifyTimestamp: _structure_1.Utils.unixTime() + 2505600
    }).save();
    return role;
};
