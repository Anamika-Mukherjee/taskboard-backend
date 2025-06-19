//Route handler to edit project
import {NextFunction, Request, Response} from "express";
import AppError from "../../utils/AppError";
import Project from "../../models/Project";
import User from "../../models/User";
import { UserDetails } from "../../customTypes/userAuthTypes";
import Ticket from "../../models/Ticket";

const editProjectController = async (req: Request, res: Response, next: NextFunction) =>{
    try{
        //Destructure project name, description, start date, end date and team members from request body
        const {projectName, projectDescription, startDate, endDate, teamMembers, status} = req.body;

        //Throw error if any field is empty
        if(!projectName || !projectDescription || !startDate || !endDate || !teamMembers || !teamMembers.length || !status){
            throw new AppError(400, "All fields are required");
        }        
       
        //Get project id from params
        const {projectId} = req.params;

        //Throw error if project id not available
        if(!projectId){
            throw new AppError(400, "Project Id not sent with request");
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

        //Check if project exists in database
        const project = await Project.findOne({_id: projectId});

        //Throw error if project does not exist
        if(!project){
            throw new AppError(400, "Project not found");
        }

        //Get all tickets associated with the given project
        const tickets = await Ticket.find({projectId});

        //If tickets available, map through them and check if ticket assignee is included in team member list sent with request
        if(tickets){
            tickets.map((ticket)=>{
                if(!memberIds.includes(ticket.assignee.toString())){
                    //Throw error if any ticket assignee is not in team member list
                    throw new AppError(400, "You cannot remove team members who are assigned tickets");
                }
            })
        }

        //Update project details in database
        const editedProject = await Project.findByIdAndUpdate(
            {_id: projectId}, 
            {
                projectName,
                projectDescription,
                startDate,
                endDate,
                teamMembers: memberIds,
                status,
            }, 
            {new: true}
        ).populate("teamMembers", "email name")
        .populate("userId", "email name")
        .populate({
            path: "tickets",
            select: "ticketTitle ticketType ticketPriority ticketStatus assignee",
            populate: {
                path: "assignee",
                select: "name email"
        }});

        //Throw error if project details not updated in database
        if(!editedProject){
            throw new AppError(400, "Could not edit project details in database");
        }       
      
       //Send edited project to frontend
       res.status(200).json({message: "Successfully edited project details", editedProject});

    }
    catch(err){
        console.log(err);
        next(err);
    }
}

export default editProjectController;