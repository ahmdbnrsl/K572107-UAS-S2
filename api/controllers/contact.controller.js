"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addContact = exports.getAllContacts = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const contact_schema_1 = require(".././schemas/contact.schema");
const user_schema_1 = require(".././schemas/user.schema");
/**
 * Configuration
 *
 *
 **/
const MONGODB_CONNECTION_URI = process.env.MONGODB_CONNECTION_URI || "";
const contactModel = mongoose_1.default.models.contacts || mongoose_1.default.model("contacts", contact_schema_1.contactSchema);
const userModel = mongoose_1.default.models.users || mongoose_1.default.model("users", user_schema_1.userSchema);
/**
 * Controllers
 *
 *
 **/
const getAllContacts = async (wa_number) => {
    try {
        await mongoose_1.default.connect(MONGODB_CONNECTION_URI);
        const result = await contactModel.find({ wa_number });
        if (result)
            return result;
        else
            return false;
    }
    catch (error) {
        console.error(error);
        return false;
    }
    finally {
        await mongoose_1.default.connection.close();
    }
};
exports.getAllContacts = getAllContacts;
const addContact = async (params) => {
    const { wa_number, save, as_name } = params;
    if (wa_number === save)
        return false;
    try {
        await mongoose_1.default.connect(MONGODB_CONNECTION_URI);
        const existingContact = await contactModel.findOne({
            wa_number,
            save
        });
        const existingUser = await userModel.findOne({
            wa_number: save
        });
        if (!existingUser)
            return false;
        if (existingContact)
            return false;
        await contactModel.create(params);
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
exports.addContact = addContact;
