"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const PersonalRoles_1 = __importDefault(require("#entities/PersonalRoles"));
async function default_1(userId, roleId) {
    const row = await PersonalRoles_1.default.findOneBy({ userId, roleId, type: 'USER', bought: true });
    return !!row;
}
exports.default = default_1;
