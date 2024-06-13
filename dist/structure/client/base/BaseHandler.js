"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const _structure_1 = require("#structure");
const fs_1 = __importDefault(require("fs"));
class BaseHandler {
    constructor(client, options) {
        this.client = client;
        this.directory = options.directory;
        this.handleClass = options.handleClass;
    }
    async loadModules() {
        const scannedFiles = await _structure_1.Utils.scanDirectory(this.directory);
        for (const file of scannedFiles) {
            if (fs_1.default.statSync(file).isDirectory())
                continue;
            let pull = (await Promise.resolve(`${file}`).then(s => __importStar(require(s)))).default;
            if (!pull)
                continue;
            pull = new pull();
            if (pull instanceof this.handleClass) {
                pull.client = this.client;
                this.load(pull);
            }
        }
    }
}
exports.default = BaseHandler;
