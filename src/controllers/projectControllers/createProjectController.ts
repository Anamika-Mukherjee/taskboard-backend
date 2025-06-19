//Route handler for create project
import {NextFunction, Request, Response} from "express";
import AppError from "../../utils/AppError";
import { generateUniqueProjectKey } from "../../utils/functions";
import Project from "../../models/Project";
import User from "../../models/User";
import { UserDetails } from "../../customTypes/userAuthTypes";

const createProjectController = async (req: Request, res: Response, next: NextFunction) =>{
    try{

      //Extract user id from access token
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

      //Destructure project name, description, start date, end date and team members from request body 
      const {projectName, projectDescription, startDate, endDate, teamMembers} = req.body;

      //Throw error if any field is empty
      if(!projectName || !projectDescription || !startDate || !endDate || !teamMembers || !teamMembers.length){
        throw new AppError(400, "All fields are required");
      }

       //Define array to store team member ids
       let memberIds:  string[] = [];

       //Map through team members' emails
       const memberPromises = teamMembers.map(async (member: {memberEmail: string})=>{
         //Check if team member is registered with the application
         const user = await User.findOne({email: member.memberEmail}) as UserDetails;

         //Throw error if team member is not registered
         if(!user){
            throw new AppError(400, "Member is not a registered user");
         }

         //Get team member id and push into array
         const {_id: userId} = user;
         memberIds.push(userId.toString());
       })

       //Wait for all promises to resolve in the map function 
       await Promise.all(memberPromises);
    
       //Generate unique project key 
       const projectKey = await generateUniqueProjectKey();

       //Create new project in database
       const newProject = await Project.create({
           userId,
           projectName,
           projectDescription,
           startDate,
           endDate,
           teamMembers: memberIds,
           projectKey,
           status: "Not Started"
       });

       //Throw error if project details not stored in database
       if(!newProject){
         throw new AppError(400, "Could not store project details in database");
       }

       //Fetch updated list of projects from database
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

       //Throw error if project list not fetched from database
       if(!allProjects){
         throw new AppError(400, "Could not fetch projects");
       }
      
       //Send project list to frontend
       res.status(200).json({message: "Successfully created project", allProjects});

    }
    catch(err){
        console.log(err);
        next(err);
    }
}

export default createProjectController;