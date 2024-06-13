import PersonalRolesEntity from '#entities/PersonalRoles';
import { Role } from 'discord.js';
import Transaction from '../../classes/Transaction/Transaction';
import { Config, Client } from '#structure';

export default async (client: Client, role: Role) => {
    const memberRows = await PersonalRolesEntity.findBy({ roleId: role.id });

    for (const memberRow of memberRows) {
        if (!memberRow.bought) return;

        const { userId, created_at, boughtPrice } = memberRow;
        const user = client.users.cache.get(userId);
        if (!user) return;
        
        const msInDay = 24 * 60 * 60 * 1000;
        const currentDate = new Date();
        const timeDifference = currentDate.getTime() - created_at.getTime();
        const daysPassed = Math.floor(timeDifference / msInDay);
        const daysRemaining = 30 - daysPassed;

        const refundAmount = Math.floor((boughtPrice / 30) * daysRemaining);
        await Transaction.award({
            type: 'REFUND_PROLE',
            userId: user.id,
            amount: refundAmount
        });

        return user.send({
            embeds: [{
                title: 'Сумма возмещения',
                description: `${user.toString()}, одна из ролей в вашем инвентаре была удалена. Вам предоставляется возмещение в **${refundAmount} ${client.walletEmoji}**.`,
                color: Config.colors.main,
                thumbnail: { url: user.displayAvatarURL() }
            }]
        }).catch((e: Error) => e);
    }

    await Promise.all([
        PersonalRolesEntity.delete({ roleId: role.id }) 
    ]);
    await role.delete().catch(e => e);
};