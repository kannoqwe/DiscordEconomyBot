import { Button } from '#structure';
import { ButtonInteraction } from 'discord.js';
import RoleManage from '../RoleManage';

export default class GiveRole extends Button {
    constructor() {
        super('GiveRole');
    }

    async execute(interaction: ButtonInteraction<'cached'>, manage: RoleManage) {

    }
}