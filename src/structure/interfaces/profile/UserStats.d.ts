import IUserInfo from './UserInfo';
import { GuildMember } from 'discord.js';

export default interface IUserStats extends IUserInfo {
    couple?: GuildMember;
    standardCurrency: number;
    donateCurrency: number;
    likes: number;
    dislikes: number;
    message: number;
    online: number;
    top: number;
    lvl: number;
    exp: number;
}