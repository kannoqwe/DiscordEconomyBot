"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const structure_1 = require("../../structure");
const discord_js_1 = require("discord.js");
const HasActiveGame_1 = __importDefault(require("../../modules/Games/HasActiveGame"));
const GenerateMessageLink_1 = __importDefault(require("../../modules/Games/GenerateMessageLink"));
const IsMemberHaveAmount_1 = __importDefault(require("../../modules/Economy/IsMemberHaveAmount"));
const AmountWithCommission_1 = __importDefault(require("../../modules/Economy/AmountWithCommission"));
const Transaction_1 = __importDefault(require("../../classes/Transaction/Transaction"));
class DuelCmd extends structure_1.AppCommand {
    constructor() {
        super('duel', {
            description: 'Сыграть в дуэль',
            options: [
                {
                    name: 'amount',
                    description: 'Сумма ставки',
                    type: discord_js_1.ApplicationCommandOptionType.Integer,
                    min_value: structure_1.Config.currency.games.min,
                    max_value: structure_1.Config.currency.games.max,
                    required: true
                },
                {
                    name: 'member',
                    description: 'Пользователь, с которым Вы хотите сыграть',
                    type: discord_js_1.ApplicationCommandOptionType.User
                }
            ]
        });
    }
    async execute(interaction, { amount, member }) {
        const embed = new discord_js_1.EmbedBuilder()
            .setTitle('Сыграть дуэль')
            .setColor(structure_1.Config.colors.main)
            .setThumbnail(interaction.user.displayAvatarURL());
        if (!await this._checks(interaction, amount, embed))
            return;
        if (interaction.user.id === member?.id) {
            embed.setDescription(`${interaction.user.toString()}, вы не можете играть самим **собой**.`);
            return interaction.reply({ embeds: [embed], ephemeral: true });
        }
        await interaction.deferReply();
        const message = await interaction.fetchReply();
        this.client.activeGames.set(interaction.user.id, {
            channelId: interaction.channel.id,
            messageId: message.id,
            timestamp: structure_1.Utils.unixTime() + structure_1.Config.currency.games.timestamp
        });
        const description = `хочет поиграть с ${member ? member.toString() : 'кем-нибудь'} на`;
        embed.setDescription(`${interaction.user.toString()} ${description} **${amount} ${this.client.walletEmoji}**`);
        await interaction.editReply({
            content: member ? member.toString() : '',
            embeds: [embed],
            components: [{
                    type: 1,
                    components: [
                        { type: 2, label: 'Присоединиться', style: 1, custom_id: 'join' },
                        { type: 2, emoji: structure_1.Config.emoji.paginator.delete, style: 4, custom_id: 'decline' }
                    ]
                }]
        });
        const collector = message.createMessageComponentCollector({
            filter: async (i) => {
                return ((i.customId === 'decline' && i.user.id === interaction.user.id) ||
                    (i.customId === 'join' && member && i.user.id === member.id && await this._checks(i, amount, embed)) ||
                    (i.customId === 'join' && !member && this._checks(i, amount, embed)));
            },
            time: 2 * 60000,
            max: 1
        });
        collector.on('collect', async (int) => {
            await int.deferUpdate();
            switch (int.customId) {
                case 'join':
                    const author = interaction.user;
                    const target = int.user;
                    const duelEmbed = new discord_js_1.EmbedBuilder()
                        .setTitle(`Дуэль — ${author.displayName} vs ${target.displayName}`)
                        .setImage(structure_1.Config.gifs.duel)
                        .setColor(structure_1.Config.colors.main);
                    // Через сколько секунд выстрелит
                    const seconds = 3;
                    for (let i = seconds; i >= 1; i--) {
                        duelEmbed.setDescription(`**${i}**`);
                        await int.editReply({ embeds: [duelEmbed], components: [] });
                        await structure_1.Utils.sleep(1000);
                    }
                    const winner = structure_1.Random.choice([author, target]);
                    const loser = winner === author ? target : author;
                    duelEmbed.setDescription(`${winner.toString()} **выстрелил**`);
                    await int.editReply({ embeds: [duelEmbed] });
                    const amountWithCommission = (0, AmountWithCommission_1.default)(amount, structure_1.Config.currency.games.commission);
                    // winner
                    await Transaction_1.default.award({
                        userId: winner.id,
                        amount: amountWithCommission,
                        type: 'DUEL_WIN',
                        additional: loser.id
                    });
                    // loser
                    await Transaction_1.default.withdraw({
                        userId: loser.id,
                        amount,
                        type: 'DUEL_LOSE',
                        additional: winner.id
                    });
                    await structure_1.Utils.sleep(1000);
                    duelEmbed
                        .setDescription(`${winner.toString()} **выигрывает** дуэль и получает **${amountWithCommission} ${this.client.walletEmoji}**`)
                        .setImage(null);
                    await int.editReply({ embeds: [duelEmbed] });
                    break;
                case 'decline':
                    this.client.activeGames.delete(interaction.user.id);
                    await message.delete();
                    break;
            }
        });
        collector.on('end', (_, reason) => {
            this.client.activeGames.delete(interaction.user.id);
            if (reason === 'time') {
                embed.setDescription(`${interaction.user.toString()}, никто не ответил **вовремя**.`);
                interaction.editReply({ embeds: [embed] });
            }
        });
    }
    async _checks(interaction, amount, embed) {
        if (await (0, HasActiveGame_1.default)(this.client, interaction.user.id)) {
            const link = (0, GenerateMessageLink_1.default)(this.client, interaction.user.id);
            embed.setDescription(`${interaction.user.toString()}, у вас уже есть [активная игра](${link}).`);
            await interaction.reply({ embeds: [embed], ephemeral: true });
            return false;
        }
        if (!await (0, IsMemberHaveAmount_1.default)(interaction.user.id, amount)) {
            embed.setDescription(`${interaction.user.toString()}, у вас нет **${amount} ${this.client.walletEmoji}**.`);
            await interaction.reply({ embeds: [embed], ephemeral: true });
            return false;
        }
        return true;
    }
}
exports.default = DuelCmd;
