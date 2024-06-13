"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const _structure_1 = require("#structure");
const discord_js_1 = require("discord.js");
const Confirmation_1 = __importDefault(require("../../structure/abstracts/Confirmation"));
const Transaction_1 = __importDefault(require("../../classes/Transaction/Transaction"));
const IsMemberHaveAmount_1 = __importDefault(require("../../modules/Economy/IsMemberHaveAmount"));
const AmountWithCommission_1 = __importDefault(require("../../modules/Economy/AmountWithCommission"));
const GenerateMessageLink_1 = __importDefault(require("../../modules/Games/GenerateMessageLink"));
const HasActiveGame_1 = __importDefault(require("../../modules/Games/HasActiveGame"));
class Confirmation extends Confirmation_1.default {
    async doSuccessfully(member, amount) {
        if (await (0, HasActiveGame_1.default)(this.client, this.interaction.user.id)) {
            const link = (0, GenerateMessageLink_1.default)(this.client, this.interaction.user.id);
            this.embed.setDescription(`${this.interaction.user.toString()}, у вас есть [активная игра](${link}).`);
            return this.interaction.reply({ embeds: [this.embed], ephemeral: true });
        }
        if (!await Transaction_1.default.withdraw({
            userId: this.interaction.user.id,
            type: 'GIVE_WITHDRAW',
            amount,
            additional: member.id
        })) {
            this.embed.setDescription(`${this.interaction.user.toString()}, у вас нет **${_structure_1.Config.currency.give.min} ${this.client.walletEmoji}**`);
            return this.interaction.reply({ embeds: [this.embed], ephemeral: true });
        }
        const amountWithCommission = (0, AmountWithCommission_1.default)(amount, _structure_1.Config.currency.give.commission);
        await Transaction_1.default.award({
            userId: member.id,
            type: 'GIVE_AWARD',
            amount: amountWithCommission,
            additional: this.interaction.user.id
        });
        this.embed.setDescription(`${this.interaction.user.toString()}, вы передали **${amountWithCommission} ${this.client.walletEmoji}** пользователю ${member.toString()}.`);
        return this.interaction.editReply({ embeds: [this.embed], components: [] });
    }
    doDenial(member) {
        this.embed.setDescription(`${this.interaction.user.toString()}, вы **отказались** переводить валюту пользователю ${member.toString()}.`);
        return this.interaction.editReply({ embeds: [this.embed], components: [] });
    }
}
class Give extends _structure_1.AppCommand {
    constructor() {
        super('give', {
            description: 'Передать валюту',
            options: [
                {
                    name: 'member',
                    description: 'Пользователь, кому вы хотите выдать валюту',
                    type: discord_js_1.ApplicationCommandOptionType.User,
                    required: true
                },
                {
                    name: 'amount',
                    description: 'Сумма которую вы хотите выдать',
                    type: discord_js_1.ApplicationCommandOptionType.Integer,
                    min_value: _structure_1.Config.currency.give.min,
                    required: true
                }
            ]
        });
    }
    async execute(interaction, { member, amount }) {
        const embed = new discord_js_1.EmbedBuilder()
            .setTitle('Передать валюту')
            .setColor(_structure_1.Config.colors.main)
            .setThumbnail(interaction.user.displayAvatarURL());
        if (await (0, HasActiveGame_1.default)(this.client, interaction.user.id)) {
            const link = (0, GenerateMessageLink_1.default)(this.client, interaction.user.id);
            embed.setDescription(`${interaction.user.toString()}, у вас есть [активная игра](${link}).`);
            return interaction.reply({ embeds: [embed], ephemeral: true });
        }
        if (!await (0, IsMemberHaveAmount_1.default)(interaction.user.id, amount)) {
            embed.setDescription(`${interaction.user.toString()}, у вас нет **${amount} ${this.client.walletEmoji}**.`);
            return interaction.reply({ embeds: [embed], ephemeral: true });
        }
        if (member.id === interaction.user.id) {
            embed.setDescription(`${interaction.user.toString()}, нельзя **передать** валюту самому **себе**.`);
            return interaction.reply({ embeds: [embed], ephemeral: true });
        }
        return new Confirmation(this.client, interaction, {
            title: embed.data.title ?? 'error',
            description: `вы **уверены** что хотите передать **${amount} ${this.client.walletEmoji}** пользователю ${member.toString()}.`,
            confirmingUser: interaction.member
        }).setup(member, amount);
    }
}
exports.default = Give;
