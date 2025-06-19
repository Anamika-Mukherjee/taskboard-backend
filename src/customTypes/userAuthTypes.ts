import { ObjectId } from "mongodb";

//Type definition for token payload
export interface TokenPayload{
  userId: string;
  userEmail: string;
}

//Type definition for user details fetched from database
export interface UserDetails{
  _id: ObjectId;
  email: string;
  name: string;
}

export interface UserProfile{
  _id: ObjectId;
  email: string;
  name: string;
  contactNumber?: string;
  company?: string;
}