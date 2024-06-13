import StaffType from '../../../../types/StaffType';
import { ApplicationCommandOptionData } from 'discord.js';

export default interface IAppCommand {
    description: string;
    options?: ApplicationCommandOptionData[];
    ignore?: boolean;
    permissions?: StaffType[]
}

