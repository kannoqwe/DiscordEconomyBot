"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const _structure_1 = require("#structure");
const kleur_1 = require("kleur");
const error_stack_parser_1 = __importDefault(require("error-stack-parser"));
class ErrorHandler {
    constructor(client) {
        this.client = client;
        this._setupProcess();
    }
    _setupProcess() {
        process.on('unhandledRejection', async (error) => {
            await this.logError(error);
        });
        process.on('uncaughtException', async (error) => {
            await this.logError(error);
        });
    }
    async logError(error) {
        _structure_1.Utils.sendErrorToDeveloper(this.client, error);
        const parsed = error_stack_parser_1.default.parse(error);
        _structure_1.Logger.log(`\n=========================
${(0, kleur_1.grey)((0, kleur_1.bold)('• Ошибка:'))} ${error.name}
${(0, kleur_1.grey)((0, kleur_1.bold)('• Содержание:'))} ${error.message}
${(0, kleur_1.grey)((0, kleur_1.bold)('• Файл:'))} ${parsed[0].fileName} (${parsed[0].lineNumber})
=========================\n`, { error: true });
    }
}
exports.default = ErrorHandler;
