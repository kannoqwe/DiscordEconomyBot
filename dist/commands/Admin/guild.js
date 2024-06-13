"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const MsgCommand_1 = __importDefault(require("../../structure/client/modules/MsgCommand"));
const GuildSettings_1 = __importDefault(require("../../classes/Admin/GuildSettings"));
class GuildSettingsCmd extends MsgCommand_1.default {
    constructor() {
        super('guild', {
            permissions: ['ADMIN']
        });
    }
    async execute(message) {
        new GuildSettings_1.default(this.client, message);
    }
}
exports.default = GuildSettingsCmd;
