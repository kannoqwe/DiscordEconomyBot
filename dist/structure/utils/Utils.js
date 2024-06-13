"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const config_1 = __importDefault(require("../../config"));
const parse_color_1 = __importDefault(require("parse-color"));
class Utils {
    static async scanDirectory(directory) {
        const files = await fs.promises.readdir(directory);
        const filePaths = [];
        for (const file of files) {
            const filePath = path.join(directory, file);
            const stats = await fs.promises.stat(filePath);
            if (stats.isDirectory()) {
                const subDirectoryFiles = await Utils.scanDirectory(filePath);
                filePaths.push(...subDirectoryFiles);
            }
            else {
                filePaths.push(filePath);
            }
        }
        return filePaths;
    }
    static sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    static async showModal(interaction, title, customId, options) {
        const components = [];
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
            if (int.replied)
                return false;
            await int.deferUpdate();
            return int;
        })
            .catch(e => e);
    }
    static unixTime() {
        return Math.floor(new Date().getTime() / 1000);
    }
    static snakeToCamelCase(str) {
        return str.replace(/([-_][a-z])/ig, ($1) => {
            return $1.toUpperCase()
                .replace('-', '')
                .replace('_', '');
        });
    }
    static resolveColor(str) {
        const color = (0, parse_color_1.default)(str);
        return color.hex;
    }
    static sendErrorToDeveloper(client, error) {
        const embed = {
            color: config_1.default.colors.error,
            fields: [
                { name: 'Error', value: `\`\`\`${error.toString()}\`\`\`` },
                { name: 'Stack', value: `\`\`\`${Utils.getStackForEmbed(error)}\`\`\`` }
            ]
        };
        config_1.default.developers.forEach((id) => {
            const developer = client.users.cache.get(id);
            if (!developer)
                return;
            developer.send({ embeds: [embed] }).catch((e) => e);
        });
    }
    static getStackForEmbed(error) {
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
    static async disableComponents({ interaction, message }) {
        const msg = interaction ? await interaction.fetchReply() : message;
        if (!msg)
            return;
        const updatedComponents = msg.components.map(actionRow => ({
            type: actionRow.type,
            components: actionRow.components.map(component => ({
                ...component.data,
                disabled: true
            }))
        }));
        return msg.edit({ components: updatedComponents });
    }
    static async sendUser(user, options) {
        return user.send(options)
            .then(() => true)
            .catch(() => false);
    }
    static selectUserComponents(custom_id, placeholder) {
        return {
            type: 1,
            components: [{
                    type: 5,
                    custom_id,
                    placeholder: placeholder || 'Укажите пользователя'
                }]
        };
    }
    static timeoutDelete(message, ms) {
        setTimeout(async () => {
            await message.delete().catch(e => e);
        }, ms);
    }
}
exports.default = Utils;
