import mongoose from "mongoose";
import "dotenv/config";

const MONGODB_URI = process.env.MONGODB_CONNECTION_URI!;

if (!MONGODB_URI) {
    throw new Error(
        "Please define the MONGODB_CONNECTION_URI environment variable"
    );
}

let isConnected = false;

export const connectToDB = async () => {
    if (isConnected) return;

    try {
        await mongoose.connect(MONGODB_URI);
        isConnected = true;
        console.log("Connected to MongoDB");
    } catch (error) {
        console.error("Failed to connect to MongoDB", error);
        throw error;
    }
};
