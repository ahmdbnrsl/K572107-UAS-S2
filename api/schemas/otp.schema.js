"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.otpSchema = void 0;
const mongoose_1 = require("mongoose");
/**
 * Function
 *
 *
 **/
exports.otpSchema = new mongoose_1.Schema({
    otp_code: { type: String, required: true },
    wa_number: { type: String, required: true },
    created_at: { type: Number, required: true },
    expired_at: { type: Number, required: true }
});
