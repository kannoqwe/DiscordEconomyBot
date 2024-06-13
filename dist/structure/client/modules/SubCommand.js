"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const AppCommand_1 = __importDefault(require("./AppCommand"));
class SubCommand extends AppCommand_1.default {
    constructor(id) {
        super(id);
        this.subCommand = true;
        this.messageCommand = false;
        this.commandName = id;
    }
}
exports.default = SubCommand;
