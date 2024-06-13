"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const path_1 = __importDefault(require("path"));
const MsgCommand_1 = __importDefault(require("../handlers/MsgCommand"));
const Database_1 = __importDefault(require("../utils/Database"));
const AppCommand_1 = __importDefault(require("../handlers/AppCommand"));
const config_1 = __importDefault(require("../../config"));
const Event_1 = __importDefault(require("../handlers/Event"));
const Error_1 = __importDefault(require("../handlers/Error"));
class Client extends discord_js_1.Client {
    constructor(options) {
        super(options);
        this.EventHandler = new Event_1.default(this, path_1.default.join(__dirname, '..', '..', 'events'));
        this.MsgCommandHandler = new MsgCommand_1.default(this, path_1.default.join(__dirname, '..', '..', 'commands'));
        this.AppCommandHandler = new AppCommand_1.default(this, path_1.default.join(__dirname, '..', '..', 'commands'));
        this.ErrorHandler = new Error_1.default(this);
        this.walletEmoji = config_1.default.currency.wallet.emoji;
        this.activeGames = new discord_js_1.Collection();
        this.token = options.token;
    }
    async start() {
        await this.EventHandler.loadModules();
        await this.MsgCommandHandler.loadModules();
        await Database_1.default.authenticate();
        return this.login(this.token);
    }
}
exports.default = Client;
