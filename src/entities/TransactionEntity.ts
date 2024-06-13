import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import BaseEntity from '../structure/client/base/BaseEntity';
import { Snowflake } from 'discord.js';
import TransactionsTypes from '../types/TransactionsType';

@Entity('transactions')
export default class TransactionEntity extends BaseEntity {
    @PrimaryGeneratedColumn()
        id?: number;

    @Column()
        userId!: Snowflake;

    @Column()
        type!: TransactionsTypes;

    @Column({ type: 'bigint' })
        amount!: number;

    @Column()
        additional!: Snowflake;

    @Column()
        time!: number;

    @Column({ type: 'varchar', nullable: true, default: null })
        operationType!: 'withdraw' | 'award' | 'set' | null;
}
