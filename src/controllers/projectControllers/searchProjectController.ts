//Route handler for searching projects
import {NextFunction, Request, Response} from "express";
import AppError from "../../utils/AppError";
import Project from "../../models/Project";
import User from "../../models/User";

const searchProjectController = async (req: Request, res: Response, next: NextFunction) =>{
    try{
       //Get user id from access token
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

       //Get query string from query params
       const {query} = req.query;

       //Fetch projects matching query string from database
       const projects = await Project.find({
        userId,
        $or: [
            {projectName: {$regex: query, $options: "i"}},
            {projectDescription: {$regex: query, $options: "i"}},
            {projectKey: {$regex: query, $options: "i"}},
        ]
       });

       //Throw error if projects not fetched from database
       if(!projects){
         throw new AppError(400, "Could not fetch searched projects");
       }

       //Send search results to frontend
       res.status(200).json({message: "Successfully fetched searched projects", projects});

    }
    catch(err){
        console.log(err);
        next(err);
    }
}

export default searchProjectController;