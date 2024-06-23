import TransactionEntity from '#entities/TransactionEntity';
import { Snowflake } from 'discord.js';
import { Config } from '#structure';
import TransactionsTypes from '../../types/TransactionsType';

export default function (row: TransactionEntity) {
    const { amount, type, additional, operationType, time } = row;
    const operation = operationType === 'withdraw' ? Config.emoji.transactions.withdraw : Config.emoji.transactions.award;
    return `**${operation} ${amount} ${Config.currency.wallet.emoji}** — <t:${time}:f>\n${convertText(type, additional)}\n`;
}

const convertText = (type: TransactionsTypes, additional: Snowflake | null) => {
    switch (type) {
        case 'TIMELY':
            return 'Временная награда';
        case 'AWARD_GIVE':
            return `Выдал <@${additional}>`;
        case 'AWARD_REMOVE':
            return `Забрал <@${additional}>`;
        case 'AWARD_SET':
            return `Баланс установил <@${additional}>`;
        case 'GIVE_AWARD':
            return `Первод от — <@${additional}>`;
        case 'GIVE_WITHDRAW':
            return `Первод <@${additional}>`;
        case 'COINFLIP_WIN':
            return 'Победа в монетке';
        case 'COINFLIP_LOSE':
            return 'Проигрыш в монетке';
        case 'DUEL_WIN':
            return `Победа в дуэли против <@${additional}>`;
        case 'DUEL_LOSE':
            return `Проигрыш в дуэли против <@${additional}>`;
        case 'PROLE_GIVE':
            return `Выдали роль <@${additional}>`;
        case 'COUPLE_CREATE':
            return `Создание брака с <@${additional}>`;
        default:
            return 'Неизвестно';
    }
};
