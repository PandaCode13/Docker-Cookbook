"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_test_1 = require("node:test");
const node_assert_1 = __importDefault(require("node:assert"));
const math_1 = require("../src/math");
(0, node_test_1.test)('add() additionne correctement deux nombres', () => {
    node_assert_1.default.strictEqual((0, math_1.add)(2, 3), 5);
});
(0, node_test_1.test)('add() gère les nombres négatifs', () => {
    node_assert_1.default.strictEqual((0, math_1.add)(-2, 2), 0);
});
