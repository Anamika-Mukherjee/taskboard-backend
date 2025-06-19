import {Document, Schema, model} from "mongoose";

//Type definition for user document 
export interface IUser extends Document{
    name: string;
    email: string;
    password: string;
    contactNumber?: string;
    company?: string;
}

//Schema for user model
const userSchema: Schema<IUser> = new Schema({
    name: {
        type: String, 
        required: [true, "Name is required"], 
        trim: true,
        maxlength: [100, "Name cannot be more than 100 characters"],
        match: [/^[a-zA-z\s]+$/, "Name must contain only letters and spaces"]
    },
    email: {
        type: String, 
        required: [true, "Email is required"], 
        unique: true, 
        lowercase: true,
        trim: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, "Please enter a valid email"]
    },
    password: {
        type: String, 
        required: [true, "Password is required"],
        minlength: [8, "Password must be at least 8 characters"],
    },
    contactNumber: {
        type: String,
        required: false,
        trim: true,
        maxLength: [10, "Contact number must not be more than 10 digits"],
        match: [/^[0-9]+$/, "Please enter a valid contact number"]
    },
    company: {
        type: String, 
        required: false, 
        trim: true,
        maxlength: [100, "Company cannot be more than 100 characters"],  
    }
},
 {timestamps: true},
);

export default model<IUser>("User", userSchema);