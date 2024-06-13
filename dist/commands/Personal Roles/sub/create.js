"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const PersonalRoles_1 = __importDefault(require("#entities/PersonalRoles"));
const structure_1 = require("../../../structure");
const discord_js_1 = require("discord.js");
const IsMemberHaveAmount_1 = __importDefault(require("../../../modules/Economy/IsMemberHaveAmount"));
const CalculatePrice_1 = __importDefault(require("../../../modules/PersonalRoles/CalculatePrice"));
const Confirmation_1 = __importDefault(require("../../../structure/abstracts/Confirmation"));
const CreateRole_1 = __importDefault(require("../../../modules/PersonalRoles/CreateRole"));
const Transaction_1 = __importDefault(require("../../../classes/Transaction/Transaction"));
const CheckActiveGame_1 = __importDefault(require("../../../modules/Games/CheckActiveGame"));
class CreateConfirmation extends Confirmation_1.default {
    async doSuccessfully(name, color, price) {
        if (await (0, CheckActiveGame_1.default)(this.embed.data.title || 'Ошибка', this.client, this.interaction, this.interaction.user))
            return;
        if (!await (0, IsMemberHaveAmount_1.default)(this.interaction.user.id, price)) {
            this.embed.setDescription(`${this.interaction.user.toString()}, для создание **личной роли** необходимо **${price} ${this.client.walletEmoji}**`);
            return this.interaction.editReply({ embeds: [this.embed], components: [] });
        }
        this.embed.setDescription(`${this.interaction.user.toString()}, роль создается...`);
        await this.interaction.editReply({ embeds: [this.embed], components: [] });
        const role = await (0, CreateRole_1.default)(this.interaction.member, name, color);
        await Transaction_1.default.withdraw({
            type: 'PROLE_CREATE',
            userId: this.interaction.user.id,
            amount: price,
            additional: role.id
        });
        this.embed.setDescription(`${this.interaction.user.toString()}, Вы **создали** личную роль ${role} и заплатили **${price} ${this.client.walletEmoji}**`);
        this.client.emit('personalRoleCreate', role, this.interaction.member);
        return this.interaction.editReply({ embeds: [this.embed] });
    }
    doDenial() {
        this.embed.setDescription(`${this.interaction.user.toString()}, Вы **отменили** запрос на **создание** личной роли.`);
        return this.interaction.editReply({ embeds: [this.embed], components: [] });
    }
}
class RoleCreate extends structure_1.SubCommand {
    constructor() {
        super('role create');
    }
    async execute(interaction, { name, color }) {
        const embed = new discord_js_1.EmbedBuilder()
            .setTitle('Создать личную роль')
            .setColor(structure_1.Config.colors.main)
            .setThumbnail(interaction.user.displayAvatarURL());
        const rows = await PersonalRoles_1.default.findBy({ userId: interaction.user.id, type: 'OWNER' });
        if (rows.length >= structure_1.Config.personalRoles.limit) {
            embed.setDescription(`${interaction.user.toString()}, Вы достигли **лимита** личных ролей, у вас **${rows.length}** ролей.`);
            return interaction.reply({ embeds: [embed], ephemeral: true });
        }
        if (interaction.guild.roles.cache.size >= 250) {
            embed.setDescription(`${interaction.user.toString()}, на сервере достигнут **лимит** по колличеству **ролей**.`);
            return interaction.reply({ embeds: [embed], ephemeral: true });
        }
        if (await (0, CheckActiveGame_1.default)(embed.data.title || 'Ошибка', this.client, interaction, interaction.user))
            return;
        if (!structure_1.Utils.resolveColor(color)) {
            embed.setDescription(`${interaction.user.toString()}, Вы ввели **неверный** цвет роль. [Примеры](https://colorscheme.ru/html-colors.html)`);
            return interaction.reply({ embeds: [embed], ephemeral: true });
        }
        const price = await (0, CalculatePrice_1.default)(interaction.user.id);
        return new CreateConfirmation(this.client, interaction, {
            title: embed.data.title || 'error',
            description: `Вы **уверены**, что хотите **создать** личную роль \`${name}\` с цветом \`${color}\` за **${price} ${this.client.walletEmoji}**`,
            confirmingUser: interaction.member
        }).setup(name, color, price);
    }
}
exports.default = RoleCreate;
