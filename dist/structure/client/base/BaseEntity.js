"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const typeorm_1 = require("typeorm");
class BaseEntity extends typeorm_1.BaseEntity {
    static async findOrCreate(conditions) {
        const self = this;
        let entity = await self.findOne({ where: conditions });
        if (!entity) {
            entity = new self();
            Object.assign(entity, conditions);
            await entity.save();
        }
        return entity;
    }
}
exports.default = BaseEntity;
