import mongoose from "mongoose";
import CryptoJS from "crypto-js";
import "dotenv/config";
import { otpSchema } from ".././schemas/otp.schema";
/**
 * Interfaces
 *
 *
 **/
interface ISendAndStoreOTPParams {
    wa_number: string;
    created_at: number;
    expired_at: number;
}
/**
 * Configuration
 *
 *
 **/
const MONGODB_CONNECTION_URI = process.env.MONGODB_CONNECTION_URI || "";
const WA_API_URL = process.env.WA_API_URL || "";
const WA_API_SECRET = process.env.WA_API_SECRET || "";
const CRYPTO_KEY = process.env.CRYPTO_KEY || "";
const model = mongoose.models.otps || mongoose.model("otps", otpSchema);
/**
 * Functions
 *
 *
 **/
function generateOTP(): string {
    const digits: string = "0123456789";
    const len: number = digits.length;
    let otp: string = "";
    for (let i = 0; i < 6; i++) {
        otp += digits[Math.floor(Math.random() * len)];
    }
    return otp;
}

async function sendOTP(wa_number: string, otp_code: string): Promise<boolean> {
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
    if (!RcheckIsValidWaNumber?.ok) return false;
    const checkIsValidWaNumber = await RcheckIsValidWaNumber.json();
    if (!checkIsValidWaNumber.result) return false;

    const message: string = `*Salin Kode OTP Anda*\n\n> Jangan bagikan kode ini ke siapapun\n> © Verifikasi TemuBatir\n`;
    const buttons: Array<object> = [
        {
            name: "cta_copy",
            buttonParamsJson: JSON.stringify({
                display_text: otp_code,
                copy_code: otp_code
            })
        }
    ];
    const options: RequestInit = {
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
    const sendOTPCode: Response = await fetch(
        WA_API_URL + "/carrousel",
        options
    );
    if (!sendOTPCode.ok) return false;
    return true;
}
/**
 * Controller
 *
 *
 **/
export const sendAndStoreOTP = async (
    params: ISendAndStoreOTPParams
): Promise<boolean> => {
    const { wa_number, created_at, expired_at } = params;

    try {
        await mongoose.connect(MONGODB_CONNECTION_URI);

        const checkExistingNumber = await model.findOne({ wa_number });

        const OTPCode = generateOTP();
        const sendOTPCode = sendOTP(wa_number, OTPCode);

        if (!sendOTPCode) return false;
        if (checkExistingNumber) await model.deleteOne({ wa_number });
        const result = await model.create({
            wa_number,
            otp_code: CryptoJS.AES.encrypt(OTPCode, CRYPTO_KEY).toString(),
            created_at,
            expired_at
        });
        return true;
    } catch (error) {
        console.error(error);
        return false;
    } finally {
        await mongoose.connection.close();
    }
};
