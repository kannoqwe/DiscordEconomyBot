import { ClientOptions } from 'discord.js';
export default interface IClient extends ClientOptions {
    token: string;
}
