import BaseEntity from '../structure/client/base/BaseEntity';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { Snowflake } from 'discord.js';

@Entity('couples')
export default class CouplesEntity extends BaseEntity {
    @PrimaryGeneratedColumn()
        id?: number;

    @Column()
        firstUserId!: Snowflake;

    @Column()
        secondUserId!: Snowflake;

    @Column({ default: 0 })
        online!: number;

    @Column({ nullable: true })
        roomName!: string;

    @Column()
        createdTimestamp!: number;

    @Column()
        notificationTimestamp!: number;

    @Column()
        payTimestamp!: number;
}