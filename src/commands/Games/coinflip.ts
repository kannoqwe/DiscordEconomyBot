import { AppCommand, Config, Random, Utils } from '../../structure';
import {
    ActionRowBuilder,
    ApplicationCommandOptionType, ButtonBuilder,
    ButtonInteraction, ButtonStyle,
    CommandInteraction,
    EmbedBuilder
} from 'discord.js';
import IsUserHaveAmount from '../../modules/Economy/HasBalance';
import Transaction from '../../classes/Transaction/Transaction';
import AmountWithCommission from '../../modules/Economy/AmountWithCommission';
import ActiveGame from '../../classes/Games/ActiveGame';

export default class Coinflip extends AppCommand {
    constructor() {
        super('coinflip', {
            description: 'Сыграть в монетку',
            options: [{
                name: 'amount',
                description: 'Сумма ставки',
                type: ApplicationCommandOptionType.Integer,
                min_value: Config.currency.games.min,
                max_value: Config.currency.games.max,
                required: true
            }]
        });
    }

    async execute(interaction: CommandInteraction<'cached'>, { amount }: { amount: number }) {
        const embed = new EmbedBuilder()
            .setTitle('Сыграть в монетку')
            .setColor(Config.colors.main)
            .setThumbnail(interaction.user.displayAvatarURL());

        const game = new ActiveGame(this.client, interaction.member);
        if (game.check()) {
            embed.setDescription(game.description);
            return interaction.reply({ embeds: [embed], ephemeral: true });
        }
        if (!await IsUserHaveAmount(interaction.user.id, amount)) {
            embed.setDescription(`${interaction.user.toString()}, у вас нет **${amount} ${this.client.walletEmoji}**.`);
            return interaction.reply({ embeds: [embed], ephemeral: true });
        }

        await interaction.deferReply();
        const message = await interaction.fetchReply();

        game.create(message);

        embed.setDescription(`${interaction.user.toString()}, выберите **сторону** на которую хотите поставить ваши **${amount} ${this.client.walletEmoji}**`);
        await interaction.editReply({
            embeds: [embed],
            components: [
                new ActionRowBuilder<ButtonBuilder>().addComponents(
                    new ButtonBuilder().setLabel('Орел').setStyle(ButtonStyle.Secondary).setCustomId('eagle'),
                    new ButtonBuilder().setLabel('Решка').setStyle(ButtonStyle.Secondary).setCustomId('tail')
                ),
                new ActionRowBuilder<ButtonBuilder>().addComponents(
                    new ButtonBuilder().setLabel('Отмена').setStyle(ButtonStyle.Danger).setCustomId('cancel')
                )
            ] 
        });

        const collector = message.createMessageComponentCollector({
            filter: (i) => i.user.id === interaction.user.id,
            time: 60000,
            max: 1
        });

        collector.on('collect', async (int: ButtonInteraction<'cached'>) => {
            await int.deferUpdate();
            if (int.customId !== 'cancel') {
                const chosenCoin: string = int.customId;
                const randomCoin = Random.choice(['eagle', 'tail']);

                const secondEmbed = new EmbedBuilder()
                    .setTitle(`Коинфлип — ${interaction.user.displayName}`)
                    .setDescription(`Ставка: **${amount} ${this.client.walletEmoji}**
                                    Выбранная сторона: **${chosenCoin === 'eagle' ? 'Орел' : 'Решка'}**`)
                    .setImage(randomCoin === 'eagle' ? Config.gifs.coinflip_eagle : Config.gifs.coinflip_tail)
                    .setColor(Config.colors.main);
                await interaction.editReply({ embeds: [secondEmbed], components: [] });
                await Utils.sleep(5000);

                const winner: boolean = randomCoin === chosenCoin;
                const amountWithCommission: number = AmountWithCommission(amount, Config.currency.games.commission);
                if (winner) await Transaction.award({
                    userId: interaction.user.id,
                    type: 'COINFLIP_WIN',
                    amount: amountWithCommission
                });
                else await Transaction.withdraw({
                    userId: interaction.user.id,
                    type: 'COINFLIP_LOSE',
                    amount: amount
                });

                embed.setDescription(`${interaction.user.toString()}, выпало: **${randomCoin === 'eagle' ? 'Орел' : 'Решка'}**
                                Вы ${winner ? 'выиграли' : 'проиграли'} **${winner ? amountWithCommission : amount} ${this.client.walletEmoji}**`);
                await interaction.editReply({ embeds: [embed] });
            }
            game.end();
            if (int.customId === 'cancel') await message.delete();
        });

        collector.on('end', async (_, reason) => {
            if (reason === 'time') {
                game.end();
                embed.setDescription(`${interaction.user.toString()}, **время** на ответ **вышло**`);
                await interaction.editReply({ embeds: [embed] });
            }
        });
    }
}