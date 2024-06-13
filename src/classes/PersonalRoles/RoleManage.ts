import PersonalRolesEntity from '#entities/PersonalRoles';
import { Client, Config, Utils } from '#structure';
import { APIMessageActionRowComponent,
    APISelectMenuOption,
    ButtonInteraction,
    CommandInteraction,
    EmbedBuilder,
    Message,
    Role,
    Snowflake,
    StringSelectMenuInteraction,
    ButtonBuilder,
    ActionRowBuilder
} from 'discord.js';
import CollectorType from '../../types/CollectorType';
import ButtonHandler from '../../structure/handlers/Button';
import path from 'path';

export default class RoleManage {
    public client: Client;
    public interaction: CommandInteraction;
    public rows: PersonalRolesEntity[];
    public row!: PersonalRolesEntity | null;
    public embed: EmbedBuilder;
    public role!: Role | undefined;
    public message!: Message;
    public backCollector!: CollectorType;
    public additionalCollector!: CollectorType;
    public activeRequests: Snowflake[] = [];
    public ButtonHandler!: ButtonHandler;

    constructor(client: Client, interaction: CommandInteraction, rows: PersonalRolesEntity[]) {
        this.client = client;
        this.interaction = interaction;
        this.rows = rows;
        this.ButtonHandler = new ButtonHandler(client, path.join(__dirname, 'components'));

        this.embed = new EmbedBuilder()
            .setTitle('Управление личной ролью')
            .setColor(Config.colors.main)
            .setThumbnail(interaction.user.displayAvatarURL());

        void this._init();
    }   

    private async _init() {
        this.message = await this.interaction.fetchReply();
        await this._selectRole();
    }

    private async _selectRole() {
        const options: APISelectMenuOption[] = [];
        for (const row of this.rows) {
            const role = this.interaction.guild?.roles.cache.get(row.roleId);
            if (role) options.push({
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
        collector.on('collect', async (int: StringSelectMenuInteraction | ButtonInteraction) => {
            await int.deferUpdate();
            if (int instanceof StringSelectMenuInteraction) {
                this.role = this.interaction.guild!.roles.cache.get(int.values[0]); 
                this.row = await PersonalRolesEntity.findOneBy({ roleId: this.role?.id, type: 'OWNER' });
                await this._manage();
            }
            else this._cancel();
        });
        collector.on('end', async (_, reason) => {
            if (reason === 'time') {
                await Utils.disableComponents({ interaction: this.interaction });
            }
        });
    }

    private async _manage() {
        this.embed.setDescription(`> Роль: ${this.role?.toString()}
                                    > Продлена до: <t:${this.row?.payTimestamp}:f>`);
        const components = [
            new ActionRowBuilder<ButtonBuilder>().addComponents(
                new ButtonBuilder().setLabel('Выдать роль').setStyle(2).setCustomId('GiveRole'),
                new ButtonBuilder().setLabel('Снять роль').setStyle(2).setCustomId('TakeRole'),
                new ButtonBuilder().setLabel('Переименовать').setStyle(2).setCustomId('Rename'),
                new ButtonBuilder().setLabel('Поменять цвет').setStyle(2).setCustomId('ChangeColor')
            ),
            new ActionRowBuilder<ButtonBuilder>().addComponents(
                new ButtonBuilder().setLabel('Выставить роль на продажу').setStyle(2).setCustomId('AddShop'),
                new ButtonBuilder().setLabel('Снять с продажи').setStyle(2).setCustomId('RemoveShop'),
                new ButtonBuilder().setLabel('Изменить цену').setStyle(2).setCustomId('ChangePrice')
            ),
            new ActionRowBuilder<ButtonBuilder>().addComponents(
                new ButtonBuilder().setLabel('Изменить иконку').setStyle(2).setCustomId('EditIcon'),
                new ButtonBuilder().setLabel('Продлить').setStyle(2).setCustomId('Extend'),
                new ButtonBuilder().setLabel('Включить автопродление').setStyle(2).setCustomId('AutoRenewal'),
                new ButtonBuilder().setLabel('Удалить роль').setStyle(4).setCustomId('DeleteRole')
            ),
            new ActionRowBuilder<ButtonBuilder>().addComponents(
                new ButtonBuilder().setLabel('Вернуться к выбору роли').setStyle(1).setCustomId('backToSelectRole'),
                new ButtonBuilder().setLabel('Отмена').setStyle(4).setCustomId('cancel') 
            )
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
            if (!button) interaction.customId === 'backToSelectRole' ? await this._init() : this._cancel();
            else await button.execute(interaction as ButtonInteraction<'cached'>, this);
        });
        
        collector.on('end', (_, reason) => {
            if (reason === 'time') {
                Utils.disableComponents({ interaction: this.interaction });
            }
        });
    }

    private _cancel() {
        this.message.delete();
    }

    public get backToManage(): APIMessageActionRowComponent {
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
                await Utils.disableComponents({ interaction: this.interaction });
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