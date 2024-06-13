"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const PersonalRoles_1 = __importDefault(require("#entities/PersonalRoles"));
const Transaction_1 = __importDefault(require("../../classes/Transaction/Transaction"));
const _structure_1 = require("#structure");
exports.default = async (client, role) => {
    const memberRows = await PersonalRoles_1.default.findBy({ roleId: role.id });
    for (const memberRow of memberRows) {
        if (!memberRow.bought)
            return;
        const { userId, created_at, boughtPrice } = memberRow;
        const user = client.users.cache.get(userId);
        if (!user)
            return;
        const msInDay = 24 * 60 * 60 * 1000;
        const currentDate = new Date();
        const timeDifference = currentDate.getTime() - created_at.getTime();
        const daysPassed = Math.floor(timeDifference / msInDay);
        const daysRemaining = 30 - daysPassed;
        const refundAmount = Math.floor((boughtPrice / 30) * daysRemaining);
        await Transaction_1.default.award({
            type: 'REFUND_PROLE',
            userId: user.id,
            amount: refundAmount
        });
        return user.send({
            embeds: [{
                    title: 'Сумма возмещения',
                    description: `${user.toString()}, одна из ролей в вашем инвентаре была удалена. Вам предоставляется возмещение в **${refundAmount} ${client.walletEmoji}**.`,
                    color: _structure_1.Config.colors.main,
                    thumbnail: { url: user.displayAvatarURL() }
                }]
        }).catch((e) => e);
    }
    await Promise.all([
        PersonalRoles_1.default.delete({ roleId: role.id })
    ]);
    await role.delete().catch(e => e);
};
