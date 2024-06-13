"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const PersonalRoles_1 = __importDefault(require("#entities/PersonalRoles"));
async function default_1(member, role) {
    const row = await PersonalRoles_1.default.findOneBy({ userId: member.id, roleId: role.id, type: 'USER' });
    if (row)
        await row.remove();
    return member.roles.remove(role).catch(e => e);
}
exports.default = default_1;
