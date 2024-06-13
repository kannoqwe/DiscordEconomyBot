"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const BaseModule_1 = __importDefault(require("../base/BaseModule"));
const discord_js_1 = require("discord.js");
class AppCommand extends BaseModule_1.default {
    constructor(id, args) {
        super(id);
        this.type = discord_js_1.ApplicationCommandType.ChatInput;
        this.subCommand = false;
        this.messageCommand = false;
        this.commandName = id;
        this.description = args?.description ?? '-';
        this.options = args?.options ?? [];
        this.ignore = args?.ignore ?? false;
        this.permissions = args?.permissions || [];
    }
}
exports.default = AppCommand;
