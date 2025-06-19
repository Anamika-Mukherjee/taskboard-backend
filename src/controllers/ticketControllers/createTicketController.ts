//Route handler to create ticket
import {NextFunction, Request, Response} from "express";
import AppError from "../../utils/AppError";
import Ticket from "../../models/Ticket";
import User from "../../models/User";
import { UserDetails } from "../../customTypes/userAuthTypes";
import Project from "../../models/Project";


const createTicketController = async (req: Request, res: Response, next: NextFunction) =>{
    try{

      //Extract projcet id from params
      const {projectId} = req.params;

       //Throw error if user id not available
      if(!projectId){
        throw new AppError(400, "Project id not received with request");
      }

      //Check if project exists in database
      const project = await Project.findOne({_id: projectId});

      //Throw error if project does not exist
      if(!project){
        throw new AppError(400, "Project not found");
      }

      //Destructure project name, description, start date, end date and team members from request body 
      const {ticketTitle, ticketDescription, assignee, ticketType, ticketPriority} = req.body;

      //Throw error if any field is empty
      if(!ticketTitle || !ticketDescription || !assignee || !ticketType || !ticketPriority){
        throw new AppError(400, "All fields are required");
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

      //Create new ticket in database
      const newTicket = await Ticket.create({
          projectId,
          ticketTitle,
          ticketDescription,
          assignee: assigneeId,
          ticketType,
          ticketPriority,
          ticketStatus: "To Do",
      });

       //Throw error if ticket details not stored in database
       if(!newTicket){
         throw new AppError(400, "Could not store ticket details in database");
       }

       //Store newly created ticket id in its project document
       const updateProject = await Project.findByIdAndUpdate({_id: projectId}, {
         $push: {tickets: newTicket._id},
       });

       //Throw error if ticket id could not be stored in project document
       if(!updateProject){
        throw new AppError(400, "Could not store ticket details in project document");
       }

       //Fetch updated list of tickets from database
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

       //Throw error if ticket list not fetched
       if(!allTickets){
         throw new AppError(400, "Could not fetch tickets");
       }
      
       //Send ticket list to frontend
       res.status(200).json({message: "Successfully created ticket", allTickets});

    }
    catch(err){
        console.log(err);
        next(err);
    }
}

export default createTicketController;