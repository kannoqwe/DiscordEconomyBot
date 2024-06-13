import ITransaction from './interfaces/ITransaction';
import TransactionsTypes from '../../types/TransactionsType';
import { Snowflake } from 'discord.js';
import UserEntity from '#entities/UserEntity';
import TransactionEntity from '#entities/TransactionEntity';
import { Utils } from '#structure';

export default class ConfirmedTransaction {
    public userId: Snowflake;
    public type: TransactionsTypes;
    public amount: number;
    public additional: Snowflake | undefined;
    public row!: UserEntity;

    constructor(options: ITransaction) {
        this.userId = options.userId;
        this.type = options.type;
        this.amount = options.amount;
        this.additional = options.additional;
    }

    public async setup() {
        this.row = await UserEntity.findOrCreate({ userId: this.userId });
        this.row.balance -= this.amount;
        await this.row.save();
    }

    public async confirm() {
        return TransactionEntity.create({
            userId: this.userId,
            type: this.type,
            amount: this.amount,
            additional: this.additional,
            time: Utils.unixTime(),
            operationType: 'withdraw'
        }).save();
    }

    public cancel() {
        this.row.balance += this.amount;
    }
}