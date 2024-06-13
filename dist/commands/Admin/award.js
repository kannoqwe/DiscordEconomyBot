"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const _structure_1 = require("#structure");
const Award_1 = __importDefault(require("../../classes/Admin/Award"));
class CommandAward extends _structure_1.MsgCommand {
    constructor() {
        super('award', {
            minArgs: 1,
            permissions: ['ADMIN', 'CURATOR', 'MASTER']
        });
    }
    async execute(message, memberId) {
        const target = message.mentions.users.first() || this.client.users.cache.get(memberId);
        if (!target)
            return message.channel.send({
                embeds: [{
                        title: 'Управление балансом',
                        description: `${message.author.toString()}, не удалось **найти** пользователя.`,
                        color: _structure_1.Config.colors.main,
                        thumbnail: { url: message.author.displayAvatarURL() }
                    }]
            })
                .then(msg => {
                setTimeout(() => {
                    msg.delete().catch(e => e);
                }, 30000);
            });
        new Award_1.default(this.client, message, target);
    }
}
exports.default = CommandAward;
