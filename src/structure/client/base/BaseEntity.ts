import { BaseEntity as TypeORMBaseEntity, ObjectType, FindOneOptions } from 'typeorm';

export default class BaseEntity extends TypeORMBaseEntity {
    static async findOrCreate<T extends BaseEntity>(this: ObjectType<T>, conditions: FindOneOptions<T>['where']): Promise<T> {
        const self = this as any;
        let entity = await self.findOne({ where: conditions });

        if (!entity) {
            entity = new self();
            Object.assign(entity, conditions);
            await entity.save();
        }

        return entity;
    }
}

