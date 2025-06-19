//Route handler for searching tickets
import {NextFunction, Request, Response} from "express";
import AppError from "../../utils/AppError";
import Ticket from "../../models/Ticket";

const searchTicketController = async (req: Request, res: Response, next: NextFunction) =>{
    try{
       //Get query string from query params
       const {query} = req.query;

       //Get project id from params
       const {projectId} = req.params;

       //Fetch tickets matching query string from database
       const tickets = await Ticket.find({
        projectId,
        $or: [
            {ticketTitle: {$regex: query, $options: "i"}},
            {ticketDescription: {$regex: query, $options: "i"}}
        ]
       });

       //Throw error if tickets not fetched from database
       if(!tickets){
         throw new AppError(400, "Could not fetch searched tickets");
       }

       //Send search results to frontend
       res.status(200).json({message: "Successfully fetched searched tickets", tickets});

    }
    catch(err){
        console.log(err);
        next(err);
    }
}

export default searchTicketController;