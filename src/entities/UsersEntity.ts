import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import BaseEntity from '../structure/client/base/BaseEntity';
import { Snowflake } from 'discord.js';
import Profiles from '../types/ProfileType';
import Frames from '../types/FrameType';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';

@Entity('users')
export default class UsersEntity extends BaseEntity {
    @PrimaryGeneratedColumn()
        id?: number;

    @Column()
        userId!: Snowflake;

    @Column({ default: 0 })
        balance!: number;
    @Column({ default: 0 })
        donate!: number;

    @Column({ default: 1 })
        lvl!: number;
    @Column({ default: 0 })
        exp!: number;

    @Column({ default: 'DEFAULT' })
        profile!: Profiles;
    @Column({ default: 'DEFAULT' })
        frame!: Frames;
    
    @Column({ default: 0 })
        timelyTime!: number;

    async update(options: QueryDeepPartialEntity<UsersEntity>) {
        return UsersEntity.update({ id: this.id }, options);
    }
}
