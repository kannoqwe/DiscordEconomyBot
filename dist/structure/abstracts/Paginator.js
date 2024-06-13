"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const _structure_1 = require("#structure");
const emoji = _structure_1.Config.emoji.paginator;
class Paginator {
    constructor(options) {
        this.embeds = [];
        this._currentPage = 1;
        this.pageButtons = [
            new discord_js_1.ButtonBuilder()
                .setEmoji(emoji.prevPage)
                .setStyle(2)
                .setCustomId('prevPage')
                .setDisabled(true),
            new discord_js_1.ButtonBuilder()
                .setEmoji(emoji.delete)
                .setStyle(2)
                .setCustomId('delete'),
            new discord_js_1.ButtonBuilder()
                .setEmoji(emoji.nextPage)
                .setStyle(2)
                .setCustomId('nextPage')
        ];
        this.pageButtonsExtended = [
            new discord_js_1.ButtonBuilder()
                .setEmoji(emoji.firstPage)
                .setStyle(2)
                .setCustomId('firstPage')
                .setDisabled(true),
            ...this.pageButtons,
            new discord_js_1.ButtonBuilder()
                .setEmoji(emoji.lastPage)
                .setStyle(2)
                .setCustomId('lastPage')
        ];
        this._customIds = ['firstPage', 'prevPage', 'delete', 'nextPage', 'lastPage'];
        this.interaction = options.interaction;
        this.rows = options.rows;
        this.maxRowsOnPage = options.maxRowsOnPage;
        this.totalPages = Math.ceil(this.rows.length / this.maxRowsOnPage);
        this.extendedButtons = options.extendedButtons || this.totalPages > 2;
    }
    setup(...args) {
        return this._renderEmbeds(...args);
    }
    async _message() {
        return await this.interaction.fetchReply();
    }
    async _renderEmbeds(...args) {
        if (this.rows.length > 0)
            for (let i = 0; i < this.rows.length; i += this.maxRowsOnPage) {
                const pageRows = this.rows.slice(i, i + this.maxRowsOnPage);
                const embed = this.renderPage(pageRows, ...args)
                    .setFooter({ text: `Страница: ${Math.floor(i / this.maxRowsOnPage) + 1}/${Math.ceil(this.rows.length / this.maxRowsOnPage)}` });
                this.embeds.push(embed);
            }
        else {
            const embed = this.renderPage([], ...args)
                .setDescription('Список **пуст**');
            this.embeds.push(embed);
        }
        const options = {
            embeds: [this.embeds[0]],
            components: [{
                    type: 1,
                    components: this._renderComponents()
                }]
        };
        if (this.interaction.replied)
            await this.interaction.editReply(options);
        else
            await this.interaction.reply(options);
        return this._start();
    }
    async _start() {
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
                    await this._updateMessage(int);
                    break;
                case 'prevPage':
                    this._currentPage--;
                    await this._updateMessage(int);
                    break;
                case 'delete':
                    await message.delete();
                    break;
                case 'nextPage':
                    this._currentPage++;
                    await this._updateMessage(int);
                    break;
                case 'lastPage':
                    this._currentPage = this.totalPages;
                    await this._updateMessage(int);
                    break;
            }
        });
        this._collector.on('end', (_, reason) => {
            if (reason === 'time') {
                _structure_1.Utils.disableComponents({ message });
            }
        });
    }
    async _updateMessage(int) {
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
    _renderComponents() {
        const components = this.extendedButtons ? this.pageButtonsExtended : this.pageButtons;
        if (this._currentPage === 1) {
            components[0].setDisabled(true);
            if (this.extendedButtons)
                components[1].setDisabled(true);
        }
        else {
            components[0].setDisabled(false);
            if (this.extendedButtons)
                components[1].setDisabled(false);
        }
        if (this._currentPage === this.totalPages || this.totalPages <= 0) {
            components[4]?.setDisabled(true);
            components[this.extendedButtons ? 3 : 2].setDisabled(true);
        }
        else {
            components[4]?.setDisabled(false);
            components[this.extendedButtons ? 3 : 2].setDisabled(false);
        }
        return components;
    }
}
exports.default = Paginator;
