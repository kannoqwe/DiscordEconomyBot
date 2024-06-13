"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const UserEntity_1 = __importDefault(require("#entities/UserEntity"));
const TransactionEntity_1 = __importDefault(require("#entities/TransactionEntity"));
const _structure_1 = require("#structure");
class Transaction {
    static async award(options) {
        return Transaction.performTransaction('award', options);
    }
    static async withdraw(options) {
        const row = await UserEntity_1.default.findOrCreate({ userId: options.userId });
        if (row.balance < options.amount)
            return false;
        return Transaction.performTransaction('withdraw', options);
    }
    static async set(options) {
        return Transaction.performTransaction('set', options);
    }
    static async performTransaction(type, options) {
        const row = await UserEntity_1.default.findOrCreate({ userId: options.userId });
        let newBalance;
        switch (type) {
            case 'award':
                newBalance = row.balance + options.amount;
                break;
            case 'withdraw':
                newBalance = row.balance - options.amount;
                break;
            case 'set':
                newBalance = options.amount;
                break;
        }
        row.balance = newBalance;
        await row.save();
        await TransactionEntity_1.default.create({
            userId: options.userId,
            type: options.type,
            amount: options.amount,
            additional: options.additional || '',
            time: _structure_1.Utils.unixTime(),
            operationType: type
        }).save();
        return true;
    }
}
exports.default = Transaction;
