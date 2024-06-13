"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const PersonalRoles_1 = __importDefault(require("#entities/PersonalRoles"));
const _structure_1 = require("#structure");
const RoleManage_1 = __importDefault(require("../../../classes/PersonalRoles/RoleManage"));
class RoleManageCmd extends _structure_1.SubCommand {
    constructor() {
        super('role manage');
    }
    async execute(interaction) {
        const rows = await PersonalRoles_1.default.findBy({ userId: interaction.user.id, type: 'OWNER' });
        if (rows.length <= 0)
            return interaction.reply({
                embeds: [{
                        title: 'Управление личной ролью',
                        description: `${interaction.user.toString()}, у Вас **нет** личной роли`,
                        color: _structure_1.Config.colors.main,
                        thumbnail: { url: interaction.user.displayAvatarURL() }
                    }],
                ephemeral: true
            });
        await interaction.deferReply();
        new RoleManage_1.default(this.client, interaction, rows);
    }
}
exports.default = RoleManageCmd;
