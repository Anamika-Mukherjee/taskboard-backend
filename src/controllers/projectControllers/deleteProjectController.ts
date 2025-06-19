//Route handler to delete project
import {NextFunction, Request, Response} from "express";
import AppError from "../../utils/AppError";
import Project from "../../models/Project";
import User from "../../models/User";

const deleteProjectController = async (req: Request, res: Response, next: NextFunction) =>{
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

        //Throw error if project id not available
        if(!projectId){
            throw new AppError(400, "Project Id not sent with request");
        }
        
        //Delete project from database
        const deletedProject = await Project.findByIdAndDelete(
            {_id: projectId}, 
        )

        //Throw error if project not deleted
        if(!deletedProject){
            throw new AppError(400, "Could not delete project from database");
        }   
        
        //Fetch all projects (updated list of projects)
        const allProjects = await Project
                                .find({userId})
                                .populate("teamMembers", "email")
                                .populate("userId", "email name")
                                .populate({
                                    path: "tickets",
                                    select: "ticketTitle ticketType ticketPriority ticketStatus assignee",
                                    populate: {
                                        path: "assignee",
                                        select: "name email"
                                }});

        //Throw error if projects not fetched
        if(!allProjects){
            throw new AppError(400, "Could not fetch projects");
        }
      
        //Send successful deletion message and all projects to frontend
        res.status(200).json({message: "Successfully deleted project", allProjects});

    }
    catch(err){
        console.log(err);
        next(err);
    }
}

export default deleteProjectController;