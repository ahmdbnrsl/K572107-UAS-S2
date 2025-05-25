"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendAndStoreOTP = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const crypto_js_1 = __importDefault(require("crypto-js"));
require("dotenv/config");
const otp_schema_1 = require(".././schemas/otp.schema");
/**
 * Configuration
 *
 *
 **/
const MONGODB_CONNECTION_URI = process.env.MONGODB_CONNECTION_URI || "";
const WA_API_URL = process.env.WA_API_URL || "";
const WA_API_SECRET = process.env.WA_API_SECRET || "";
const CRYPTO_KEY = process.env.CRYPTO_KEY || "";
const model = mongoose_1.default.models.otps || mongoose_1.default.model("otps", otp_schema_1.otpSchema);
/**
 * Functions
 *
 *
 **/
function generateOTP() {
    const digits = "0123456789";
    const len = digits.length;
    let otp = "";
    for (let i = 0; i < 6; i++) {
        otp += digits[Math.floor(Math.random() * len)];
    }
    return otp;
}
async function sendOTP(wa_number, otp_code) {
    const RcheckIsValidWaNumber = await fetch(WA_API_URL + "/check", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            num: wa_number,
            secret: WA_API_SECRET
        })
    });
    if (!(RcheckIsValidWaNumber === null || RcheckIsValidWaNumber === void 0 ? void 0 : RcheckIsValidWaNumber.ok))
        return false;
    const checkIsValidWaNumber = await RcheckIsValidWaNumber.json();
    if (!checkIsValidWaNumber.result)
        return false;
    const message = `*Salin Kode OTP Anda*\n\n> Jangan bagikan kode ini ke siapapun\n> © Verifikasi TemuBatir\n`;
    const buttons = [
        {
            name: "cta_copy",
            buttonParamsJson: JSON.stringify({
                display_text: otp_code,
                copy_code: otp_code
            })
        }
    ];
    const options = {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            secret: WA_API_SECRET,
            number: wa_number,
            text: message,
            quoted: "",
            cards: JSON.stringify([
                {
                    imgurl: "https://cdn.ab-rust.xyz/file/1748135108975.jpg",
                    text: "",
                    btn: buttons
                }
            ])
        })
    };
    const sendOTPCode = await fetch(WA_API_URL + "/carrousel", options);
    if (!sendOTPCode.ok)
        return false;
    return true;
}
/**
 * Controller
 *
 *
 **/
const sendAndStoreOTP = async (params) => {
    const { wa_number, otp_code, created_at, expired_at } = params;
    try {
        await mongoose_1.default.connect(MONGODB_CONNECTION_URI);
        const checkExistingNumber = await model.findOne({ wa_number });
        const OTPCode = generateOTP();
        const sendOTPCode = sendOTP(wa_number, OTPCode);
        if (!sendOTPCode)
            return false;
        if (checkExistingNumber)
            await model.deleteOne({ wa_number });
        const result = await model.create({
            wa_number,
            otp_code: crypto_js_1.default.AES.encrypt(otp_code, CRYPTO_KEY).toString(),
            created_at,
            expired_at
        });
        return true;
    }
    catch (error) {
        console.error(error);
        return false;
    }
    finally {
        await mongoose_1.default.connection.close();
    }
};
exports.sendAndStoreOTP = sendAndStoreOTP;
