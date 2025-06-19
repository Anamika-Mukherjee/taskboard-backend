//Route handler to delete ticket
import {NextFunction, Request, Response} from "express";
import AppError from "../../utils/AppError";
import Ticket from "../../models/Ticket";
import Project from "../../models/Project";

const deleteTicketController = async (req: Request, res: Response, next: NextFunction) =>{
    try{   

        //Get project id and ticket id from params
        const {projectId, ticketId} = req.params;

        //Throw error if project id or ticket id not available
        if(!projectId || !ticketId){
            throw new AppError(400, "Project and Ticket credentials not sent with request");
        }
        
        //Delete ticket from database
        const deletedTicket = await Ticket.findByIdAndDelete(
            {_id: ticketId}, 
        )

        //Throw error if ticket not deleted
        if(!deletedTicket){
            throw new AppError(400, "Could not delete ticket from database");
        }  
        
        //Remove deleted ticket id from its project document
        const updateProject = await Project.findByIdAndUpdate({_id: projectId}, {
                 $pull: {tickets: deletedTicket._id},
        });
        
        //Throw error if ticket id not removed from project document
        if(!updateProject){
            throw new AppError(400, "Could not store ticket details in project document");
        }
        
        //Fetch all tickets (updated list of tickets)
        const allTickets = await Ticket
                                 .find({projectId}) 
                                 .populate("assignee", "email name")
                                 .populate({
                                    path: "projectId",
                                    select: "userId projectName projectKey",
                                    populate: {
                                        path: "userId",
                                        select: "email name"
                                }});;

        //Throw error if projects not fetched
        if(!allTickets){
            throw new AppError(400, "Could not fetch tickets");
        }
      
        //Send successful deletion message and all tickets to frontend
        res.status(200).json({message: "Successfully deleted project", allTickets});

    }
    catch(err){
        console.log(err);
        next(err);
    }
}

export default deleteTicketController;