import { NextFunction } from "express";
import {Document, Schema, model} from "mongoose";
import Ticket from "./Ticket";

//Type definition for project document 
export interface IProject extends Document{
    userId: string;
    projectName: string;
    projectDescription: string;
    startDate: Date;
    endDate: Date;
    teamMembers: string[];
    projectKey: string;
    status: string;
    tickets: string[];
}

//Schema for project model
const projectSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: [true, "User Id is required"],
    },
    projectName: {
        type: String, 
        required: [true, "Project name is required"], 
        trim: true,
        maxlength: [100, "Project Name cannot be more than 100 characters"],
    },
    projectDescription: {
        type: String, 
        required: [true, "Project Description is required"],  
        trim: true,
        maxlength: [500, "Project Description cannot be more than 500 characters"],
    },
    startDate: {
        type: Date,
        required: [true, "Start Date is required"],     
    },
    endDate: {
        type: Date,
        required: [true, "End Date is required"],     
    },
    teamMembers: [
                {
                    type: Schema.Types.ObjectId,
                    ref: "User",
                    required: [true, "Team Members are required"],
                }
    ],
    projectKey: {
        type: String,
        required: [true, "Project Key is required"],
        trim: true,
        unique: true,
        uppercase: true,
    },
    status: {
        type: String,
        enum: ["In Progress", "Not Started", "Completed", "On Hold", "Cancelled"],
        required: [true, "Status is required"],
    },
    tickets: [
        {
            type: Schema.Types.ObjectId,
            ref: "Ticket",
        }
    ] 
},
 {timestamps: true},
);

projectSchema.pre("findOneAndDelete", async function (next) {
    const project = await this.model.findOne(this.getFilter());
    if (project) {
        await Ticket.deleteMany({ projectId: project._id });
    }
    next();
});

export default model("Project", projectSchema);