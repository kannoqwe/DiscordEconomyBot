import { CommandInteraction, GuildMember } from 'discord.js';
import ProfileRender from './ProfileRender';
import UsersEntity from '#entities/UsersEntity';

export default class ProfileManage {
    public interaction: CommandInteraction<'cached'>;
    public target: GuildMember;

    constructor(interaction: CommandInteraction<'cached'>, target: GuildMember) {
        this.interaction = interaction;
        this.target = target;

        void this._init();
    }

    private async _init() {
        const row = await UsersEntity.findOrCreate({ userId: this.target.id });

        const profile = new ProfileRender(this.interaction, {
            member: this.target,
            profile: row.profile,
            frame: row.frame,
            standardCurrency: row.balance,
            donateCurrency: row.donate,
            likes: 10,
            dislikes: 5,
            message: 1000,
            online: 5651410,
            top: 1,
            lvl: 23,
            exp: 2800
        });
        const attachment = await profile.render();

        await this.interaction.editReply({
            embeds: [],
            files: [attachment]
        });
    }
}