//Route handler for sign out
import {NextFunction, Request, Response} from "express";

//Cookie options
const cookieOptions = {
  secure: process.env.NODE_ENV === "production",
  httpOnly: true,
  maxAge: 1000 * 60 * 60 * 24 * 7,
  path: "/",
  sameSite: "none" as "strict" | "lax" | "none" | undefined,
}

const signoutController = async (req: Request, res: Response, next: NextFunction) =>{
    try{
       res.clearCookie("accessToken", cookieOptions);
       res.clearCookie("refreshToken", cookieOptions);

       //Send successful sign out message to frontend
       res.status(200).json({message: "Successfully signed out"});
    }
    catch(err){
        next(err);
    }
}

export default signoutController;