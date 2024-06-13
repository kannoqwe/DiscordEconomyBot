"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const structure_1 = require("../../structure");
const discord_js_1 = require("discord.js");
const TransactionEntity_1 = __importDefault(require("#entities/TransactionEntity"));
const Paginator_1 = __importDefault(require("../../structure/abstracts/Paginator"));
const ConvertTransactions_1 = __importDefault(require("../../modules/Economy/ConvertTransactions"));
class Pages extends Paginator_1.default {
    renderPage(pageRows, target) {
        const embed = new discord_js_1.EmbedBuilder()
            .setTitle(`История транзакций — ${target.user.displayName}`)
            .setColor(structure_1.Config.colors.main)
            .setThumbnail(target.displayAvatarURL());
        let description = '';
        for (const row of pageRows) {
            description += (0, ConvertTransactions_1.default)(row);
        }
        if (description !== '')
            embed.setDescription(description);
        return embed;
    }
}
class Transactions extends structure_1.AppCommand {
    constructor() {
        super('transactions', {
            description: 'Посмотреть транзакции',
            options: [{
                    name: 'member',
                    description: 'Пользователь, чьи транзации вы хотите посмотреть',
                    type: discord_js_1.ApplicationCommandOptionType.User
                }]
        });
    }
    async execute(interaction, { member }) {
        const target = member || interaction.member;
        const rows = await TransactionEntity_1.default.find({
            where: { userId: target.id },
            order: { id: 'DESC' }
        });
        await new Pages({
            interaction,
            rows,
            maxRowsOnPage: 7
        }).setup(target);
    }
}
exports.default = Transactions;
