//Route handler to check if user is authenticated
import {NextFunction, Request, Response} from "express";
import { UserDetails } from "../../customTypes/userAuthTypes";
import AppError from "../../utils/AppError";
import User from "../../models/User";

const checkAuthController = async (req: Request, res: Response, next: NextFunction) =>{
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

       //Get user id, name and email from database
       const {_id, name: userName, email: userEmail} = userExists as UserDetails;

       const userDetails = {
            userId: _id.toString(),
            userEmail,
            userName
       }

       //Send user details to frontend
       res.status(200).json({message: "User is authenticated", userDetails});
    }
    catch(err){
        next(err);
    }
}

export default checkAuthController;