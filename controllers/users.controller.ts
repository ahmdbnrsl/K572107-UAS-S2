import mongoose from "mongoose";
import { userSchema } from ".././schemas/user.schema";
import { connectToDB } from ".././connection/mongoose.connection";
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
const userModel = mongoose.models.users || mongoose.model("users", userSchema);
/**
 * Controller
 *
 *
 **/
export const checkIfUserExist = async (wa_number: string): Promise<boolean> => {
    await connectToDB();

    try {
        const exist: IUser | null = await userModel.findOne({ wa_number });
        if (exist) return true;
        else return false;
    } catch (error) {
        console.error(error);
        return false;
    }
};
