import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import BaseEntity from '../structure/client/base/BaseEntity';
import { Snowflake } from 'discord.js';

@Entity('users')
export default class UserEntity extends BaseEntity {
    @PrimaryGeneratedColumn()
        id?: number;

    @Column()
        userId!: Snowflake;

    @Column({
        default: 0,
        type: 'bigint'
    })
        balance!: number;
    
    @Column({ default: 0 })
        timelyTime!: number;
}
