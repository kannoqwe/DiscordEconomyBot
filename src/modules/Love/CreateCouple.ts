import { GuildMember } from 'discord.js';
import CouplesEntity from '#entities/CouplesEntity';
import { Config, Utils } from '#structure';

export default async function CreateCouple(firstUser: GuildMember, secondUser: GuildMember) {
    const unix = Utils.unixTime();
    await CouplesEntity.create({
        firstUserId: firstUser.id,
        secondUserId: secondUser.id,
        createdTimestamp: unix,
        payTimestamp: unix + 2592000,
        notificationTimestamp: unix + 2505600
    }).save();

    const role = firstUser.roles.cache.get(Config.roles.love);
    if (role) {
        await firstUser.roles.add(role);
        await secondUser.roles.add(role);
    }
}