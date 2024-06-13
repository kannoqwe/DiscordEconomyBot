import ITransaction from './interfaces/ITransaction';
import UserEntity from '#entities/UserEntity';
import TransactionEntity from '#entities/TransactionEntity';
import { Utils } from '#structure';

export default class Transaction {
    static async award(options: ITransaction) {
        return Transaction.performTransaction('award', options);
    }

    static async withdraw(options: ITransaction) {
        const row = await UserEntity.findOrCreate({ userId: options.userId });
        if (row.balance < options.amount) return false;

        return Transaction.performTransaction('withdraw', options);
    }

    static async set(options: ITransaction) {
        return Transaction.performTransaction('set', options);
    }

    static async performTransaction(type: 'withdraw' | 'award' | 'set', options: ITransaction) {
        const row = await UserEntity.findOrCreate({ userId: options.userId });
        let newBalance: number;
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
        await TransactionEntity.create({
            userId: options.userId,
            type: options.type,
            amount: options.amount,
            additional: options.additional || '',
            time: Utils.unixTime(),
            operationType: type
        }).save();
        
        return true;
    }
}