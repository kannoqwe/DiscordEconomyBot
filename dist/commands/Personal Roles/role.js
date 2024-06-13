"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const structure_1 = require("../../structure");
const discord_js_1 = require("discord.js");
class RoleCommand extends structure_1.AppCommand {
    constructor() {
        super('role', {
            description: 'Личная роль',
            options: [
                {
                    name: 'create',
                    type: discord_js_1.ApplicationCommandOptionType.Subcommand,
                    description: 'Создать личную роль',
                    options: [
                        {
                            name: 'name',
                            type: discord_js_1.ApplicationCommandOptionType.String,
                            description: 'Название личной роли',
                            required: true
                        },
                        {
                            name: 'color',
                            type: discord_js_1.ApplicationCommandOptionType.String,
                            description: 'Цвет личной роли',
                            required: true
                        }
                    ]
                },
                {
                    name: 'info',
                    type: discord_js_1.ApplicationCommandOptionType.Subcommand,
                    description: 'Информация о личной роли',
                    options: [
                        {
                            name: 'role',
                            type: discord_js_1.ApplicationCommandOptionType.Role,
                            description: 'Личная роль',
                            required: true
                        }
                    ]
                },
                {
                    name: 'manage',
                    type: discord_js_1.ApplicationCommandOptionType.Subcommand,
                    description: 'Управление личной ролью'
                }
            ]
        });
    }
    execute() { }
}
exports.default = RoleCommand;
