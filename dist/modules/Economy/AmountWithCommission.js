"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function default_1(amount, commission) {
    return Math.floor(amount - (amount / 100 * commission));
}
exports.default = default_1;
