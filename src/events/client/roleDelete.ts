import PersonalRolesEntity from '#entities/PersonalRoles';
import { Event, Config } from '#structure';
import { Events, Role } from 'discord.js';
import DeleteRole from '../../modules/PersonalRoles/DeleteRole';

module.exports = class EventRoleDelete extends Event {
    constructor() {
        super(Events.GuildRoleDelete);
    }

    async execute(role: Role) {
        if (role.guild.id !== Config.guild) return;

        const row = await PersonalRolesEntity.findOneBy({ roleId: role.id });
        if (row) await DeleteRole(this.client, role);
    }
};
