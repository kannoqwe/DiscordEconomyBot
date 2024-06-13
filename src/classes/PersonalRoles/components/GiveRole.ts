import { Button, Config, Utils } from '#structure';
import { ButtonInteraction, EmbedBuilder, StringSelectMenuInteraction } from 'discord.js';
import RoleManage from '../RoleManage';
import hasActiveGame from '../../../modules/Games/HasActiveGame';
import generateMessageLink from '../../../modules/Games/GenerateMessageLink';
import IsUserHaveAmount from '../../../modules/Economy/IsMemberHaveAmount';
import IsMemberOfRole from '../../../modules/PersonalRoles/IsMemberOfRole';
import ConfirmedTransaction from '../../Transaction/ConfirmedTransaction';
import Confirmation from '../../../structure/abstracts/Confirmation';
import AddUser from '../../../modules/PersonalRoles/AddUser';

class GiveConfirmation extends Confirmation {
    async doSuccessfully(manage: RoleManage, transaction: ConfirmedTransaction) {
        await transaction.confirm();
        manage.activeRequests = manage.activeRequests.filter(id => id !== this.confirmingUser.id);
        await AddUser(this.confirmingUser, manage.role!);

        this.embed.setDescription(`${this.confirmingUser.toString()}, Вы успешно **приняли** роль \`${manage.role?.name}\``);
        return this.interaction.editReply({ embeds: [this.embed], components: [] })
            .then(message => Utils.timeoutDelete(message, 30000));
    }

    doDenial(manage: RoleManage, transaction: ConfirmedTransaction) {
        transaction.cancel();
        manage.activeRequests = manage.activeRequests.filter(id => id !== this.confirmingUser.id);
        this.embed.setDescription(`${this.confirmingUser.toString()}, Вы **откзались** от роли \`${manage.role?.name}\``);
        return this.interaction.editReply({ embeds: [this.embed], components: [] })
            .then(message => Utils.timeoutDelete(message, 30000));
    }

    onTimeout(manage: RoleManage, transaction: ConfirmedTransaction) {
        manage.activeRequests.filter(id => id !== this.confirmingUser.id);
        return transaction.cancel();
    }
}

export default class GiveRole extends Button {
    constructor() {
        super('GiveRole');
    }

    async execute(interaction: ButtonInteraction<'cached'>, manage: RoleManage) {
        const embed = new EmbedBuilder()
            .setTitle('Выдать личную роль')
            .setColor(Config.colors.main)
            .setThumbnail(interaction.user.displayAvatarURL());

        embed.setDescription(`${interaction.user.toString()}, укажите **пользователя** кому вы хотите **выдать** роль ${manage.role?.toString()}. 
            Вы заплатите **${Config.personalRoles.prices.give}** ${this.client.walletEmoji}`);
        await interaction.editReply({
            embeds: [embed],
            components: [
                {
                    type: 1, 
                    components: [{
                        type: 5,
                        custom_id: 'SelectUser',
                        placeholder: 'Укажите пользователя'
                    }]
                },
                {
                    type: 1,
                    components: [manage.backToManage]
                }
            ]
        });
        // Если коллектор до этого содан был, удаляется
        manage.additionalCollector?.stop();
        manage.additionalCollector = manage.message.createMessageComponentCollector({
            filter: (i) => i.user.id === interaction.user.id && i.customId === 'SelectUser',
            time: 60000,
            max: 1
        });

        manage.additionalCollector.on('collect', async (int: StringSelectMenuInteraction): Promise<any> => {
            const target = interaction.guild!.members.cache.get(int.values[0]);
            await int.deferUpdate();
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
            if (await hasActiveGame(this.client, interaction.user.id)) {
                const link = generateMessageLink(this.client, interaction.user.id);
                embed.setDescription(`${interaction.user.toString()}, у вас есть [активная игра](${link}).`);
                return int.editReply({
                    embeds: [embed],
                    components: [{
                        type: 1,
                        components: [manage.backToManage]
                    }]
                });
            }
            if (!await IsUserHaveAmount(int.user.id, Config.personalRoles.prices.give)) {
                embed.setDescription(`${int.user.toString()}, у вас нет **${Config.personalRoles.prices.give} ${manage.client.walletEmoji}**`);
                return int.editReply({
                    embeds: [embed],
                    components: [{
                        type: 1,
                        components: [manage.backToManage]
                    }]
                });
            }
            if (await IsMemberOfRole(target.id, manage.role!.id)) {
                embed.setDescription(`${interaction.user.toString()}, у пользователя ${target.toString()} уже есть роль ${manage.role?.toString()}.`);
                return int.editReply({
                    embeds: [embed],
                    components: [{
                        type: 1,
                        components: [manage.backToManage]
                    }]
                });
            }
            if (manage.activeRequests.includes(target.id)) {
                embed.setDescription(`${interaction.user.toString()}, у ${target.toString()} уже есть **активный запрос**.`);
                return int.editReply({
                    embeds: [embed],
                    components: [{
                        type: 1,
                        components: [manage.backToManage]
                    }]
                });
            }

            embed.setDescription(`${interaction.user.toString()}, Вы отправили **запрос** пользователю ${target.toString()}`);
            await interaction.editReply({
                embeds: [embed],
                components: [{
                    type: 1,
                    components: [manage.backToManage]
                }]  
            });
            manage.activeRequests.push(target.id);

            const transaction = new ConfirmedTransaction({
                userId: interaction.user.id,
                type: 'PROLE_GIVE',
                amount: Config.personalRoles.prices.give,
                additional: target.id
            });
            await transaction.setup();

            return new GiveConfirmation(this.client, interaction, {
                title: embed.data.title ?? 'error',
                description: `предлагает **выдать** вам роль \`${manage.role?.name}\``,
                confirmingUser: target,
                dm: true,
                collectorTime: 5 * 60000
            }).setup(manage, transaction);
        });

        manage.additionalCollector.on('end', async (_, reason) => {
            if (reason === 'time') {
                embed.setDescription(`${interaction.user.toString()}, Вы **не успели** ввести пользователя, которому хотите **выдать** роли`);
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