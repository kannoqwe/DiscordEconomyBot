import { Snowflake } from 'discord.js';
import TransactionsTypes from '../../../types/TransactionsType';

export default interface ITransaction {
    userId: Snowflake;
    type: TransactionsTypes;
    amount: number;
    additional?: Snowflake;
}