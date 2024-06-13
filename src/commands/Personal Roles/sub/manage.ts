import PersonalRolesEntity from '#entities/PersonalRoles';
import { Config, SubCommand } from '#structure';
import { CommandInteraction } from 'discord.js';
import RoleManage from '../../../classes/PersonalRoles/RoleManage';

export default class RoleManageCmd extends SubCommand {
    constructor() {
        super('role manage');
    }

    async execute(interaction: CommandInteraction<'cached'>) {
        const rows = await PersonalRolesEntity.findBy({ userId: interaction.user.id, type: 'OWNER' });
        if (rows.length <= 0) return interaction.reply({
            embeds: [{
                title: 'Управление личной ролью',
                description: `${interaction.user.toString()}, у Вас **нет** личной роли`,
                color: Config.colors.main,
                thumbnail: { url: interaction.user.displayAvatarURL() }
            }],
            ephemeral: true
        });

        await interaction.deferReply();
        new RoleManage(this.client, interaction, rows);
    }
}