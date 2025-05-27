import { Schema } from "mongoose";
/**
 * Interfaces
 *
 *
 **/
interface IContact {
    wa_number: string;
    save: string;
    as_name: string;
}
/**
 * Function
 *
 *
 **/
export const contactSchema: Schema<IContact> = new Schema({
    wa_number: { type: String, required: true },
    save: { type: String, required: true },
    as_name: { type: String, required: true }
});
