"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const _structure_1 = require("#structure");
const discord_js_1 = require("discord.js");
const Transaction_1 = __importDefault(require("../Transaction/Transaction"));
var ConvertId;
(function (ConvertId) {
    ConvertId["give"] = "\u0412\u044B\u0434\u0430\u0442\u044C";
    ConvertId["remove"] = "\u0417\u0430\u0431\u0440\u0430\u0442\u044C";
    ConvertId["set"] = "\u0423\u0441\u0442\u0430\u043D\u043E\u0432\u0438\u0442\u044C";
})(ConvertId || (ConvertId = {}));
class Award {
    constructor(client, message, target) {
        this.client = client;
        this.message = message;
        this.target = target;
        void this._init();
    }
    async _init() {
        this.embed = new discord_js_1.EmbedBuilder()
            .setTitle(`Управление балансом — ${this.target.displayName}`)
            .setDescription(`${this.message.author.toString()}, для **взаймодествие** с балансом, используйте **кнопки**.`)
            .setColor(_structure_1.Config.colors.main)
            .setThumbnail(this.target.displayAvatarURL());
        const options = {
            embeds: [this.embed],
            components: [
                {
                    type: 1,
                    components: [
                        { type: 2, label: 'Выдать', style: 2, custom_id: 'give' },
                        { type: 2, label: 'Забрать', style: 2, custom_id: 'remove' },
                        { type: 2, label: 'Установить', style: 1, custom_id: 'set' }
                    ]
                },
                {
                    type: 1,
                    components: [
                        { type: 2, label: 'Отмена', style: 4, custom_id: 'cancel' }
                    ]
                }
            ]
        };
        if (!this.msg)
            this.msg = await this.message.channel.send(options);
        else
            await this.msg.edit(options);
        return this._manage();
    }
    async _manage() {
        const collector = this.msg.createMessageComponentCollector({
            filter: (i) => i.user.id === this.message.author.id,
            max: 1,
            time: 60000
        });
        collector.on('collect', async (int) => {
            let amount;
            if (int.customId !== 'cancel') {
                this.embed.setDescription(`${this.message.author.toString()}, укажите **сумму** в открывшемся окне`);
                await this.msg.edit({ embeds: [this.embed], components: [{
                            type: 1,
                            components: [this._backCollector()]
                        }] });
                amount = await this._modal(int);
            }
            switch (int.customId) {
                case 'give':
                    if (!amount)
                        return;
                    await Transaction_1.default.award({
                        userId: this.target.id,
                        type: 'AWARD_GIVE',
                        amount,
                        additional: this.message.author.id
                    });
                    break;
                case 'remove':
                    if (!amount)
                        return;
                    await Transaction_1.default.withdraw({
                        userId: this.target.id,
                        type: 'AWARD_REMOVE',
                        amount,
                        additional: this.message.author.id
                    });
                    break;
                case 'set':
                    if (!amount)
                        return;
                    await Transaction_1.default.set({
                        userId: this.target.id,
                        type: 'AWARD_SET',
                        amount,
                        additional: this.message.author.id
                    });
                    break;
                case 'cancel':
                    await this.msg.delete();
                    break;
            }
            this.embed.setDescription(`${this.message.author.toString()}, операция **выполнена**.
                > Операция: **${ConvertId[int.customId]}**
                > Сумма: **${amount} ${this.client.walletEmoji}**`);
            await this.msg.edit({ embeds: [this.embed], components: [] });
        });
        collector.on('end', (_, reason) => {
            if (reason === 'time') {
                this.embed.setDescription(`${this.message.author.toString()}, вы не ответили **вовремя**.`);
                this.msg.edit({
                    embeds: [this.embed],
                    components: []
                });
            }
        });
    }
    async _modal(int) {
        const modal = await _structure_1.Utils.showModal(int, ConvertId[int.customId], 'awardModal', [{
                custom_id: 'amount',
                label: 'Количество монет:'
            }]);
        if (!modal.deferred)
            return;
        const amount = modal.fields.getTextInputValue('amount');
        if (!amount || isNaN(Number(amount)) || Number(amount) > Number.MAX_SAFE_INTEGER) {
            this.embed.setDescription(`${this.message.author.toString()}, вы не правильно ввели **сумму**`);
            await this.msg.edit({
                embeds: [this.embed],
                components: [{
                        type: 1,
                        components: [this._backCollector()]
                    }]
            });
        }
        else
            return Number(amount);
    }
    _backCollector() {
        this._collector?.stop();
        this._collector = this.msg.createMessageComponentCollector({
            filter: (i) => i.user.id === this.message.author.id && i.customId === 'back',
            time: 60000,
            max: 1
        });
        this._collector.on('collect', async (int) => {
            await int.deferUpdate();
            return this._init();
        });
        this._collector.on('end', async (_, reason) => {
            if (reason === 'time') {
                await _structure_1.Utils.disableComponents({ message: this.msg });
            }
        });
        return {
            type: 2,
            label: 'Назад',
            style: 4,
            custom_id: 'back'
        };
    }
}
exports.default = Award;
