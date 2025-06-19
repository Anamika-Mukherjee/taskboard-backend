//Route handler to update ticket status by assignee
import {NextFunction, Request, Response} from "express";
import AppError from "../../utils/AppError";
import Ticket from "../../models/Ticket";
import User from "../../models/User";

const updateTicketStatusController = async (req: Request, res: Response, next: NextFunction) =>{
    try{
        //Get user id from token
        const userId = res.locals.user?.userId;

        //Throw error if user id not available
        if(!userId){
            throw new AppError(400, "User id not received with request");
        }

        //Check in database if user exists
        const userExists = await User.findOne({_id: userId});

        //Throw error if user does not exist
        if(!userExists){
            throw new AppError(401, "User not found");
        }

        //Destructure ticket status from request body
        const {ticketStatus} = req.body;

        //Throw error if ticket status not sent
        if(!ticketStatus){
            throw new AppError(400, "Ticket status is required");
        }        
       
        //Get ticket id from params
        const {ticketId} = req.params;

        //Throw error if ticket id not available
        if(!ticketId){
            throw new AppError(400, "Ticket Id not sent with request");
        }

        //Check if given ticket is assigned to given user
        const ticket = await Ticket.findOne({_id: ticketId, assignee: userId});

        //Throw error if ticket not assigned to user
        if(!ticket){
            throw new AppError(400, "You can only update status for tickets assigned to you");
        }

        //Update ticket status in database
        const updatedTicket = await Ticket.findByIdAndUpdate({_id: ticketId}, 
            {
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

        //Throw error if ticket status not updated in database
        if(!updatedTicket){
            throw new AppError(400, "Could not update ticket status in database");
        }       
      
       //Send updated ticket to frontend
       res.status(200).json({message: "Successfully updated ticket status", updatedTicket});

    }
    catch(err){
        console.log(err);
        next(err);
    }
}

export default updateTicketStatusController;