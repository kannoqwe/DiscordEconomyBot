"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const kleur_1 = require("kleur");
const moment_1 = __importDefault(require("moment"));
class Logger {
    static log(content, options) {
        const color = options?.error ? kleur_1.red : kleur_1.blue;
        const timestamp = color((0, kleur_1.bold)(`[${(0, moment_1.default)().format('YYYY-MM-DD HH:mm:ss')}]:`));
        const stream = process.stderr;
        stream.write(`${timestamp} ${content}\n`);
    }
}
exports.default = Logger;
