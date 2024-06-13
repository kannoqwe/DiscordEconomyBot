import { Logger } from '#structure';
import { DataSource } from 'typeorm';

export default class Database {
    static async authenticate () {
        const AppDataSource = new DataSource({
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
            .then(() => Logger.log('База данных инициализированы!'))
            .catch(() => Logger.log('Не удалось инициализировать базу данных'));
        return AppDataSource;
    }
}
