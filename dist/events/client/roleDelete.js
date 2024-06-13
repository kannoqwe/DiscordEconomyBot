"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const PersonalRoles_1 = __importDefault(require("#entities/PersonalRoles"));
const _structure_1 = require("#structure");
const discord_js_1 = require("discord.js");
const DeleteRole_1 = __importDefault(require("../../modules/PersonalRoles/DeleteRole"));
module.exports = class EventRoleDelete extends _structure_1.Event {
    constructor() {
        super(discord_js_1.Events.GuildRoleDelete);
    }
    async execute(role) {
        if (role.guild.id !== _structure_1.Config.guild)
            return;
        const row = await PersonalRoles_1.default.findOneBy({ roleId: role.id });
        if (row)
            await (0, DeleteRole_1.default)(this.client, role);
    }
};
