import { Client, Config, Utils } from '#structure';
import { BaseMessageOptions, ButtonInteraction, EmbedBuilder, Message, ModalSubmitInteraction, User } from 'discord.js';
import CollectorType from '../../types/CollectorType';
import Transaction from '../Transaction/Transaction';

enum ConvertId {
    give = 'Выдать',
    remove = 'Забрать',
    set = 'Установить'
}

export default class Award {
    public client: Client;
    public message: Message;
    public target: User;
    public msg!: Message;
    public embed!: EmbedBuilder;
    private _collector!: CollectorType;

    constructor(client: Client, message: Message, target: User) {
        this.client = client;
        this.message = message;
        this.target = target;

        void this._init();
    }

    private async _init() {
        this.embed = new EmbedBuilder()
            .setTitle(`Управление балансом — ${this.target.displayName}`)
            .setDescription(`${this.message.author.toString()}, для **взаймодествие** с балансом, используйте **кнопки**.`)
            .setColor(Config.colors.main)
            .setThumbnail(this.target.displayAvatarURL());
        const options: BaseMessageOptions = {
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
        if (!this.msg) this.msg = await this.message.channel.send(options);
        else await this.msg.edit(options);

        return this._manage();
    }

    private async _manage() {
        const collector = this.msg.createMessageComponentCollector({
            filter: (i) => i.user.id === this.message.author.id,
            max: 1,
            time: 60000
        });
        collector.on('collect', async (int: ButtonInteraction) => {
            let amount: number | undefined;
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
                    if (!amount) return;
                    await Transaction.award({
                        userId: this.target.id,
                        type: 'AWARD_GIVE',
                        amount,
                        additional: this.message.author.id
                    });
                    break;
                case 'remove':
                    if (!amount) return;
                    await Transaction.withdraw({
                        userId: this.target.id,
                        type: 'AWARD_REMOVE',
                        amount,
                        additional: this.message.author.id
                    });
                    break;
                case 'set':
                    if (!amount) return;
                    await Transaction.set({
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
                > Операция: **${ConvertId[int.customId as keyof typeof ConvertId]}**
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
    
    private async _modal(int: ButtonInteraction) {
        const modal: ModalSubmitInteraction = await Utils.showModal(int, ConvertId[int.customId as keyof typeof ConvertId], 'awardModal', [{
            custom_id: 'amount',
            label: 'Количество монет:'
        }]);
        if (!modal.deferred) return;
        const amount: string = modal.fields.getTextInputValue('amount');
        if (!amount || isNaN(Number(amount)) || Number(amount) > Number.MAX_SAFE_INTEGER) {
            this.embed.setDescription(`${this.message.author.toString()}, вы не правильно ввели **сумму**`);
            await this.msg.edit({
                embeds: [this.embed],
                components: [{
                    type: 1,
                    components: [this._backCollector()]
                }]
            });
        } else return Number(amount);
    }

    private _backCollector() {
        this._collector?.stop();
        this._collector = this.msg.createMessageComponentCollector({
            filter: (i) => i.user.id === this.message.author.id && i.customId === 'back',
            time: 60000,
            max: 1
        });
        this._collector.on('collect', async (int: ButtonInteraction) => {
            await int.deferUpdate();
            return this._init();
        });
        this._collector.on('end', async (_, reason) => {
            if (reason === 'time') {
                await Utils.disableComponents({ message: this.msg });
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