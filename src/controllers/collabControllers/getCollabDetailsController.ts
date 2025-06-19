//Route handler for fetching collaboration details
import {NextFunction, Request, Response} from "express";
import AppError from "../../utils/AppError";
import Project from "../../models/Project";
import User from "../../models/User";

const getCollabDetailsController = async (req: Request, res: Response, next: NextFunction) =>{
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

       //Fetch collaboration details for the given project id from database
       const collabDetails = await Project
                              .findOne({teamMembers: userId, _id: projectId})
                              .populate("teamMembers", "email name")
                              .populate("userId", "email name")
                              .populate({
                                path: "tickets",
                                select: "ticketTitle ticketType ticketPriority ticketStatus assignee",
                                populate: {
                                    path: "assignee",
                                    select: "name email"
                                }});

       //Throw error if collaboration details not fetched from database
       if(!collabDetails){
         throw new AppError(400, "Could not fetch collaboration details from database");
       }
      
       //Send collaboration details to frontend
       res.status(200).json({message: "Successfully fetched collaboration project details", collabDetails});

    }
    catch(err){
        console.log(err);
        next(err);
    }
}

export default getCollabDetailsController;