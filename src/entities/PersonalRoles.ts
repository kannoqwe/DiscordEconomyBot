import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';
import BaseEntity from '../structure/client/base/BaseEntity';
import { Snowflake } from 'discord.js';

@Entity('personal_roles')
export default class PersonalRolesEntity extends BaseEntity {
    @CreateDateColumn()
        created_at!: Date;

    @PrimaryGeneratedColumn()
        id?: number;

    @Column()
        userId!: Snowflake;

    @Column()
        roleId!: Snowflake;
    
    @Column({ default: 'USER' })
        type!: 'OWNER' | 'USER';

    @Column({ default: false })
        bought!: boolean;
    @Column({ nullable: true })
        boughtPrice!: number;

    @Column({ default: false })
        autoRenewal!: boolean;

    @Column({ nullable: true })
        payTimestamp!: number;

    @Column({ nullable: true })
        payNotifyTimestamp!: number;
}
