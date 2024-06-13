"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const _structure_1 = require("#structure");
const discord_js_1 = require("discord.js");
const HasActiveGame_1 = __importDefault(require("../../../modules/Games/HasActiveGame"));
const GenerateMessageLink_1 = __importDefault(require("../../../modules/Games/GenerateMessageLink"));
const IsMemberHaveAmount_1 = __importDefault(require("../../../modules/Economy/IsMemberHaveAmount"));
const IsMemberOfRole_1 = __importDefault(require("../../../modules/PersonalRoles/IsMemberOfRole"));
const ConfirmedTransaction_1 = __importDefault(require("../../Transaction/ConfirmedTransaction"));
const Confirmation_1 = __importDefault(require("../../../structure/abstracts/Confirmation"));
const AddUser_1 = __importDefault(require("../../../modules/PersonalRoles/AddUser"));
class GiveConfirmation extends Confirmation_1.default {
    async doSuccessfully(manage, transaction) {
        await transaction.confirm();
        manage.activeRequests = manage.activeRequests.filter(id => id !== this.confirmingUser.id);
        await (0, AddUser_1.default)(this.confirmingUser, manage.role);
        this.embed.setDescription(`${this.confirmingUser.toString()}, Вы успешно **приняли** роль \`${manage.role?.name}\``);
        return this.interaction.editReply({ embeds: [this.embed], components: [] })
            .then(message => _structure_1.Utils.timeoutDelete(message, 30000));
    }
    doDenial(manage, transaction) {
        transaction.cancel();
        manage.activeRequests = manage.activeRequests.filter(id => id !== this.confirmingUser.id);
        this.embed.setDescription(`${this.confirmingUser.toString()}, Вы **откзались** от роли \`${manage.role?.name}\``);
        return this.interaction.editReply({ embeds: [this.embed], components: [] })
            .then(message => _structure_1.Utils.timeoutDelete(message, 30000));
    }
    onTimeout(manage, transaction) {
        manage.activeRequests.filter(id => id !== this.confirmingUser.id);
        return transaction.cancel();
    }
}
class GiveRole extends _structure_1.Button {
    constructor() {
        super('GiveRole');
    }
    async execute(interaction, manage) {
        const embed = new discord_js_1.EmbedBuilder()
            .setTitle('Выдать личную роль')
            .setColor(_structure_1.Config.colors.main)
            .setThumbnail(interaction.user.displayAvatarURL());
        embed.setDescription(`${interaction.user.toString()}, укажите **пользователя** кому вы хотите **выдать** роль ${manage.role?.toString()}. 
            Вы заплатите **${_structure_1.Config.personalRoles.prices.give}** ${this.client.walletEmoji}`);
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
        manage.additionalCollector.on('collect', async (int) => {
            const target = interaction.guild.members.cache.get(int.values[0]);
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
            if (await (0, HasActiveGame_1.default)(this.client, interaction.user.id)) {
                const link = (0, GenerateMessageLink_1.default)(this.client, interaction.user.id);
                embed.setDescription(`${interaction.user.toString()}, у вас есть [активная игра](${link}).`);
                return int.editReply({
                    embeds: [embed],
                    components: [{
                            type: 1,
                            components: [manage.backToManage]
                        }]
                });
            }
            if (!await (0, IsMemberHaveAmount_1.default)(int.user.id, _structure_1.Config.personalRoles.prices.give)) {
                embed.setDescription(`${int.user.toString()}, у вас нет **${_structure_1.Config.personalRoles.prices.give} ${manage.client.walletEmoji}**`);
                return int.editReply({
                    embeds: [embed],
                    components: [{
                            type: 1,
                            components: [manage.backToManage]
                        }]
                });
            }
            if (await (0, IsMemberOfRole_1.default)(target.id, manage.role.id)) {
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
            const transaction = new ConfirmedTransaction_1.default({
                userId: interaction.user.id,
                type: 'PROLE_GIVE',
                amount: _structure_1.Config.personalRoles.prices.give,
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
exports.default = GiveRole;
