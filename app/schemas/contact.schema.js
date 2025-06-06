"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.contactSchema = void 0;
const mongoose_1 = require("mongoose");
/**
 * Function
 *
 *
 **/
exports.contactSchema = new mongoose_1.Schema({
    wa_number: { type: String, required: true },
    save: { type: String, required: true },
    as_name: { type: String, required: true }
});
