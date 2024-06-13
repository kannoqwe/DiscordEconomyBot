"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const PersonalRoles_1 = __importDefault(require("#entities/PersonalRoles"));
const _structure_1 = require("#structure");
exports.default = async (userId) => {
    const rows = await PersonalRoles_1.default.findBy({ userId, type: 'OWNER' });
    return _structure_1.Config.personalRoles.price * (rows.length + 1);
};
