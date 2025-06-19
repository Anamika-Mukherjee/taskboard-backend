//Route handler for fetching collaborations
import {NextFunction, Request, Response} from "express";
import AppError from "../../utils/AppError";
import Project from "../../models/Project";
import User from "../../models/User";

const getCollabController = async (req: Request, res: Response, next: NextFunction) =>{
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
       
       //Fetch all collaborations (projects where user is a team member and not owner) from database
       const allCollabs = await Project.find({teamMembers: userId})
                                .populate("teamMembers", "email name")
                                .populate("userId", "email name")
                                .populate({
                                    path: "tickets",
                                    select: "ticketTitle ticketType ticketPriority ticketStatus assignee",
                                    populate: {
                                        path: "assignee",
                                        select: "name email"
                                }});

       //Throw error if collaborations not fetched from database
       if(!allCollabs){
         throw new AppError(400, "Could not fetch collaboration project list from database");
       }
      
       //Send all collaborations to frontend
       res.status(200).json({message: "Successfully fetched all collaborations", allCollabs});

    }
    catch(err){
        console.log(err);
        next(err);
    }
}

export default getCollabController;