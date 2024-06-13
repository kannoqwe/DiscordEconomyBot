"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const structure_1 = require("../../structure");
const discord_js_1 = require("discord.js");
const UserEntity_1 = __importDefault(require("#entities/UserEntity"));
const Transaction_1 = __importDefault(require("../../classes/Transaction/Transaction"));
class Timely extends structure_1.AppCommand {
    constructor() {
        super('timely', {
            description: 'Забрать временную награду'
        });
        this.timelyAmount = structure_1.Config.currency.timely.amount;
        this.delay = structure_1.Config.currency.timely.delay;
    }
    async execute(interaction) {
        await interaction.deferReply();
        const row = await UserEntity_1.default.findOrCreate({ userId: interaction.user.id });
        const embed = new discord_js_1.EmbedBuilder()
            .setTitle('Временная награда')
            .setColor(structure_1.Config.colors.main)
            .setThumbnail(interaction.user.displayAvatarURL());
        const nextTimely = row.timelyTime;
        const now = structure_1.Utils.unixTime();
        if (nextTimely && now <= nextTimely) {
            embed.setDescription(`${interaction.user.toString()}, вы **уже** забрали **временную** награду! Вы можете **получить** следующую <t:${nextTimely}:R>`);
            return interaction.editReply({ embeds: [embed] });
        }
        row.timelyTime = now + this.delay;
        await row.save();
        await Transaction_1.default.award({
            userId: interaction.user.id,
            type: 'TIMELY',
            amount: this.timelyAmount
        });
        embed.setDescription(`${interaction.user.toString()}, **забрали** свои **${this.timelyAmount}** ${this.client.walletEmoji}! Возвращайтесь <t:${row.timelyTime}:R>`);
        return interaction.editReply({ embeds: [embed] });
    }
}
exports.default = Timely;
