//Route handler for fetching profile details for a given user
import {NextFunction, Request, Response} from "express";
import AppError from "../../utils/AppError";
import User from "../../models/User";
import { UserProfile } from "../../customTypes/userAuthTypes";

const getProfileController = async (req: Request, res: Response, next: NextFunction) =>{
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

       //Fetch profile details for the given user from database
       const profile = await User.findOne({_id: userId});
                              
       //Throw error if profile details not fetched from database
       if(!profile){
         throw new AppError(400, "Could not fetch profile details from database");
       }

       //Extract required user details from fetched profile details 
       const {_id, name, email, contactNumber, company} = profile as UserProfile;

       const userProfile = {
         _id: _id.toString(),
         name, 
         email,
         contactNumber,
         company
       }
      
       //Send profile details to frontend
       res.status(200).json({message: "Successfully fetched profile details", userProfile});

    }
    catch(err){
        console.log(err);
        next(err);
    }
}

export default getProfileController;