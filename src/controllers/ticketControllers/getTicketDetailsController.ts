//Route handler for fetching ticket details
import {NextFunction, Request, Response} from "express";
import AppError from "../../utils/AppError";
import User from "../../models/User";
import Ticket from "../../models/Ticket";

const getTicketDetailsController = async (req: Request, res: Response, next: NextFunction) =>{
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
            throw new AppError(401, "User does not exist");
        }
       
        //Get ticket id from params
        const {ticketId} = req.params;

       //Fetch ticket details from database
       const ticketDetails = await Ticket
                                   .findOne({_id: ticketId})
                                   .populate("assignee", "email name")
                                   .populate({
                                    path: "projectId",
                                    select: "userId projectName projectKey",
                                    populate: {
                                        path: "userId",
                                        select: "email name"
                                }});

       //Throw error if ticket details not fetched from database
       if(!ticketDetails){
         throw new AppError(400, "Could not fetch ticket details from database");
       }
      
       //Send ticket details to frontend
       res.status(200).json({message: "Successfully fetched ticket details", ticketDetails});

    }
    catch(err){
        console.log(err);
        next(err);
    }
}

export default getTicketDetailsController;