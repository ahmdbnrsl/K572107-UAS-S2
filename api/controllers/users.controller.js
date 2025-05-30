"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkIfUserExist = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const user_schema_1 = require(".././schemas/user.schema");
/**
 * Configuration
 *
 *
 **/
const MONGODB_CONNECTION_URI = process.env.MONGODB_CONNECTION_URI || "";
const userModel = mongoose_1.default.models.users || mongoose_1.default.model("users", user_schema_1.userSchema);
/**
 * Controller
 *
 *
 **/
const checkIfUserExist = async (wa_number) => {
    try {
        await mongoose_1.default.connect(MONGODB_CONNECTION_URI);
        const exist = await userModel.findOne({ wa_number });
        if (exist)
            return true;
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
exports.checkIfUserExist = checkIfUserExist;
