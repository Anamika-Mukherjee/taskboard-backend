//Route handler to update ticket
import {NextFunction, Request, Response} from "express";
import AppError from "../../utils/AppError";
import User from "../../models/User";
import { UserDetails } from "../../customTypes/userAuthTypes";
import Ticket from "../../models/Ticket";
import Project from "../../models/Project";

const editTicketController = async (req: Request, res: Response, next: NextFunction) =>{
    try{
        //Destructure ticket title, description, assignee, ticket type, priority and status from request body
        const {ticketTitle, ticketDescription, assignee, ticketType, ticketPriority, ticketStatus} = req.body;

        //Throw error if any field is empty
        if(!ticketTitle || !ticketDescription || !assignee || !ticketType || !ticketPriority || !ticketStatus){
            throw new AppError(400, "All fields are required");
        }        
       
        //Get ticket id from params
        const {ticketId} = req.params;

        //Throw error if ticket id not available
        if(!ticketId){
            throw new AppError(400, "Ticket Id not sent with request");
        }

        //Check if given ticket exists in database
        const ticket = await Ticket.findOne({_id: ticketId});

        //Throw error if ticket does not exist
        if(!ticket){
            throw new AppError(400, "Ticket not found");
        }

        //Check if project exists in database
        const project = await Project.findOne({_id: ticket.projectId});

        //Throw error if project does not exist
        if(!project){
            throw new AppError(400, "Project not found");
        }
        
        //Fetch assignee details from database through assignee email sent with request
        const assigneeDetails = await User.findOne({email: assignee});
        
        //Throw error if assignee details not fetched from database
        if(!assigneeDetails){
            throw new AppError(400, "Assignee not found");
        }

        //Destructure assignee id from assignee details
        const {_id: assigneeId} = assigneeDetails as UserDetails;

        //Throw error if assignee is not a project team member
        if(!project.teamMembers.includes(assigneeId)){
            throw new AppError(400, "Assignee should be a project team member")
        }

        //Update ticket details in database
        const editedTicket = await Ticket.findByIdAndUpdate(
            {_id: ticketId}, 
            {
                ticketTitle,
                ticketDescription,
                assignee: assigneeId,
                ticketType,
                ticketPriority,
                ticketStatus,
            }, 
            {new: true}
        ).populate("assignee", "email name")
        .populate({
                path: "projectId",
                select: "userId projectName projectKey",
                populate: {
                    path: "userId",
                    select: "email name"
        }});

        //Throw error if ticket details not updated in database
        if(!editedTicket){
            throw new AppError(400, "Could not edit ticket details in database");
        }       
      
       //Send edited ticket to frontend
       res.status(200).json({message: "Successfully edited ticket details", editedTicket});

    }
    catch(err){
        console.log(err);
        next(err);
    }
}

export default editTicketController;