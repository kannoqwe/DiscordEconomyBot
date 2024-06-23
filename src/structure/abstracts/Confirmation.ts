import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, CommandInteraction, EmbedBuilder, GuildMember, InteractionReplyOptions, Message, MessageCreateOptions } from 'discord.js';
import IConfirmation from '../interfaces/abstracts/IConfirmation';
import { Config, Client } from '#structure';

const { accept, decline } = Config.confirmation;

export default abstract class Confirmation {
    public client: Client;
    public interaction: CommandInteraction | ButtonInteraction;
    public confirmingUser: GuildMember;
    public collectorTime: number;
    public embed: EmbedBuilder;
    public dm: boolean;
    public confirmingMessage!: Message;

    constructor(client: Client, interaction: CommandInteraction | ButtonInteraction, options: IConfirmation) {
        this.client = client;
        this.interaction = interaction;
        this.confirmingUser = options.confirmingUser;
        this.collectorTime = options?.collectorTime || 60000;
        // Если отправить в лс
        this.dm = options?.dm || false;

        this.embed = new EmbedBuilder()
            .setTitle(options.title)
            .setDescription(`${this.confirmingUser.toString()}, ${options.description}\nДля **согласия** нажмите на ${accept.emoji}, для **отказа** на ${decline.emoji}`)
            .setColor(Config.colors.main)
            .setThumbnail(this.confirmingUser.displayAvatarURL());
    }

    abstract doSuccessfully(...args: any): any;
    abstract doDenial(...args: any): any;
    onTimeout?(...args: any): any;

    public async setup(...args: any) {
        const options: InteractionReplyOptions = {
            content: this.confirmingUser.toString(),
            embeds: [this.embed],
            components: [new ActionRowBuilder<ButtonBuilder>().addComponents(
                new ButtonBuilder().setEmoji(accept.emoji).setStyle(accept.color).setCustomId('accept'),
                new ButtonBuilder().setEmoji(decline.emoji).setStyle(decline.color).setCustomId('decline')
            )]
        };
        let message: Message<boolean>;
        if (!this.dm) {
            if (this.interaction.replied) await this.interaction.editReply(options);
            else await this.interaction.reply(options);
            message = await this.interaction.fetchReply() as Message;
        } else message = await this.confirmingUser.send(options as MessageCreateOptions)
            .catch(async () => this.interaction.channel!.send(options as MessageCreateOptions));

        const collector = message.createMessageComponentCollector({
            filter: (i) => i.user.id === this.confirmingUser.id,
            max: 1,
            time: this.collectorTime
        });

        collector.on('collect', async (int: ButtonInteraction) => {
            await int.deferUpdate();
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
                if (this.onTimeout) this.onTimeout(...args);
            }
        });
    }
}