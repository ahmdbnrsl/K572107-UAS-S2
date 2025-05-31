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
    as_name?: string;
}

interface IParamsGetContactInfo {
    wa_number: string;
    save: string;
}
interface IParamsAddContact extends IContact {}
interface IParamsDelContact extends IContact {}
interface IUser {
    wa_number: string;
}
interface IContactInfoNull {
    save: false;
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
export const getContactInfo = async (
    params: IParamsGetContactInfo
): Promise<IContact | IContactInfoNull | false> => {
    const { wa_number, save } = params;
    try {
        await mongoose.connect(MONGODB_CONNECTION_URI);
        const result: IContact | null = await contactModel.findOne({
            wa_number,
            save
        });
        if (result) return result;
        else if (result === null) return { save: false };
        return false;
    } catch (error) {
        console.error(error);
        return false;
    } finally {
        await mongoose.connection.close();
    }
};

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

export const deleteContact = async (
    params: IParamsDelContact
): Promise<boolean> => {
    const { save, wa_number } = params;
    try {
        await mongoose.connect(MONGODB_CONNECTION_URI);
        const delContact = await contactModel.deleteOne({
            wa_number,
            save
        });
        if (delContact.acknowledged && delContact.deletedCount == 1)
            return true;
        return false;
    } catch (error) {
        console.error(error);
        return false;
    } finally {
        await mongoose.connection.close();
    }
};
