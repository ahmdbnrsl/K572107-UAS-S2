"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectToDB = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
require("dotenv/config");
const MONGODB_URI = process.env.MONGODB_CONNECTION_URI;
if (!MONGODB_URI) {
    throw new Error("Please define the MONGODB_CONNECTION_URI environment variable");
}
let isConnected = false;
const connectToDB = async () => {
    if (isConnected)
        return;
    try {
        await mongoose_1.default.connect(MONGODB_URI);
        isConnected = true;
        console.log("Connected to MongoDB");
    }
    catch (error) {
        console.error("Failed to connect to MongoDB", error);
        throw error;
    }
};
exports.connectToDB = connectToDB;
