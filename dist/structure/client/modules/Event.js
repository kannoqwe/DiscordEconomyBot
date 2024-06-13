"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const BaseModule_1 = __importDefault(require("../base/BaseModule"));
class Event extends BaseModule_1.default {
    constructor(id, options) {
        super(id);
        this.eventName = id;
        this.once = options?.once || false;
        this.ignore = options?.ignore || false;
        this.isCustom = options?.isCustom || false;
    }
}
exports.default = Event;
