//Route handler for fetching project list
import {NextFunction, Request, Response} from "express";
import AppError from "../../utils/AppError";
import Project from "../../models/Project";
import User from "../../models/User";

const getProjectController = async (req: Request, res: Response, next: NextFunction) =>{
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
       
       //Fetch all projects created by user from database
       const allProjects = await Project
                           .find({userId})
                           .populate("teamMembers", "email name")
                           .populate("userId", "email name")
                           .populate({
                                path: "tickets",
                                select: "ticketTitle ticketType ticketPriority ticketStatus assignee",
                                populate: {
                                    path: "assignee",
                                    select: "name email"
                            }});

       //Throw error if projects not fetched from database
       if(!allProjects){
         throw new AppError(400, "Could not fetch project list from database");
       }
      
       //Send all projects to frontend
       res.status(200).json({message: "Successfully fetched all projects", allProjects});

    }
    catch(err){
        console.log(err);
        next(err);
    }
}

export default getProjectController;