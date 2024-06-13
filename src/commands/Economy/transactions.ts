import { AppCommand, Config } from '../../structure';
import { ApplicationCommandOptionType, CommandInteraction, EmbedBuilder, GuildMember } from 'discord.js';
import TransactionEntity from '#entities/TransactionEntity';
import Paginator from '../../structure/abstracts/Paginator';
import ConvertTransactions from '../../modules/Economy/ConvertTransactions';

class Pages extends Paginator {
    protected renderPage(pageRows: TransactionEntity[], target: GuildMember): EmbedBuilder {
        const embed = new EmbedBuilder()
            .setTitle(`История транзакций — ${target.user.displayName}`)
            .setColor(Config.colors.main)
            .setThumbnail(target.displayAvatarURL());
        let description = '';

        for (const row of pageRows) {
            description += ConvertTransactions(row);
        }
        if (description !== '') embed.setDescription(description);
        return embed;
    }
}

export default class Transactions extends AppCommand {
    constructor() {
        super('transactions', {
            description: 'Посмотреть транзакции',
            options: [{
                name: 'member',
                description: 'Пользователь, чьи транзации вы хотите посмотреть',
                type: ApplicationCommandOptionType.User
            }]
        });
    }

    async execute(interaction: CommandInteraction<'cached'>, { member }: { member?: GuildMember }) {
        const target = member || interaction.member as GuildMember;
        const rows = await TransactionEntity.find({
            where: { userId: target.id },
            order: { id: 'DESC' }
        });
        await new Pages({
            interaction,
            rows,
            maxRowsOnPage: 7
        }).setup(target);
    }
}