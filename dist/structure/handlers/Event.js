"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const _structure_1 = require("#structure");
const BaseHandler_1 = __importDefault(require("../client/base/BaseHandler"));
class EventHandler extends BaseHandler_1.default {
    constructor(client, directory) {
        super(client, { directory, handleClass: _structure_1.Event });
    }
    load(event) {
        if (event.ignore)
            return;
        if (event.once) {
            this.client.once(event.eventName, (...args) => event.execute(...args));
        }
        else {
            this.client.on(event.eventName, (...args) => event.execute(...args));
        }
    }
}
exports.default = EventHandler;
