//Route handler for fetching tickets
import {NextFunction, Request, Response} from "express";
import AppError from "../../utils/AppError";
import Ticket from "../../models/Ticket";

const getTicketController = async (req: Request, res: Response, next: NextFunction) =>{
    try{
       //Get project id from params
       const {projectId} = req.params;

       //Fetch all tickets for given project id from database
       const allTickets = await Ticket
                                .find({projectId})
                                .populate("assignee", "email name")
                                .populate({
                                    path: "projectId",
                                    select: "userId projectName projectKey",
                                    populate: {
                                        path: "userId",
                                        select: "email name"
                                }});

       //Throw error if tickets not fetched from database
       if(!allTickets){
         throw new AppError(400, "Could not fetch tickets from database");
       }
      
       //Send tickets list to frontend
       res.status(200).json({message: "Successfully fetched all tickets", allTickets});

    }
    catch(err){
        console.log(err);
        next(err);
    }
}

export default getTicketController;