"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const _structure_1 = require("#structure");
const { accept, decline } = _structure_1.Config.confirmation;
class Confirmation {
    constructor(client, interaction, options) {
        this.client = client;
        this.interaction = interaction;
        this.confirmingUser = options.confirmingUser;
        this.collectorTime = options?.collectorTime || 60000;
        // Если отправить в лс
        this.dm = options?.dm || false;
        this.embed = new discord_js_1.EmbedBuilder()
            .setTitle(options.title)
            .setDescription(`${this.confirmingUser.toString()}, ${options.description}\nДля **согласия** нажмите на ${accept.emoji}, для **отказа** на ${decline.emoji}`)
            .setColor(_structure_1.Config.colors.main)
            .setThumbnail(this.confirmingUser.displayAvatarURL());
    }
    async setup(...args) {
        const options = {
            content: this.confirmingUser.toString(),
            embeds: [this.embed],
            components: [new discord_js_1.ActionRowBuilder().addComponents(new discord_js_1.ButtonBuilder().setEmoji(accept.emoji).setStyle(accept.color).setCustomId('accept'), new discord_js_1.ButtonBuilder().setEmoji(decline.emoji).setStyle(decline.color).setCustomId('decline'))]
        };
        let message;
        if (!this.dm) {
            if (this.interaction.replied)
                await this.interaction.editReply(options);
            else
                await this.interaction.reply(options);
            message = await this.interaction.fetchReply();
        }
        else
            message = await this.confirmingUser.send(options)
                .catch(async () => this.interaction.channel.send(options));
        const collector = message.createMessageComponentCollector({
            filter: (i) => i.user.id === this.confirmingUser.id,
            max: 1,
            time: this.collectorTime
        });
        collector.on('collect', async (int) => {
            await int.deferUpdate();
            this.interaction = int;
            switch (int.customId) {
                case 'accept':
                    await this.doSuccessfully(...args);
                    break;
                case 'decline':
                    await this.doDenial(...args);
                    break;
            }
        });
        collector.on('end', (_, reason) => {
            if (reason === 'time') {
                this.embed.setDescription(`${this.confirmingUser.toString()}, время на ответ **вышло**`);
                message.edit({ embeds: [this.embed], components: [] });
                if (this.onTimeout)
                    this.onTimeout(...args);
            }
        });
    }
}
exports.default = Confirmation;
