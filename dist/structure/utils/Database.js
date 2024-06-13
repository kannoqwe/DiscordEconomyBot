"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _structure_1 = require("#structure");
const typeorm_1 = require("typeorm");
class Database {
    static async authenticate() {
        const AppDataSource = new typeorm_1.DataSource({
            type: 'mysql',
            host: 'localhost',
            port: 3306,
            database: 'test',
            username: 'root',
            password: '123123',
            synchronize: true,
            logging: ['error'],
            entities: [
                'dist/entities/*.js'
            ],
            migrations: [
                'dist/migrations/*.js'
            ]
        });
        await AppDataSource.initialize()
            .then(() => _structure_1.Logger.log('База данных инициализированы!'))
            .catch(() => _structure_1.Logger.log('Не удалось инициализировать базу данных'));
        return AppDataSource;
    }
}
exports.default = Database;
