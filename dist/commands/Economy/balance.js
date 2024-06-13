"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const _structure_1 = require("#structure");
const discord_js_1 = require("discord.js");
const UserEntity_1 = __importDefault(require("#entities/UserEntity"));
const config_1 = __importDefault(require("../../config"));
class Balance extends _structure_1.AppCommand {
    constructor() {
        super('balance', {
            description: 'Посмотреть баланс пользователя',
            options: [{
                    name: 'member',
                    description: 'Пользователь, чей баланс вы хотите посмотреть',
                    type: discord_js_1.ApplicationCommandOptionType.User
                }]
        });
    }
    async execute(interaction, { member }) {
        const target = member || interaction.member;
        const row = await UserEntity_1.default.findOrCreate({ userId: target.id });
        return interaction.reply({
            embeds: [new discord_js_1.EmbedBuilder()
                    .setTitle(`Баланс — ${target.displayName}`)
                    .setColor(config_1.default.colors.main)
                    .addFields({
                    name: `${config_1.default.emoji.boarder} ${config_1.default.currency.wallet.name}:`,
                    value: (0, discord_js_1.codeBlock)(row.balance.toLocaleString('en-US').replace(/,/g, ' '))
                })
                    .setThumbnail(target.displayAvatarURL())
            ]
        });
    }
}
exports.default = Balance;
