"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const PersonalRoles_1 = __importDefault(require("#entities/PersonalRoles"));
const _structure_1 = require("#structure");
const discord_js_1 = require("discord.js");
const Button_1 = __importDefault(require("../../structure/handlers/Button"));
const path_1 = __importDefault(require("path"));
class RoleManage {
    constructor(client, interaction, rows) {
        this.activeRequests = [];
        this.client = client;
        this.interaction = interaction;
        this.rows = rows;
        this.ButtonHandler = new Button_1.default(client, path_1.default.join(__dirname, 'components'));
        this.embed = new discord_js_1.EmbedBuilder()
            .setTitle('Управление личной ролью')
            .setColor(_structure_1.Config.colors.main)
            .setThumbnail(interaction.user.displayAvatarURL());
        void this._init();
    }
    async _init() {
        this.message = await this.interaction.fetchReply();
        await this._selectRole();
    }
    async _selectRole() {
        const options = [];
        for (const row of this.rows) {
            const role = this.interaction.guild?.roles.cache.get(row.roleId);
            if (role)
                options.push({
                    label: role.name,
                    value: role.id
                });
        }
        this.embed.setDescription(`${this.interaction.user.toString()}, выберите **личную роль** с которой хотите **взаимодействовать**.`);
        await this.interaction.editReply({
            embeds: [this.embed],
            components: [
                {
                    type: 1,
                    components: [{
                            type: 3,
                            custom_id: 'SelectRole',
                            placeholder: 'Выберите личную роль',
                            options
                        }]
                },
                {
                    type: 1,
                    components: [
                        { type: 2, label: 'Отмена', style: 4, custom_id: 'cancel' }
                    ]
                }
            ]
        });
        const collector = this.message.createMessageComponentCollector({
            filter: (i) => i.user.id === this.interaction.user.id,
            time: 60000,
            max: 1
        });
        collector.on('collect', async (int) => {
            await int.deferUpdate();
            if (int instanceof discord_js_1.StringSelectMenuInteraction) {
                this.role = this.interaction.guild.roles.cache.get(int.values[0]);
                this.row = await PersonalRoles_1.default.findOneBy({ roleId: this.role?.id, type: 'OWNER' });
                await this._manage();
            }
            else
                this._cancel();
        });
        collector.on('end', async (_, reason) => {
            if (reason === 'time') {
                await _structure_1.Utils.disableComponents({ interaction: this.interaction });
            }
        });
    }
    async _manage() {
        this.embed.setDescription(`> Роль: ${this.role?.toString()}
                                    > Продлена до: <t:${this.row?.payTimestamp}:f>`);
        const components = [
            new discord_js_1.ActionRowBuilder().addComponents(new discord_js_1.ButtonBuilder().setLabel('Выдать роль').setStyle(2).setCustomId('GiveRole'), new discord_js_1.ButtonBuilder().setLabel('Снять роль').setStyle(2).setCustomId('TakeRole'), new discord_js_1.ButtonBuilder().setLabel('Переименовать').setStyle(2).setCustomId('Rename'), new discord_js_1.ButtonBuilder().setLabel('Поменять цвет').setStyle(2).setCustomId('ChangeColor')),
            new discord_js_1.ActionRowBuilder().addComponents(new discord_js_1.ButtonBuilder().setLabel('Выставить роль на продажу').setStyle(2).setCustomId('AddShop'), new discord_js_1.ButtonBuilder().setLabel('Снять с продажи').setStyle(2).setCustomId('RemoveShop'), new discord_js_1.ButtonBuilder().setLabel('Изменить цену').setStyle(2).setCustomId('ChangePrice')),
            new discord_js_1.ActionRowBuilder().addComponents(new discord_js_1.ButtonBuilder().setLabel('Изменить иконку').setStyle(2).setCustomId('EditIcon'), new discord_js_1.ButtonBuilder().setLabel('Продлить').setStyle(2).setCustomId('Extend'), new discord_js_1.ButtonBuilder().setLabel('Включить автопродление').setStyle(2).setCustomId('AutoRenewal'), new discord_js_1.ButtonBuilder().setLabel('Удалить роль').setStyle(4).setCustomId('DeleteRole')),
            new discord_js_1.ActionRowBuilder().addComponents(new discord_js_1.ButtonBuilder().setLabel('Вернуться к выбору роли').setStyle(1).setCustomId('backToSelectRole'), new discord_js_1.ButtonBuilder().setLabel('Отмена').setStyle(4).setCustomId('cancel'))
        ];
        await this.interaction.editReply({
            embeds: [this.embed],
            components
        });
        const collector = this.message.createMessageComponentCollector({
            filter: (i) => i.user.id === this.interaction.user.id,
            time: 60000,
            max: 1
        });
        collector.on('collect', async (interaction) => {
            await interaction.deferUpdate();
            const button = this.ButtonHandler.buttons.get(interaction.customId);
            if (!button)
                interaction.customId === 'backToSelectRole' ? await this._init() : this._cancel();
            else
                await button.execute(interaction, this);
        });
        collector.on('end', (_, reason) => {
            if (reason === 'time') {
                _structure_1.Utils.disableComponents({ interaction: this.interaction });
            }
        });
    }
    _cancel() {
        this.message.delete();
    }
    get backToManage() {
        this.backCollector?.stop();
        this.backCollector = this.message.createMessageComponentCollector({
            filter: (i) => i.user.id === this.interaction.user.id
                && i.customId === 'backToManage',
            time: 60000,
            max: 1
        });
        this.backCollector.on('collect', async (int) => {
            await int.deferUpdate();
            await this._manage();
        });
        this.backCollector.on('end', async (_, reason) => {
            if (reason === 'time') {
                await _structure_1.Utils.disableComponents({ interaction: this.interaction });
            }
        });
        return {
            type: 2,
            label: 'Назад',
            style: 4,
            custom_id: 'backToManage'
        };
    }
}
exports.default = RoleManage;
