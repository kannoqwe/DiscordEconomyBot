"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const _structure_1 = require("#structure");
const discord_js_1 = require("discord.js");
const fs_1 = __importDefault(require("fs"));
class ButtonHandler {
    constructor(client, directory) {
        this.buttons = new discord_js_1.Collection();
        this.client = client;
        this.directory = directory;
        void this.load();
    }
    async load() {
        const scannedFiles = await _structure_1.Utils.scanDirectory(this.directory);
        scannedFiles.forEach((file) => {
            if (fs_1.default.statSync(file).isDirectory())
                return;
            let pull = require(file).default;
            if (!pull)
                return;
            pull = new pull();
            if (pull instanceof _structure_1.Button) {
                pull.client = this.client;
                this.buttons.set(pull.id, pull);
            }
        });
    }
}
exports.default = ButtonHandler;
