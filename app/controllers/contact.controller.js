"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteContact = exports.addContact = exports.getAllContacts = exports.getContactInfo = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const contact_schema_1 = require(".././schemas/contact.schema");
const user_schema_1 = require(".././schemas/user.schema");
const mongoose_connection_1 = require(".././connection/mongoose.connection");
/**
 * Configuration
 *
 *
 **/
const contactModel = mongoose_1.default.models.contacts || mongoose_1.default.model("contacts", contact_schema_1.contactSchema);
const userModel = mongoose_1.default.models.users || mongoose_1.default.model("users", user_schema_1.userSchema);
/**
 * Controllers
 *
 *
 **/
const getContactInfo = async (params) => {
    const { wa_number, save } = params;
    try {
        await (0, mongoose_connection_1.connectToDB)();
        const result = await contactModel.findOne({
            wa_number,
            save
        });
        if (result)
            return result;
        else if (result === null)
            return { save: false };
        return false;
    }
    catch (error) {
        console.error(error);
        return false;
    }
};
exports.getContactInfo = getContactInfo;
const getAllContacts = async (wa_number) => {
    try {
        await (0, mongoose_connection_1.connectToDB)();
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
};
exports.getAllContacts = getAllContacts;
const addContact = async (params) => {
    const { wa_number, save, as_name } = params;
    if (wa_number === save)
        return false;
    try {
        await (0, mongoose_connection_1.connectToDB)();
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
};
exports.addContact = addContact;
const deleteContact = async (params) => {
    const { save, wa_number } = params;
    try {
        await (0, mongoose_connection_1.connectToDB)();
        const delContact = await contactModel.deleteOne({
            wa_number,
            save
        });
        if (delContact.acknowledged && delContact.deletedCount == 1)
            return true;
        return false;
    }
    catch (error) {
        console.error(error);
        return false;
    }
};
exports.deleteContact = deleteContact;
