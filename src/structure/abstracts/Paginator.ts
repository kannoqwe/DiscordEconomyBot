import {
    ButtonBuilder, ButtonInteraction,
    CommandInteraction,
    EmbedBuilder,
    InteractionReplyOptions,
    Message
} from 'discord.js';
import IPaginator from '../interfaces/abstracts/IPaginator';
import CollectorType from '../../types/CollectorType';
import { Config, Utils } from '#structure';
const emoji = Config.emoji.paginator;

export default abstract class Paginator {
    public interaction: CommandInteraction;
    public rows: any[];
    public maxRowsOnPage: number;
    public extendedButtons: boolean;

    public totalPages: number;
    public embeds: EmbedBuilder[] = [];
    private _collector!: CollectorType;

    private _currentPage: number = 1;

    public pageButtons = [
        new ButtonBuilder()
            .setEmoji(emoji.prevPage)
            .setStyle(2)
            .setCustomId('prevPage')
            .setDisabled(true),
        new ButtonBuilder()
            .setEmoji(emoji.delete)
            .setStyle(2)
            .setCustomId('delete'),
        new ButtonBuilder()
            .setEmoji(emoji.nextPage)
            .setStyle(2)
            .setCustomId('nextPage')
    ];
    public pageButtonsExtended = [
        new ButtonBuilder()
            .setEmoji(emoji.firstPage)
            .setStyle(2)
            .setCustomId('firstPage')
            .setDisabled(true),
        ...this.pageButtons,
        new ButtonBuilder()
            .setEmoji(emoji.lastPage)
            .setStyle(2)
            .setCustomId('lastPage')
    ];
    private _customIds = ['firstPage', 'prevPage', 'delete', 'nextPage', 'lastPage'];

    constructor(options: IPaginator) {
        this.interaction = options.interaction;
        this.rows = options.rows;
        this.maxRowsOnPage = options.maxRowsOnPage;
        this.totalPages = Math.ceil(this.rows.length / this.maxRowsOnPage);
        this.extendedButtons = options.extendedButtons || this.totalPages > 2;
    }

    public setup(...args: any) {
        return this._renderEmbeds(...args);
    }

    protected abstract renderPage(pageRows: any[], ...args: any): EmbedBuilder;

    private async _message() {
        return await this.interaction.fetchReply() as Message;
    }

    private async _renderEmbeds(...args: any) {
        if (this.rows.length > 0) for (let i = 0; i < this.rows.length; i += this.maxRowsOnPage) {
            const pageRows = this.rows.slice(i, i + this.maxRowsOnPage);
            const embed = this.renderPage(pageRows, ...args)
                .setFooter({ text: `Страница: ${Math.floor(i / this.maxRowsOnPage) + 1}/${Math.ceil(this.rows.length / this.maxRowsOnPage)}` });
            this.embeds.push(embed);
        } else {
            const embed = this.renderPage([], ...args)
                .setDescription('Список **пуст**');
            this.embeds.push(embed);
        }

        const options: InteractionReplyOptions = {
            embeds: [this.embeds[0]],
            components: [{
                type: 1,
                components: this._renderComponents()
            }]
        };
        if (this.interaction.replied) await this.interaction.editReply(options);
        else await this.interaction.reply(options);

        return this._start();
    }

    private async _start() {
        const message = await this._message();
        this._collector = message.createMessageComponentCollector({
            filter: (i) => i.user.id === this.interaction.user.id
                && i.isButton()
                && this._customIds.includes(i.customId),
            time: 60000
        });

        this._collector.on('collect', async (int) => {
            switch (int.customId) {
                case 'firstPage':
                    this._currentPage = 1;
                    await this._updateMessage(int as ButtonInteraction);
                    break;
                case 'prevPage':
                    this._currentPage--;
                    await this._updateMessage(int as ButtonInteraction);
                    break;
                case 'delete':
                    await message.delete();
                    break;
                case 'nextPage':
                    this._currentPage++;
                    await this._updateMessage(int as ButtonInteraction);
                    break;
                case 'lastPage':
                    this._currentPage = this.totalPages;
                    await this._updateMessage(int as ButtonInteraction);
                    break;
            }
        });

        this._collector.on('end', (_, reason) => {
            if (reason === 'time') {
                Utils.disableComponents({ message });
            }
        });
    }

    private async _updateMessage(int: ButtonInteraction) {
        await int.deferUpdate();
        const components = this._renderComponents();
        return int.editReply({
            embeds: [this.embeds[this._currentPage - 1]],
            components: [{
                type: 1,
                components
            }]
        });
    }

    private _renderComponents() {
        const components = this.extendedButtons ? this.pageButtonsExtended : this.pageButtons;
        if (this._currentPage === 1) {
            components[0].setDisabled(true);
            if (this.extendedButtons) components[1].setDisabled(true);
        } else {
            components[0].setDisabled(false);
            if (this.extendedButtons) components[1].setDisabled(false);
        }
        if (this._currentPage === this.totalPages || this.totalPages <= 0) {
            components[4]?.setDisabled(true);
            components[this.extendedButtons ? 3 : 2].setDisabled(true);
        } else {
            components[4]?.setDisabled(false);
            components[this.extendedButtons ? 3 : 2].setDisabled(false);
        }
        return components;
    }
}