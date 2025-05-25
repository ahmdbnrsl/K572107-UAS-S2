import { Schema } from "mongoose";
/**
 * Interfaces
 *
 *
 **/
interface IOtp {
    otp_code: string;
    wa_number: string;
    created_at: number;
    expired_at: number;
}
/**
 * Function
 *
 *
 **/
export const otpSchema: Schema<IOtp> = new Schema({
    otp_code: { type: String, required: true },
    wa_number: { type: String, required: true },
    created_at: { type: Number, required: true },
    expired_at: { type: Number, required: true }
});
