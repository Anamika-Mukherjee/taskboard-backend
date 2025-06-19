//Route handler for sign in
import {NextFunction, Request, Response} from "express";
import { TokenPayload, UserDetails } from "../../customTypes/userAuthTypes";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import AppError from "../../utils/AppError";
import User from "../../models/User";

//Token signing secret
const secret =  process.env.TOKEN_SECRET!;

//Cookie options
const cookieOptions = {
  secure: process.env.NODE_ENV==="production",
  httpOnly: true,
  maxAge: 1000 * 60 * 60 * 24 * 7,
  path: "/",
  sameSite: "none" as "strict" | "lax" | "none" | undefined,
}

//Function to convert raw password into hash
const checkPassword = async (rawPassword: string, hashedPassword: string) =>{
     try{
        //Hashed password from bcrypt
        const isPasswordCorrect = await bcrypt.compare(rawPassword, hashedPassword);
        return isPasswordCorrect;
     }
     catch(err){
        const errorMessage = err instanceof Error
                             ?err.message
                             :"Could not verify password";
        throw new AppError(400, errorMessage);
     }
}

//Function to generate jwt for authentication
const generateToken = (payload: TokenPayload, expiresIn: number)=>{
    const authToken = jwt.sign(payload, secret, {expiresIn});
    return authToken;
}

const signinController = async (req: Request, res: Response, next: NextFunction) =>{
    try{
       //Get user's email and password from request body 
       const {email, password: rawPassword} = req.body;

       //Throw error if any field is empty
       if(!email || !rawPassword){
         throw new AppError(400, "All fields are required");
       }

       
       //Check in database if user exists
       const userExists = await User.findOne({email});

       //Throw error if user does not exist
       if(!userExists){
        throw new AppError(401, "Incorrect email or password");
       }

       
       const {password: hashedPassword} = userExists;

       //Check password
       const isPasswordCorrect = await checkPassword(rawPassword, hashedPassword);
       
       //Throw error if password incorrect
       if(!isPasswordCorrect){
         throw new AppError(401, "Incorrect email or password");
       }

       //Get user id, email and name from database
       const {_id, email: userEmail, name: userName} = userExists as UserDetails;

       //Create payload for jwt
       const payload = {
         userId: _id.toString(),
         userEmail
       }

       
       //Set expiry times for access and refresh tokens
       const accessTokenExpiry = 60 * 60;
       const refreshTokenExpiry = 60 * 60 * 24 * 7;

       //Generate access token
       const accessToken = generateToken(payload, accessTokenExpiry);

       //Generate refresh token
       const refreshToken = generateToken(payload, refreshTokenExpiry);

       //Store tokens in httpOnly cookie
       res.cookie("accessToken", accessToken, cookieOptions);
       res.cookie("refreshToken", refreshToken, cookieOptions);

       const userDetails = {
            userId: _id.toString(),
            userEmail,
            userName
       }

       //Send user details to frontend
       res.status(200).json({message: "Successfully signed in", userDetails});
    }
    catch(err){
        next(err);
    }
}

export default signinController;