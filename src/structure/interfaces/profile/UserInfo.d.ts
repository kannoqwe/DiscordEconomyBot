import { GuildMember } from 'discord.js';
import Profiles from '../../../types/ProfileType';
import Frames from '../../../types/FrameType';

export default interface IUserInfo {
    member: GuildMember;
    profile: Profiles
    frame: Frames;
}