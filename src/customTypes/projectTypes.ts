import { ObjectId } from "mongodb";

export interface ProjectDetails{
    _id: ObjectId;
    projectName: string;
    projectDescription: string;
    startDate: Date;
    endDate: Date;
    teamMembers: string[];
    projectKey: string;
}