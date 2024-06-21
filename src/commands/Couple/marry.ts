import { AppCommand, Config } from '#structure';
import { ApplicationCommandOptionType, CommandInteraction, EmbedBuilder, GuildMember } from 'discord.js';
import HasBalance from '../../modules/Economy/HasBalance';
import IsMarried from '../../modules/Couple/IsMarried';
import Confirmation from '../../structure/abstracts/Confirmation';

class MarryConfirmation extends Confirmation {
    async doSuccessfully() {

    }

    doDenial() {
    }
}

export default class Give extends AppCommand {
    constructor() {
        super('give', {
            description: 'Передать валюту',
            options: [
                {
                    name: 'member',
                    description: 'Пользователь, кому вы хотите сделать предложение.',
                    type: ApplicationCommandOptionType.User,
                    required: true
                }
            ]
        });
    }

    async execute(interaction: CommandInteraction<'cached'>, { member }: { member: GuildMember }) {
        const embed = new EmbedBuilder()
            .setTitle('Сделать предложение')
            .setColor(Config.colors.main)
            .setThumbnail(interaction.member.displayAvatarURL());

        if (interaction.user.id === member.id) {
            embed.setDescription(`${interaction.user.toString()}, нельзя сделать **предложение** себе.`);
            return interaction.reply({ embeds: [embed], ephemeral: true });
        }
        if (!await HasBalance(interaction.user.id, Config.couple.price)) {
            embed.setDescription(`${interaction.user.toString()}, у вас нет **${Config.couple.price}** ${this.client.walletEmoji}`);
            return interaction.reply({ embeds: [embed], ephemeral: true });
        }
        if (await IsMarried(interaction.user.id)) {
            embed.setDescription(`${interaction.user.toString()}, у вас уже есть пара.`);
            return interaction.reply({ embeds: [embed], ephemeral: true });
        }
        if (await IsMarried(member.id)) {
            embed.setDescription(`${interaction.user.toString()}, у ${member.toString()} уже есть пара.`);
            return interaction.reply({ embeds: [embed], ephemeral: true });
        }

        return new MarryConfirmation(this.client, interaction, {
            title: 'Сделать предложение',
            description: `${interaction.user.toString()} сделал вам **предложение**.`,
            confirmingUser: member
        });
    }
}