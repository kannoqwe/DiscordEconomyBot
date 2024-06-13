"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const BaseModule_1 = __importDefault(require("../base/BaseModule"));
class MsgCommand extends BaseModule_1.default {
    constructor(id, options) {
        super(id);
        this.id = id;
        this.commandName = id;
        this.ignore = options?.ignore || false;
        this.minArgs = options?.minArgs || 0;
        this.aliases = options?.aliases || [];
        this.permissions = options?.permissions || [];
    }
}
exports.default = MsgCommand;
