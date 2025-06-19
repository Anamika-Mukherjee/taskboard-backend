import {Document, Schema, model} from "mongoose";

//Type definition for ticket document 
export interface ITicket extends Document{
    projectId: string;
    assignee: string;
    ticketTitle: string;
    ticketDescription: string;
    ticketType: string;
    ticketPriority: string;
    ticketStatus: string;
}

//Schema for ticket model
const ticketSchema = new Schema({
    projectId: {
        type: Schema.Types.ObjectId,
        ref: "Project",
        required: [true, "Project Id is required"],
    },
    assignee: {
        type: Schema.Types.ObjectId,
        ref: "User", 
        required: [true, "Assignee is required"],
    },
    ticketTitle: {
        type: String, 
        required: [true, "Ticket Title is required"], 
        trim: true,
        maxlength: [100, "Ticket Title cannot be more than 100 characters"],
    },
    ticketDescription: {
        type: String, 
        required: [true, "Ticket Description is required"],  
        trim: true,
        maxlength: [500, "Ticket Description cannot be more than 500 characters"],
    },
    ticketType: {
        type: String, 
        enum: ["Task", "Bug", "Feature", "Improvement"],
        required: [true, "Ticket Type is required"],          
    },
    ticketPriority: {
        type: String,
        enum: ["Low", "Medium", "High", "Critical"],
        required: [true, "Priority is required"],     
    },
    ticketStatus: {
        type: String,
        enum: ["To Do", "In Progress", "Done"],
        required: [true, "Ticket Status is required"],
    }   
},
 {timestamps: true},
);

export default model("Ticket", ticketSchema);