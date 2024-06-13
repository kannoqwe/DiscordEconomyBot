import { AppCommand, Config, Random, Utils } from '../../structure';
import { ApplicationCommandOptionType, CommandInteraction, GuildMember, EmbedBuilder, APIMessageComponentEmoji, ButtonInteraction, User } from 'discord.js';
import hasActiveGame from '../../modules/Games/HasActiveGame';
import generateMessageLink from '../../modules/Games/GenerateMessageLink';
import IsUserHaveAmount from '../../modules/Economy/IsMemberHaveAmount';
import AmountWithCommission from '../../modules/Economy/AmountWithCommission';
import Transaction from '../../classes/Transaction/Transaction';

export default class DuelCmd extends AppCommand {
    constructor() {
        super('duel', {
            description: 'Сыграть в дуэль',
            options: [
                {
                    name: 'amount',
                    description: 'Сумма ставки',
                    type: ApplicationCommandOptionType.Integer,
                    min_value: Config.currency.games.min,
                    max_value: Config.currency.games.max,
                    required: true
                },
                {
                    name: 'member',
                    description: 'Пользователь, с которым Вы хотите сыграть',
                    type: ApplicationCommandOptionType.User
                }
            ]
        });
    }

    async execute(interaction: CommandInteraction<'cached'>, { amount, member }: { amount: number, member?: GuildMember }) {
        const embed = new EmbedBuilder()
            .setTitle('Сыграть дуэль')
            .setColor(Config.colors.main)
            .setThumbnail(interaction.user.displayAvatarURL());
        
        if (!await this._checks(interaction, amount, embed)) return;
        if (interaction.user.id === member?.id) {
            embed.setDescription(`${interaction.user.toString()}, вы не можете играть самим **собой**.`);
            return interaction.reply({ embeds: [embed], ephemeral: true });
        }

        await interaction.deferReply();
        const message = await interaction.fetchReply();
        this.client.activeGames.set(interaction.user.id, {
            channelId: interaction.channel!.id,
            messageId: message.id,
            timestamp: Utils.unixTime() + Config.currency.games.timestamp
        }); 

        const description: string = `хочет поиграть с ${member ? member.toString() : 'кем-нибудь'} на`;
        embed.setDescription(`${interaction.user.toString()} ${description} **${amount} ${this.client.walletEmoji}**`);
        await interaction.editReply({
            content: member ? member.toString() : '',
            embeds: [embed],
            components: [{
                type: 1,
                components: [
                    { type: 2, label: 'Присоединиться', style: 1, custom_id: 'join' },
                    { type: 2, emoji: Config.emoji.paginator.delete as APIMessageComponentEmoji, style: 4, custom_id: 'decline' }
                ]
            }]
        });

        const collector = message.createMessageComponentCollector({ 
            filter: async (i) => {
                return (
                    (i.customId === 'decline' && i.user.id === interaction.user.id) ||
                    (i.customId === 'join' && member && i.user.id === member.id && await this._checks(i as ButtonInteraction, amount, embed)) ||
                    (i.customId === 'join' && !member && this._checks(i as ButtonInteraction, amount, embed))
                );
            },            
            time: 2 * 60000,
            max: 1
        });
        collector.on('collect', async (int: ButtonInteraction<'cached'>) => {
            await int.deferUpdate();
            switch (int.customId) {
                case 'join':
                    const author = interaction.user;
                    const target = int.user;
                    const duelEmbed = new EmbedBuilder()
                        .setTitle(`Дуэль — ${author.displayName} vs ${target.displayName}`)
                        .setImage(Config.gifs.duel)
                        .setColor(Config.colors.main);

                    // Через сколько секунд выстрелит
                    const seconds = 3;
                    for (let i = seconds; i >= 1; i--) {
                        duelEmbed.setDescription(`**${i}**`);
                        await int.editReply({ embeds: [duelEmbed], components: [] });
                        await Utils.sleep(1000);
                    }
                    
                    const winner: User = Random.choice([author, target]);
                    const loser: User = winner === author ? target : author;

                    duelEmbed.setDescription(`${winner.toString()} **выстрелил**`);
                    await int.editReply({ embeds: [duelEmbed] });

                    const amountWithCommission = AmountWithCommission(amount, Config.currency.games.commission);
                    // winner
                    await Transaction.award({
                        userId: winner.id,
                        amount: amountWithCommission,
                        type: 'DUEL_WIN',
                        additional: loser.id
                    });
                    // loser
                    await Transaction.withdraw({
                        userId: loser.id,
                        amount,
                        type: 'DUEL_LOSE',
                        additional: winner.id 
                    });
                    await Utils.sleep(1000);

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

    private async _checks(interaction: ButtonInteraction | CommandInteraction, amount: number, embed: EmbedBuilder): Promise<boolean> {
        if (await hasActiveGame(this.client, interaction.user.id)) {
            const link = generateMessageLink(this.client, interaction.user.id);
            embed.setDescription(`${interaction.user.toString()}, у вас уже есть [активная игра](${link}).`);
            await interaction.reply({ embeds: [embed], ephemeral: true });
            return false;
        }
        if (!await IsUserHaveAmount(interaction.user.id, amount)) {
            embed.setDescription(`${interaction.user.toString()}, у вас нет **${amount} ${this.client.walletEmoji}**.`);
            await interaction.reply({ embeds: [embed], ephemeral: true });
            return false;
        }
        return true;
    }
}