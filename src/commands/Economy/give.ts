import { AppCommand, Config } from '#structure';
import { ApplicationCommandOptionType, CommandInteraction, EmbedBuilder, GuildMember } from 'discord.js';
import { default as absConfirmation } from '../../structure/abstracts/Confirmation';
import Transaction from '../../classes/Transaction/Transaction';
import IsUserHaveAmount from '../../modules/Economy/HasBalance';
import AmountWithCommission from '../../modules/Economy/AmountWithCommission';
import ActiveGame from '../../classes/Games/ActiveGame';

class Confirmation extends absConfirmation {
    async doSuccessfully(member: GuildMember, amount: number, game: ActiveGame) {
        if (game.check()) {
            this.embed.setDescription(game.description);
            return this.interaction.reply({ embeds: [this.embed], ephemeral: true });
        }
        if (!await Transaction.withdraw({
            userId: this.interaction.user.id,
            type: 'GIVE_WITHDRAW',
            amount,
            additional: member.id
        })) {
            this.embed.setDescription(`${this.interaction.user.toString()}, у вас нет **${Config.currency.give.min} ${this.client.walletEmoji}**`);
            return this.interaction.reply({ embeds: [this.embed], ephemeral: true });
        }

        const amountWithCommission = AmountWithCommission(amount, Config.currency.give.commission);
        await Transaction.award({
            userId: member.id,
            type: 'GIVE_AWARD',
            amount: amountWithCommission,
            additional: this.interaction.user.id
        });

        this.embed.setDescription(`${this.interaction.user.toString()}, вы передали **${amountWithCommission} ${this.client.walletEmoji}** пользователю ${member.toString()}.`);
        return this.interaction.editReply({ embeds: [this.embed], components: [] });
    }

    doDenial(member: GuildMember) {
        this.embed.setDescription(`${this.interaction.user.toString()}, вы **отказались** переводить валюту пользователю ${member.toString()}.`);
        return this.interaction.editReply({ embeds: [this.embed], components: [] });
    }
}

export default class Give extends AppCommand {
    constructor() {
        super('give', {
            description: 'Передать валюту',
            options: [
                {
                    name: 'member',
                    description: 'Пользователь, кому вы хотите выдать валюту',
                    type: ApplicationCommandOptionType.User,
                    required: true
                },
                {
                    name: 'amount',
                    description: 'Сумма которую вы хотите выдать',
                    type: ApplicationCommandOptionType.Integer,
                    min_value: Config.currency.give.min,
                    required: true
                }
            ]
        });
    }

    async execute(interaction: CommandInteraction<'cached'>, { member, amount }: { member: GuildMember, amount: number }) {
        const embed = new EmbedBuilder()
            .setTitle('Передать валюту')
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
        if (member.id === interaction.user.id) {
            embed.setDescription(`${interaction.user.toString()}, нельзя **передать** валюту самому **себе**.`);
            return interaction.reply({ embeds: [embed], ephemeral: true });
        }
        
        return new Confirmation(this.client, interaction, {
            title: embed.data.title ?? 'error',
            description: `вы **уверены** что хотите передать **${amount} ${this.client.walletEmoji}** пользователю ${member.toString()}.`,
            confirmingUser: interaction.member as GuildMember
        }).setup(member, amount, game);
    }
}