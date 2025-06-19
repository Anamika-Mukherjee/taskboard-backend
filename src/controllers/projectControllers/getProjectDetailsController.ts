//Route handler for fetching project details for a given project
import {NextFunction, Request, Response} from "express";
import AppError from "../../utils/AppError";
import Project from "../../models/Project";
import User from "../../models/User";

const getProjectDetailsController = async (req: Request, res: Response, next: NextFunction) =>{
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
       
        //Get project id from params
        const {projectId} = req.params;

       //Fetch project details for the given project id from database
       const projectDetails = await Project
                              .findOne({userId, _id: projectId})
                              .populate("teamMembers", "email name")
                              .populate("userId", "email name")
                              .populate({
                                path: "tickets",
                                select: "ticketTitle ticketType ticketPriority ticketStatus assignee",
                                populate: {
                                    path: "assignee",
                                    select: "name email"
                                }});

       //Throw error if project details not fetched from database
       if(!projectDetails){
         throw new AppError(400, "Could not fetch project details from database");
       }
      
       //Send project details to frontend
       res.status(200).json({message: "Successfully fetched project details", projectDetails});

    }
    catch(err){
        console.log(err);
        next(err);
    }
}

export default getProjectDetailsController;