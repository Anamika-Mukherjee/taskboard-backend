//Route handler to edit profile details
import {NextFunction, Request, Response} from "express";
import AppError from "../../utils/AppError";
import User from "../../models/User";

const editProfileController = async (req: Request, res: Response, next: NextFunction) =>{
    try{
        //Get user id from access token
        const userId = res.locals.user?.userId;

        //Destructure  name, contact number and company from request body
        const {name, contactNumber, company} = req.body;

        //Throw error if name field is empty
        if(!name){
            throw new AppError(400, "Name is required");
        }        
        
        //Update profile details in database
        const editedProfile = await User.findByIdAndUpdate(
            {_id: userId}, 
            {
                name,
                contactNumber,
                company
            }, 
            {new: true}
        );

        //Throw error if profile details not updated in database
        if(!editedProfile){
            throw new AppError(400, "Could not edit profile details in database");
        }       
      
       //Send edited profile to frontend
       res.status(200).json({message: "Successfully edited profile details", editedProfile});

    }
    catch(err){
        console.log(err);
        next(err);
    }
}

export default editProfileController;