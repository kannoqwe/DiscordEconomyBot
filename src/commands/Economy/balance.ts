import { AppCommand } from '#structure';
import { CommandInteraction, ApplicationCommandOptionType, GuildMember, codeBlock, EmbedBuilder } from 'discord.js';
import UserEntity from '#entities/UsersEntity';
import Config from '../../config';

export default class Balance extends AppCommand {
    protected constructor() {
        super('balance', {
            description: 'Посмотреть баланс пользователя',
            options: [{
                name: 'member',
                description: 'Пользователь, чей баланс вы хотите посмотреть',
                type: ApplicationCommandOptionType.User
            }]
        });
    }

    async execute(interaction: CommandInteraction<'cached'>, { member }: { member?: GuildMember }) {
        const target = member || interaction.member as GuildMember;
        const row = await UserEntity.findOrCreate({ userId: target.id });

        return interaction.reply({
            embeds: [new EmbedBuilder()
                .setTitle(`Баланс — ${target.displayName}`)
                .setColor(Config.colors.main)
                .addFields({
                    name: `${Config.emoji.boarder} ${Config.currency.wallet.name}:`,
                    value: codeBlock(row.balance.toLocaleString('en-US').replace(/,/g, ' '))
                })
                .setThumbnail(target.displayAvatarURL())
            ]
        });
    }
}