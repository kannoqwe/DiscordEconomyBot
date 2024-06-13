"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const UserEntity_1 = __importDefault(require("#entities/UserEntity"));
const TransactionEntity_1 = __importDefault(require("#entities/TransactionEntity"));
const _structure_1 = require("#structure");
class ConfirmedTransaction {
    constructor(options) {
        this.userId = options.userId;
        this.type = options.type;
        this.amount = options.amount;
        this.additional = options.additional;
    }
    async setup() {
        this.row = await UserEntity_1.default.findOrCreate({ userId: this.userId });
        this.row.balance -= this.amount;
        await this.row.save();
    }
    async confirm() {
        return TransactionEntity_1.default.create({
            userId: this.userId,
            type: this.type,
            amount: this.amount,
            additional: this.additional,
            time: _structure_1.Utils.unixTime(),
            operationType: 'withdraw'
        }).save();
    }
    cancel() {
        this.row.balance += this.amount;
    }
}
exports.default = ConfirmedTransaction;
