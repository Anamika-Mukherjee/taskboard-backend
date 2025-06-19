import express, {Request, Response, NextFunction} from "express";
import jwt from "jsonwebtoken";
import AppError from "./AppError";
import { TokenPayload } from "../customTypes/userAuthTypes";
import cookieParser from "cookie-parser";

const app = express();

app.use(cookieParser());

//Token signing secret
const secret = process.env.TOKEN_SECRET!;

//Cookie options
const cookieOptions = {
  secure: process.env.NODE_ENV==="production",
  httpOnly: true,
  maxAge: 1000 * 60 * 60 * 24 * 7,
  path: "/",
  sameSite: "none" as "strict" | "lax" | "none" | undefined,
}

export const verifyToken = async (req: Request, res: Response, next: NextFunction) => {
    try{
        //Get access token from httpOnly cookie
        const accessToken = await req.cookies.accessToken;

        //Throw error if token not available
        if(!accessToken){
            throw new AppError(401, "Session expired. Please sign in again");
        }
        
        //Verify token
        const decodedAccessToken = jwt.verify(accessToken, secret) as TokenPayload;

        //Throw error if token not decoded
        if(!decodedAccessToken){
            throw new AppError(401, "Token not valid. Please sign in again");
        }  

        //Attach user id with res.locals to be sent to next route handler
        res.locals.user = {
                userId: decodedAccessToken.userId,
        };
        
        //Proceed if token verified successfully
        next();

    }
    catch(err: any){
         if(err.name === "TokenExpiredError"){
                //Get refresh token if access token expired
                const refreshToken = req.cookies.refreshToken;

                //Throw error if refresh token not available
                if(!refreshToken){
                    throw new AppError(401, "Session expired. Please sign in again");
                }

                //Verify refresh token and generate new access token if refresh token available
                const isNewToken = generateNewToken(refreshToken, res);

                //Throw error if new access token not generated
                if(!isNewToken){
                    throw new AppError(401, "Session expired. Please sign in again");
                }

                //Proceed if token generated successfully
                next();
            }
            else if(err.name === "JsonWebTokenError"){
                throw new AppError(401, "Invalid token");
            }
            else{
                throw new AppError(401, "Token verification error");
            }
    }
}

const generateNewToken = (refreshToken: string, res: Response) =>{
        try{
            //Verify refresh token
            const decodedRefreshToken = jwt.verify(refreshToken, secret) as TokenPayload;

            //Throw error if refresh token not verified
            if(!decodedRefreshToken){
                throw new AppError(401, "Token not valid. Please sign in again");
            }
            
            const payload = {
                userId: decodedRefreshToken.userId,
                userEmail: decodedRefreshToken.userEmail
            }

            //Generate new access token 
            const newAccessToken = jwt.sign(payload, secret, {expiresIn: "1h"});

            //Attach user id with res.locals to be sent to next route handler
            res.locals.user = {
                userId: decodedRefreshToken.userId,
            };
            
            res.cookie("accessToken", newAccessToken, cookieOptions);
            return true;
             
        }
        catch(err){
            return false;
        }
}

export const checkAuth  = (req: Request, res: Response, next: NextFunction) => {
    try{
        //Get access token from httpOnly cookie
        const accessToken = req.cookies.accessToken;

        //Store access token in a variable
        let bearerAccessToken = accessToken;

        //If token not received with cookie
        if(!accessToken){
            //Get authorization header value sent with request
            const authHeader = req.headers.authorization;

            //Return with message if authorization header not available
            if(!authHeader || !authHeader.startsWith("Bearer ")){
                throw new AppError(401, "User not authenticated");
            }

            //Store access token sent with authorization header (bearer token) in a variable
            const newAccessToken = authHeader?.split(" ")[1];

            //Return with message if access token not sent with authorization header
            if(!newAccessToken){
                 throw new AppError(401, "User not authenticated");
            }

            //Replace previously defined variable with access token extracted from authorization header
            bearerAccessToken = newAccessToken;
        }

        //Verify token
        const decodedAccessToken = jwt.verify(bearerAccessToken, secret) as TokenPayload;

        //Throw error if token not decoded
        if(!decodedAccessToken){
            throw new AppError(401, "Token not valid. Please sign in again");
        }  

        //Attach user id with res.locals to be sent to next route handler
        res.locals.user = {
                userId: decodedAccessToken.userId,
        };
        
        //Proceed if token verified successfully
        return next();

    }
    catch(err: any){
         if(err.name === "TokenExpiredError"){
                //Get refresh token from httpOnly cookie if access token expired
                const refreshToken = req.cookies.refreshToken;

                //Store refresh token in a variable
                let bearerRefreshToken = refreshToken;

                //If refresh token not sent with cookie
                if(!refreshToken){
                   //Get refresh token from request headers and replace previously defined variable with it
                   bearerRefreshToken = req.headers["x-refresh-token"] as string | undefined;

                   //Return if refresh token not sent with request headers
                   if(!bearerRefreshToken){
                     throw new AppError(401, "User not authenticated");
                   }

                }

                //Verify refresh token and generate new access token if refresh token available
                const isNewToken = generateNewToken(bearerRefreshToken, res);

                //Throw error if new access token not generated
                if(!isNewToken){
                    throw new AppError(401, "Session expired. Please sign in again");
                }

                //Proceed if token generated successfully
                return next();
            }
            else if(err.name === "JsonWebTokenError"){
                throw new AppError(401, "Invalid token");
            }
            else{
                throw new AppError(401, "Token verification error");
            }
    }
} 