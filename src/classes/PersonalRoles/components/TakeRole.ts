import { Button, Config, Utils } from '#structure';
import { ButtonInteraction, EmbedBuilder, GuildMember, StringSelectMenuInteraction } from 'discord.js';
import RoleManage from '../RoleManage';
import IsMemberOfRole from '../../../modules/PersonalRoles/IsMemberOfRole';
import HadBought from '../../../modules/PersonalRoles/HadBought';
import Confirmation from '../../../structure/abstracts/Confirmation';
import RemoveUser from '../../../modules/PersonalRoles/RemoveUser';

class TakeConfirmation extends Confirmation {
    async doSuccessfully(manage: RoleManage, target: GuildMember) {
        this.embed.setDescription(`${this.interaction.user.toString()}, Вы **сняли** ${target.toString()} роль ${manage.role?.toString()}`);
        await this.interaction.editReply({ 
            embeds: [this.embed],
            components: [{
                type: 1,
                components: [manage.backToManage]
            }]
        });

        return RemoveUser(target, manage.role!);
    }

    doDenial(manage: RoleManage) {
        this.embed.setDescription(`${this.confirmingUser.toString()}, Вы **отменили** операцию.`);
        return this.interaction.editReply({ 
            embeds: [this.embed],
            components: [{
                type: 1,
                components: [manage.backToManage]
            }] 
        });
    }
}

export default class TakeRole extends Button {
    constructor() {
        super('TakeRole');
    }

    async execute(interaction: ButtonInteraction<'cached'>, manage: RoleManage) {
        const embed = new EmbedBuilder()
            .setTitle('Снять роль')
            .setColor(Config.colors.main)
            .setThumbnail(interaction.user.displayAvatarURL());
        const role = manage.role;

        embed.setDescription(`${interaction.user.toString()}, укажите **пользователя** кому вы хотите **снять** роль ${role?.toString()}`);
        const selectUserRow = Utils.selectUserComponents('SelectUser');
        await interaction.editReply({
            embeds: [embed],
            components: [
                selectUserRow,
                {
                    type: 1,
                    components: [manage.backToManage]
                }
            ]
        });

        manage.additionalCollector?.stop();
        manage.additionalCollector = manage.message.createMessageComponentCollector({
            filter: (i) => i.user.id === interaction.user.id && i.customId === 'SelectUser',
            time: 60000,
            max: 1
        });

        manage.additionalCollector.on('collect', async (int: StringSelectMenuInteraction): Promise<any> => {
            await int.deferUpdate();
            const target = int.guild?.members.cache.get(int.values[0]);
            if (!target) {
                embed.setDescription(`${interaction.user.toString()}, пользователь **не найден**.`);
                return int.editReply({
                    embeds: [embed],
                    components: [{
                        type: 1,
                        components: [manage.backToManage]
                    }]
                });
            }
            if (target.id === int.user.id) {
                embed.setDescription(`${interaction.user.toString()}, Вы не можете **снять** себе роль ${role?.toString()}.`);
                return int.editReply({
                    embeds: [embed],
                    components: [{
                        type: 1,
                        components: [manage.backToManage]
                    }]
                });
            }
            if (!await IsMemberOfRole(target.id, role!.id)) {
                embed.setDescription(`${interaction.user.toString()}, у ${target.toString()} нету роли ${manage.role?.toString()}.`);
                return int.editReply({
                    embeds: [embed],
                    components: [{
                        type: 1,
                        components: [manage.backToManage]
                    }]
                });
            }
            if (await HadBought(target.id, role!.id)) {
                embed.setDescription(`${interaction.user.toString()}, Вы не можете **снять** ${target.toString()} роль ${role?.toString()}.`);
                return int.editReply({
                    embeds: [embed],
                    components: [{
                        type: 1,
                        components: [manage.backToManage]
                    }]
                });
            }

            return new TakeConfirmation(this.client, interaction, {
                title: embed.data.title || '',
                description: `Вы **уверены** что хотите **снять** ${target.toString()} роль ${role?.toString()}`,
                confirmingUser: int.member as GuildMember
            }).setup(manage, target);
        });

        manage.additionalCollector.on('end', async (_, reason) => {
            if (reason === 'time') {
                embed.setDescription(`${interaction.user.toString()}, Вы **не успели** указать **пользователя**, которому вы хотите **снять** роль ${role?.toString()}`);
                await interaction.editReply({
                    embeds: [embed],
                    components: [{
                        type: 1,
                        components: [manage.backToManage]
                    }]
                });
            }
        });
    }
}