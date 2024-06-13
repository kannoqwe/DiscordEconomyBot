import * as fs from 'fs';
import * as path from 'path';
import { Client } from '../index';
import Config from '../../config';
import {
    ButtonInteraction, CommandInteraction,
    Message,
    APIActionRowComponent,
    APITextInputComponent, ModalSubmitInteraction,
    User,
    MessageCreateOptions,
    GuildMember
} from 'discord.js';
import IModal from '../interfaces/utils/IModal';
import parseColor from 'parse-color';

export default class Utils {
    static async scanDirectory(directory: string): Promise<string[]> {
        const files: string[] = await fs.promises.readdir(directory);
        const filePaths: string[] = [];
        for (const file of files) {
            const filePath: string = path.join(directory, file);
            const stats: fs.Stats = await fs.promises.stat(filePath);

            if (stats.isDirectory()) {
                const subDirectoryFiles: string[] = await Utils.scanDirectory(filePath);
                filePaths.push(...subDirectoryFiles);
            } else {
                filePaths.push(filePath);
            }
        }
        return filePaths;
    }

    static sleep(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    static async showModal(interaction: CommandInteraction | ButtonInteraction, title: string, customId: string, options: IModal[]): Promise<ModalSubmitInteraction> {
        const components: APIActionRowComponent<APITextInputComponent>[] = [];
        options.map(option => components.push({
            type: 1,
            components: [{
                type: 4,
                custom_id: option.custom_id,
                label: option.label,
                placeholder: option.placeholder ?? undefined,
                style: option.style ?? 1,
                required: option.required ?? true,
                max_length: option.max_length ?? 4000,
                min_length: option.min_length ?? 1
            }]
        }));
        await interaction.showModal({
            custom_id: customId,
            title,
            components
        });
        return interaction.awaitModalSubmit({
            filter: (i) => i.user.id === interaction.user.id && i.customId === customId,
            time: 60000
        })
            .then(async (int) => {
                if (int.replied) return false;
                await int.deferUpdate();
                return int;
            })
            .catch(e => e);
    }

    static unixTime () {
        return Math.floor(new Date().getTime() / 1000);
    }

    static snakeToCamelCase (str: string) {
        return str.replace(/([-_][a-z])/ig, ($1) => {
            return $1.toUpperCase()
                .replace('-', '')
                .replace('_', '');
        });
    }

    static resolveColor (str: string) {
        const color = parseColor(str);
        return color.hex;
    }

    static sendErrorToDeveloper(client: Client, error: Error) {
        const embed = {
            color: Config.colors.error,
            fields: [
                { name: 'Error', value: `\`\`\`${error.toString()}\`\`\`` },
                { name: 'Stack', value: `\`\`\`${Utils.getStackForEmbed(error)}\`\`\`` }
            ]
        };

        Config.developers.forEach((id) => {
            const developer = client.users.cache.get(id);
            if (!developer) return;

            developer.send({ embeds: [embed] }).catch((e) => e);
        });
    }

    static getStackForEmbed (error: Error) {
        let stackString = '';

        if (error.stack) {
            const stack = error.stack.split('\n');

            let nextLine = stack.shift();
            while (nextLine && (`${stackString}\n${nextLine}\n...`).length < 1000) {
                stackString += `\n${nextLine}`;
                nextLine = stack.shift();
            }

            if (stack.length >= 1) {
                stackString += '\n...';
            }
        }

        return stackString;
    }

    static async disableComponents({ interaction, message }: { interaction?: CommandInteraction | ButtonInteraction, message?: Message }) {
        const msg = interaction ? await interaction.fetchReply() : message;
        if (!msg) return;

        const updatedComponents = msg.components.map(actionRow => ({
            type: actionRow.type,
            components: actionRow.components.map(component => ({
                ...component.data,
                disabled: true
            }))
        }));
        return msg.edit({ components: updatedComponents });
    }

    static async sendUser(user: User | GuildMember, options: MessageCreateOptions): Promise<boolean> {
        return user.send(options)
            .then(() => true)
            .catch(() => false);
    }

    static selectUserComponents(custom_id: string, placeholder?: string) {
        return {
            type: 1,
            components: [{
                type: 5,
                custom_id,
                placeholder: placeholder || 'Укажите пользователя'
            }]
        };
    }

    static timeoutDelete(message: Message, ms: number) {
        setTimeout(async () => {
            await message.delete().catch(e => e);
        }, ms);
    }
}
