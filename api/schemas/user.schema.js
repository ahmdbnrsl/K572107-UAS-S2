"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userSchema = void 0;
const mongoose_1 = require("mongoose");
/**
 * Function
 *
 *
 **/
exports.userSchema = new mongoose_1.Schema({
    wa_number: { type: String, required: true }
});
