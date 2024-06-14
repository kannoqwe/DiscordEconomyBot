import { CommandInteraction, GuildMember } from 'discord.js';
import ProfileRender from './ProfileRender';

export default class ProfileManage {
    public interaction: CommandInteraction<'cached'>;
    public target: GuildMember;

    constructor(interaction: CommandInteraction<'cached'>, target: GuildMember) {
        this.interaction = interaction;
        this.target = target;

        void this._init();
    }

    private async _init() {
        const profile = new ProfileRender(this.interaction, this.target);
        const attachment = await profile.render();

        await this.interaction.editReply({
            embeds: [],
            files: [attachment]
        });
    }
}