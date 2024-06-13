"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const PersonalRoles_1 = __importDefault(require("#entities/PersonalRoles"));
async function default_1(member, role) {
    await PersonalRoles_1.default.create({
        userId: member.id,
        roleId: role.id
    }).save();
    return member.roles.add(role);
}
exports.default = default_1;
