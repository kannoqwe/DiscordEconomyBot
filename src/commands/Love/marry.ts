import { AppCommand, Config } from '#structure';
import { ApplicationCommandOptionType, CommandInteraction, EmbedBuilder, GuildMember } from 'discord.js';
import HasBalance from '../../modules/Economy/HasBalance';
import IsMarried from '../../modules/Love/IsMarried';
import Confirmation from '../../structure/abstracts/Confirmation';
import Transaction from '../../classes/Transaction/Transaction';
import CreateCouple from '../../modules/Love/CreateCouple';

class MarryConfirmation extends Confirmation {
    async doSuccessfully() {
        if (await IsMarried(this.confirmingUser.id)) {
            this.embed.setDescription(`${this.confirmingUser.toString()}, у вас уже есть пара.`);
            return this.interaction.editReply({ content: '', embeds: [this.embed], components: [] });
        }
        if (await IsMarried(this.interaction.user.id)) {
            this.embed.setDescription(`${this.confirmingUser.toString()}, у ${this.interaction.user.toString()} уже есть пара.`);
            return this.interaction.editReply({ content: '', embeds: [this.embed], components: [] });
        }
        if (!await Transaction.withdraw({
            userId: this.interaction.user.id,
            amount: Config.love.price,
            type: 'COUPLE_CREATE',
            additional: this.confirmingUser.id
        })) {
            this.embed.setDescription(`${this.confirmingUser.toString()}, у ${this.interaction.user.toString()} нет **${Config.love.price}** ${this.client.walletEmoji}`);
            return this.interaction.editReply({ content: '', embeds: [this.embed], components: [] });
        }

        await CreateCouple(this.interaction.member as GuildMember, this.confirmingUser);
        this.embed.setDescription(`${this.confirmingUser.toString()} принял(-а) предложние на создание любовной комнаты. Со счета ${this.interaction.user.toString()} было списано ${Config.love.price} ${this.client.walletEmoji}`);
        return this.interaction.editReply({ content: '', embeds: [this.embed], components: [] });
    }

    doDenial() {
        this.embed.setDescription(`${this.confirmingUser.toString()}, **отклонил(-а)** запрос на **создание** брака от ${this.interaction.user.toString()}.`);
        return this.interaction.editReply({ content: '', embeds: [this.embed], components: [] });
    }
}

export default class Marry extends AppCommand {
    constructor() {
        super('marry', {
            description: 'Заключить брак',
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
        if (!await HasBalance(interaction.user.id, Config.love.price)) {
            embed.setDescription(`${interaction.user.toString()}, у вас нет **${Config.love.price}** ${this.client.walletEmoji}`);
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
            description: `${interaction.user.toString()} **предлагает** Вам заключить **брак**.`,
            confirmingUser: member
        }).setup();
    }
}