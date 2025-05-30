import mongoose from "mongoose";
import { userSchema } from ".././schemas/user.schema";
/**
 * Interfaces
 *
 *
 **/
interface IUser {
    wa_number: string;
}
/**
 * Configuration
 *
 *
 **/
const MONGODB_CONNECTION_URI = process.env.MONGODB_CONNECTION_URI || "";
const userModel = mongoose.models.users || mongoose.model("users", userSchema);
/**
 * Controller
 *
 *
 **/
export const checkIfUserExist = async (wa_number: string): Promise<boolean> => {
    try {
        await mongoose.connect(MONGODB_CONNECTION_URI);
        const exist: IUser | null = await userModel.findOne({ wa_number });
        if (exist) return true;
        else return false;
    } catch (error) {
        console.error(error);
        return false;
    } finally {
        await mongoose.connection.close();
    }
};
