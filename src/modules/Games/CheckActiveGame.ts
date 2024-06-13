import generateMessageLink from './GenerateMessageLink';
import { Client, Config } from '#structure';
import { ButtonInteraction, CommandInteraction, EmbedBuilder, User } from 'discord.js';
import hasActiveGame from './HasActiveGame';

export default async function CheckActiveGame(title: string, client: Client, interaction: CommandInteraction | ButtonInteraction, user: User): Promise<boolean> {
    if (!await hasActiveGame(client, user.id)) return false;
    const link = generateMessageLink(client, user.id);
    const embed = new EmbedBuilder()
        .setTitle(title)
        .setColor(Config.colors.main)
        .setThumbnail(user.displayAvatarURL())
        .setDescription(`${user.toString()}, у вас есть [активная игра](${link}).`);
    if (interaction.replied) {
        await interaction.editReply({ embeds: [embed] });
    } else {
        await interaction.reply({ embeds: [embed], ephemeral: true });
    }
    return true;
}