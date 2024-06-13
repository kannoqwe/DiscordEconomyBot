"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const UserEntity_1 = __importDefault(require("#entities/UserEntity"));
async function IsUserHaveAmount(userId, amount) {
    const row = await UserEntity_1.default.findOrCreate({ userId });
    return row.balance >= amount;
}
exports.default = IsUserHaveAmount;
