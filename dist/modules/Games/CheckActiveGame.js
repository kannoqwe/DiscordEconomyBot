"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const GenerateMessageLink_1 = __importDefault(require("./GenerateMessageLink"));
const _structure_1 = require("#structure");
const discord_js_1 = require("discord.js");
const HasActiveGame_1 = __importDefault(require("./HasActiveGame"));
async function CheckActiveGame(title, client, interaction, user) {
    if (!await (0, HasActiveGame_1.default)(client, user.id))
        return false;
    const link = (0, GenerateMessageLink_1.default)(client, user.id);
    const embed = new discord_js_1.EmbedBuilder()
        .setTitle(title)
        .setColor(_structure_1.Config.colors.main)
        .setThumbnail(user.displayAvatarURL())
        .setDescription(`${user.toString()}, у вас есть [активная игра](${link}).`);
    if (interaction.replied) {
        await interaction.editReply({ embeds: [embed] });
    }
    else {
        await interaction.reply({ embeds: [embed], ephemeral: true });
    }
    return true;
}
exports.default = CheckActiveGame;
