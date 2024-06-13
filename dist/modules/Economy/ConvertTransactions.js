"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _structure_1 = require("#structure");
function default_1(row) {
    const { amount, type, additional, operationType, time } = row;
    const operation = operationType === 'withdraw' ? _structure_1.Config.emoji.transactions.withdraw : _structure_1.Config.emoji.transactions.award;
    return `**${operation} ${amount} ${_structure_1.Config.currency.wallet.emoji}** — <t:${time}:f>\n${convertText(type, additional)}\n`;
}
exports.default = default_1;
const convertText = (type, additional) => {
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
        default:
            return 'Неизвестно';
    }
};
