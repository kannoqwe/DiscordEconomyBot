import { TextInputStyle } from 'discord.js';
export default interface IModal {
    custom_id: string;
    label: string;
    placeholder?: string;
    style?: TextInputStyle;
    required?: boolean;
    max_length?: number;
    min_length?: number;
}