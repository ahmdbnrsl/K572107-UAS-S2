import mongoose from "mongoose";
import { contactSchema } from ".././schemas/contact.schema";
import { userSchema } from ".././schemas/user.schema";
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

interface IParamsAddContact extends IContact {}
interface IUser {
    wa_number: string;
}
/**
 * Configuration
 *
 *
 **/
const MONGODB_CONNECTION_URI = process.env.MONGODB_CONNECTION_URI || "";
const contactModel =
    mongoose.models.contacts || mongoose.model("contacts", contactSchema);
const userModel = mongoose.models.users || mongoose.model("users", userSchema);
/**
 * Controllers
 *
 *
 **/
export const getAllContacts = async (
    wa_number: string
): Promise<IContact[] | false> => {
    try {
        await mongoose.connect(MONGODB_CONNECTION_URI);
        const result: IContact[] = await contactModel.find({ wa_number });
        if (result) return result;
        else return false;
    } catch (error) {
        console.error(error);
        return false;
    } finally {
        await mongoose.connection.close();
    }
};

export const addContact = async (
    params: IParamsAddContact
): Promise<boolean> => {
    const { wa_number, save, as_name } = params;
    if (wa_number === save) return false;
    try {
        await mongoose.connect(MONGODB_CONNECTION_URI);
        const existingContact: IContact | null = await contactModel.findOne({
            wa_number,
            save
        });
        const existingUser: IUser | null = await userModel.findOne({
            wa_number: save
        });

        if (!existingUser) return false;
        if (existingContact) return false;

        await contactModel.create(params);
        return true;
    } catch (error) {
        console.error(error);
        return false;
    } finally {
        await mongoose.connection.close();
    }
};
