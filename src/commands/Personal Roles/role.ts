import { AppCommand } from '../../structure';
import { ApplicationCommandOptionType } from 'discord.js';

export default class RoleCommand extends AppCommand {
    constructor() {
        super('role', {
            description: 'Личная роль',
            options: [
                {
                    name: 'create',
                    type: ApplicationCommandOptionType.Subcommand,
                    description: 'Создать личную роль',
                    options: [
                        {
                            name: 'name',
                            type: ApplicationCommandOptionType.String,
                            description: 'Название личной роли',
                            required: true
                        },
                        {
                            name: 'color',
                            type: ApplicationCommandOptionType.String,
                            description: 'Цвет личной роли',
                            required: true
                        }
                    ]
                },
                {
                    name: 'info',
                    type: ApplicationCommandOptionType.Subcommand,
                    description: 'Информация о личной роли',
                    options: [
                        {
                            name: 'role',
                            type: ApplicationCommandOptionType.Role,
                            description: 'Личная роль',
                            required: true
                        }
                    ]
                },
                {
                    name: 'manage',
                    type: ApplicationCommandOptionType.Subcommand,
                    description: 'Управление личной ролью'
                }
            ]
        });
    }

    execute() {}
}
