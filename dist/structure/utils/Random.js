"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Random {
    static choice(array) {
        return array[Math.floor(Math.random() * array.length)];
    }
    static randint(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
}
exports.default = Random;
