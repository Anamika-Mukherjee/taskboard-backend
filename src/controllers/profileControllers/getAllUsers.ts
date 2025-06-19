//Route handler for fetching all registered users
import {NextFunction, Request, Response} from "express";
import AppError from "../../utils/AppError";
import User from "../../models/User";
import { UserProfile } from "../../customTypes/userAuthTypes";

const getAllUsersController = async (req: Request, res: Response, next: NextFunction) =>{
    try{

       //Fetch all users from database
       const allUsers = await User.find();
                              
       //Throw error if users not fetched from database
       if(!allUsers){
         throw new AppError(400, "Could not fetch users from database");
       }

       //Declare array to store required user details from fetched users' details
       const allUserProfiles:  {_id: string, name: string, email: string, contactNumber?: string, company?: string}[] = [];

       //Map through fetched users array
       allUsers.map((user)=>{
            //Extract required user details for each user from fetched data 
            const {_id, name, email, contactNumber, company} = user as UserProfile;
            const userProfile = {
                _id: _id.toString(),
                name, 
                email,
                contactNumber,
                company
            }
            //Push required user details in the declared array
            allUserProfiles.push(userProfile);
       })       
      
       //Send all users to frontend
       res.status(200).json({message: "Successfully fetched users", allUserProfiles});

    }
    catch(err){
        console.log(err);
        next(err);
    }
}

export default getAllUsersController;