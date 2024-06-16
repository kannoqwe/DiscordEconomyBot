import { AppCommand, Config, Utils } from '../../structure';
import { CommandInteraction, EmbedBuilder } from 'discord.js';
import UserEntity from '#entities/UsersEntity';
import Transaction from '../../classes/Transaction/Transaction';

export default class Timely extends AppCommand {
    public timelyAmount: number = Config.currency.timely.amount;
    public delay: number = Config.currency.timely.delay;

    constructor() {
        super('timely', {
            description: 'Забрать временную награду'
        });
    }

    async execute(interaction: CommandInteraction<'cached'>) {
        await interaction.deferReply();

        const row = await UserEntity.findOrCreate({ userId: interaction.user.id });
        const embed = new EmbedBuilder()
            .setTitle('Временная награда')
            .setColor(Config.colors.main)
            .setThumbnail(interaction.user.displayAvatarURL());

        const nextTimely = row.timelyTime;
        const now = Utils.unixTime();

        if (nextTimely && now <= nextTimely) {
            embed.setDescription(`${interaction.user.toString()}, вы **уже** забрали **временную** награду! Вы можете **получить** следующую <t:${nextTimely}:R>`);
            return interaction.editReply({ embeds: [embed] });
        }

        row.timelyTime = now + this.delay;
        await row.save();

        await Transaction.award({
            userId: interaction.user.id,
            type: 'TIMELY',
            amount: this.timelyAmount
        });

        embed.setDescription(`${interaction.user.toString()}, **забрали** свои **${this.timelyAmount}** ${this.client.walletEmoji}! Возвращайтесь <t:${row.timelyTime}:R>`);
        return interaction.editReply({ embeds: [embed] });
    }
}