"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyOTP = exports.sendAndStoreOTP = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const crypto_js_1 = __importDefault(require("crypto-js"));
require("dotenv/config");
const otp_schema_1 = require(".././schemas/otp.schema");
const user_schema_1 = require(".././schemas/user.schema");
const mongoose_connection_1 = require(".././connection/mongoose.connection");
/**
 * Configuration
 *
 *
 **/
const WA_API_URL = process.env.WA_API_URL || "";
const WA_API_SECRET = process.env.WA_API_SECRET || "";
const CRYPTO_KEY = process.env.CRYPTO_KEY || "";
const otpModel = mongoose_1.default.models.otps || mongoose_1.default.model("otps", otp_schema_1.otpSchema);
const userModel = mongoose_1.default.models.users || mongoose_1.default.model("users", user_schema_1.userSchema);
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
    const { wa_number, created_at, expired_at } = params;
    try {
        await (0, mongoose_connection_1.connectToDB)();
        const checkExistingNumber = await otpModel.findOne({ wa_number });
        const OTPCode = generateOTP();
        const sendOTPCode = await sendOTP(wa_number, OTPCode);
        if (!sendOTPCode)
            return false;
        if (checkExistingNumber)
            await otpModel.deleteOne({ wa_number });
        const result = await otpModel.create({
            wa_number,
            otp_code: crypto_js_1.default.AES.encrypt(OTPCode, CRYPTO_KEY).toString(),
            created_at,
            expired_at
        });
        return true;
    }
    catch (error) {
        console.error(error);
        return false;
    }
};
exports.sendAndStoreOTP = sendAndStoreOTP;
const verifyOTP = async (params) => {
    const { wa_number, otp_code, now } = params;
    try {
        await (0, mongoose_connection_1.connectToDB)();
        const otp = await otpModel.findOne({ wa_number });
        if (!otp)
            return false;
        if (otp.expired_at < now)
            return false;
        const compare = crypto_js_1.default.AES.decrypt(otp.otp_code, CRYPTO_KEY).toString(crypto_js_1.default.enc.Utf8) === otp_code;
        if (!compare)
            return false;
        await otpModel.deleteOne({ wa_number });
        const user = await userModel.findOne({ wa_number });
        if (!user)
            await userModel.create({ wa_number });
        return {
            wa_number,
            serial_id: otp_code
        };
    }
    catch (error) {
        console.error(error);
        return false;
    }
};
exports.verifyOTP = verifyOTP;
