import PersonalRolesEntity from '#entities/PersonalRoles';
import { SubCommand, Config, Utils } from '../../../structure';
import { CommandInteraction, EmbedBuilder, GuildMember } from 'discord.js';
import IsUserHaveAmount from '../../../modules/Economy/HasBalance';
import CalculatePrice from '../../../modules/PersonalRoles/CalculatePrice';
import Confirmation from '../../../structure/abstracts/Confirmation';
import CreateRole from '../../../modules/PersonalRoles/CreateRole';
import Transaction from '../../../classes/Transaction/Transaction';
import ActiveGame from '../../../classes/Games/ActiveGame';

class CreateConfirmation extends Confirmation {
    async doSuccessfully(name: string, color: string, price: number) {
        const game = new ActiveGame(this.client, this.interaction.member as GuildMember);
        if (game.check()) {
            this.embed.setDescription(game.description);
            return this.interaction.editReply({ embeds: [this.embed], components: [] });
        }
        if (!await IsUserHaveAmount(this.interaction.user.id, price)) {
            this.embed.setDescription(`${this.interaction.user.toString()}, для создание **личной роли** необходимо **${price} ${this.client.walletEmoji}**`);
            return this.interaction.editReply({ embeds: [this.embed], components: [] });
        }

        this.embed.setDescription(`${this.interaction.user.toString()}, роль создается...`);
        await this.interaction.editReply({ embeds: [this.embed], components: [] });

        const role = await CreateRole(this.interaction.member as GuildMember, name, color);
        await Transaction.withdraw({
            type: 'PROLE_CREATE',
            userId: this.interaction.user.id,
            amount: price,
            additional: role.id
        });

        this.embed.setDescription(`${this.interaction.user.toString()}, Вы **создали** личную роль ${role} и заплатили **${price} ${this.client.walletEmoji}**`);
        this.client.emit('personalRoleCreate', role, this.interaction.member as GuildMember);
        return this.interaction.editReply({ embeds: [this.embed] });
    }

    doDenial() {
        this.embed.setDescription(`${this.interaction.user.toString()}, Вы **отменили** запрос на **создание** личной роли.`);
        return this.interaction.editReply({ embeds: [this.embed], components: [] });
    }
}

export default class RoleCreate extends SubCommand {
    constructor() {
        super('role create');
    }

    async execute(interaction: CommandInteraction<'cached'>, { name, color }: { name: string, color: string }) {
        const embed = new EmbedBuilder()
            .setTitle('Создать личную роль')
            .setColor(Config.colors.main)
            .setThumbnail(interaction.user.displayAvatarURL());

        const rows = await PersonalRolesEntity.findBy({ userId: interaction.user.id, type: 'OWNER' });
        if (rows.length >= Config.personalRoles.limit) {
            embed.setDescription(`${interaction.user.toString()}, Вы достигли **лимита** личных ролей, у вас **${rows.length}** ролей.`);
            return interaction.reply({ embeds: [embed], ephemeral: true });
        }
        if (interaction.guild!.roles.cache.size >= 250) {
            embed.setDescription(`${interaction.user.toString()}, на сервере достигнут **лимит** по колличеству **ролей**.`);
            return interaction.reply({ embeds: [embed], ephemeral: true });
        }
        const game = new ActiveGame(this.client, interaction.member);
        if (game.check()) {
            embed.setDescription(game.description);
            return interaction.reply({ embeds: [embed], ephemeral: true });
        }
        if (!Utils.resolveColor(color)) {
            embed.setDescription(`${interaction.user.toString()}, Вы ввели **неверный** цвет роль. [Примеры](https://colorscheme.ru/html-colors.html)`);
            return interaction.reply({ embeds: [embed], ephemeral: true });
        }

        const price = await CalculatePrice(interaction.user.id);
        return new CreateConfirmation(this.client, interaction, {
            title: embed.data.title || 'error',
            description: `Вы **уверены**, что хотите **создать** личную роль \`${name}\` с цветом \`${color}\` за **${price} ${this.client.walletEmoji}**`,
            confirmingUser: interaction.member as GuildMember
        }).setup(name, color, price);
    }
}