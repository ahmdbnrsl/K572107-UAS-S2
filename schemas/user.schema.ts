import { Schema } from "mongoose";
/**
 * Interfaces
 *
 *
 **/
interface IUser {
    wa_number: string;
}
/**
 * Function
 *
 *
 **/
export const userSchema: Schema<IUser> = new Schema({
    wa_number: { type: String, required: true }
});
