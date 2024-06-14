import { AppCommand, Config } from '#structure';
import { ApplicationCommandOptionType, CommandInteraction, EmbedBuilder, GuildMember } from 'discord.js';
import ProfileManage from '../../classes/Profile/ProfileManage';

export default class ProfileCommand extends AppCommand {
    constructor() {
        super('profile', {
            description: 'Посмотреть профиль пользователя',
            options: [{
                name: 'member',
                description: 'Пользователь, чей профиль вы хотите посмотреть',
                type: ApplicationCommandOptionType.User,
                required: false
            }]
        });
    }

    async execute(interaction: CommandInteraction<'cached'>, { member }: { member?: GuildMember }) {
        const target = member || interaction.member;

        const embed = new EmbedBuilder()
            .setTitle(`Профиль — ${target.user.username}`)
            .setDescription(`${target.toString()}, профиль **загружается**, подождите...`)
            .setColor(Config.colors.main)
            .setThumbnail(target.displayAvatarURL());

        await interaction.reply({ embeds: [embed] });

        new ProfileManage(interaction, target);
    }
}