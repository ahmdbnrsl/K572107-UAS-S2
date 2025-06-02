"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkIfUserExist = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const user_schema_1 = require(".././schemas/user.schema");
const mongoose_connection_1 = require(".././connection/mongoose.connection");
/**
 * Configuration
 *
 *
 **/
const userModel = mongoose_1.default.models.users || mongoose_1.default.model("users", user_schema_1.userSchema);
/**
 * Controller
 *
 *
 **/
const checkIfUserExist = async (wa_number) => {
    await (0, mongoose_connection_1.connectToDB)();
    try {
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
};
exports.checkIfUserExist = checkIfUserExist;
