"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const structure_1 = require("../../structure");
const discord_js_1 = require("discord.js");
const IsMemberHaveAmount_1 = __importDefault(require("../../modules/Economy/IsMemberHaveAmount"));
const GenerateMessageLink_1 = __importDefault(require("../../modules/Games/GenerateMessageLink"));
const HasActiveGame_1 = __importDefault(require("../../modules/Games/HasActiveGame"));
const Transaction_1 = __importDefault(require("../../classes/Transaction/Transaction"));
const AmountWithCommission_1 = __importDefault(require("../../modules/Economy/AmountWithCommission"));
class Coinflip extends structure_1.AppCommand {
    constructor() {
        super('coinflip', {
            description: 'Сыграть в монетку',
            options: [{
                    name: 'amount',
                    description: 'Сумма ставки',
                    type: discord_js_1.ApplicationCommandOptionType.Integer,
                    min_value: structure_1.Config.currency.games.min,
                    max_value: structure_1.Config.currency.games.max,
                    required: true
                }]
        });
    }
    async execute(interaction, { amount }) {
        const embed = new discord_js_1.EmbedBuilder()
            .setTitle('Сыграть в монетку')
            .setColor(structure_1.Config.colors.main)
            .setThumbnail(interaction.user.displayAvatarURL());
        if (await (0, HasActiveGame_1.default)(this.client, interaction.user.id)) {
            const link = (0, GenerateMessageLink_1.default)(this.client, interaction.user.id);
            embed.setDescription(`${interaction.user.toString()}, у вас уже есть [активная игра](${link}).`);
            return interaction.reply({ embeds: [embed], ephemeral: true });
        }
        if (!await (0, IsMemberHaveAmount_1.default)(interaction.user.id, amount)) {
            embed.setDescription(`${interaction.user.toString()}, у вас нет **${amount} ${this.client.walletEmoji}**.`);
            return interaction.reply({ embeds: [embed], ephemeral: true });
        }
        await interaction.deferReply();
        const message = await interaction.fetchReply();
        this.client.activeGames.set(interaction.user.id, {
            channelId: interaction.channel.id,
            messageId: message.id,
            timestamp: structure_1.Utils.unixTime() + structure_1.Config.currency.games.timestamp
        });
        embed.setDescription(`${interaction.user.toString()}, выберите **сторону** на которую хотите поставить ваши **${amount} ${this.client.walletEmoji}**`);
        await interaction.editReply({
            embeds: [embed],
            components: [
                {
                    type: 1,
                    components: [
                        { type: 2, label: 'Орел', style: 2, custom_id: 'eagle' },
                        { type: 2, label: 'Решка', style: 2, custom_id: 'tail' }
                    ]
                },
                {
                    type: 1,
                    components: [
                        { type: 2, label: 'Отмена', style: 4, custom_id: 'cancel' }
                    ]
                }
            ]
        });
        const collector = message.createMessageComponentCollector({
            filter: (i) => i.user.id === interaction.user.id,
            time: 60000,
            max: 1
        });
        collector.on('collect', async (int) => {
            await int.deferUpdate();
            if (int.customId !== 'cancel') {
                const chosenCoin = int.customId;
                const randomCoin = structure_1.Random.choice(['eagle', 'tail']);
                const secondEmbed = new discord_js_1.EmbedBuilder()
                    .setTitle(`Коинфлип — ${interaction.user.displayName}`)
                    .setDescription(`Ставка: **${amount} ${this.client.walletEmoji}**
                                    Выбранная сторона: **${chosenCoin === 'eagle' ? 'Орел' : 'Решка'}**`)
                    .setImage(randomCoin === 'eagle' ? structure_1.Config.gifs.coinflip_eagle : structure_1.Config.gifs.coinflip_tail)
                    .setColor(structure_1.Config.colors.main);
                await interaction.editReply({ embeds: [secondEmbed], components: [] });
                await structure_1.Utils.sleep(5000);
                const winner = randomCoin === chosenCoin;
                const amountWithCommission = (0, AmountWithCommission_1.default)(amount, structure_1.Config.currency.games.commission);
                if (winner)
                    await Transaction_1.default.award({
                        userId: interaction.user.id,
                        type: 'COINFLIP_WIN',
                        amount: amountWithCommission
                    });
                else
                    await Transaction_1.default.withdraw({
                        userId: interaction.user.id,
                        type: 'COINFLIP_LOSE',
                        amount: amount
                    });
                embed.setDescription(`${interaction.user.toString()}, выпало: **${randomCoin === 'eagle' ? 'Орел' : 'Решка'}**
                                Вы ${winner ? 'выиграли' : 'проиграли'} **${winner ? amountWithCommission : amount} ${this.client.walletEmoji}**`);
                await interaction.editReply({ embeds: [embed] });
            }
            this.client.activeGames.delete(interaction.user.id);
            if (int.customId === 'cancel')
                await message.delete();
        });
        collector.on('end', async (_, reason) => {
            if (reason === 'time') {
                this.client.activeGames.delete(interaction.user.id);
                embed.setDescription(`${interaction.user.toString()}, **время** на ответ **вышло**`);
                await interaction.editReply({ embeds: [embed] });
            }
        });
    }
}
exports.default = Coinflip;
