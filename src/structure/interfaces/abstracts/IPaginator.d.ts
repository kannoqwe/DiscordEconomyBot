import { CommandInteraction } from 'discord.js';

export default interface IPaginator {
    interaction: CommandInteraction,
    rows: any[],
    maxRowsOnPage: number,
    extendedButtons?: boolean
}