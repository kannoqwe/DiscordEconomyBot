"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const _structure_1 = require("#structure");
const discord_js_1 = require("discord.js");
const IsMemberOfRole_1 = __importDefault(require("../../../modules/PersonalRoles/IsMemberOfRole"));
const HadBought_1 = __importDefault(require("../../../modules/PersonalRoles/HadBought"));
const Confirmation_1 = __importDefault(require("../../../structure/abstracts/Confirmation"));
const RemoveUser_1 = __importDefault(require("../../../modules/PersonalRoles/RemoveUser"));
class TakeConfirmation extends Confirmation_1.default {
    async doSuccessfully(manage, target) {
        this.embed.setDescription(`${this.interaction.user.toString()}, Вы **сняли** ${target.toString()} роль ${manage.role?.toString()}`);
        await this.interaction.editReply({
            embeds: [this.embed],
            components: [{
                    type: 1,
                    components: [manage.backToManage]
                }]
        });
        return (0, RemoveUser_1.default)(target, manage.role);
    }
    doDenial(manage) {
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
class TakeRole extends _structure_1.Button {
    constructor() {
        super('TakeRole');
    }
    async execute(interaction, manage) {
        const embed = new discord_js_1.EmbedBuilder()
            .setTitle('Снять роль')
            .setColor(_structure_1.Config.colors.main)
            .setThumbnail(interaction.user.displayAvatarURL());
        const role = manage.role;
        embed.setDescription(`${interaction.user.toString()}, укажите **пользователя** кому вы хотите **снять** роль ${role?.toString()}`);
        const selectUserRow = _structure_1.Utils.selectUserComponents('SelectUser');
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
        manage.additionalCollector.on('collect', async (int) => {
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
            if (!await (0, IsMemberOfRole_1.default)(target.id, role.id)) {
                embed.setDescription(`${interaction.user.toString()}, у ${target.toString()} нету роли ${manage.role?.toString()}.`);
                return int.editReply({
                    embeds: [embed],
                    components: [{
                            type: 1,
                            components: [manage.backToManage]
                        }]
                });
            }
            if (await (0, HadBought_1.default)(target.id, role.id)) {
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
                confirmingUser: int.member
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
exports.default = TakeRole;
