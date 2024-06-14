import { Config, Logger } from '#structure';
import { DataSource } from 'typeorm';

export default class Database {
    static async authenticate () {
        const AppDataSource = new DataSource({
            type: 'mysql',
            host: Config.database.host,
            port: Config.database.port,
            database: Config.database.database,
            username: Config.database.username,
            password: Config.database.password,
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
