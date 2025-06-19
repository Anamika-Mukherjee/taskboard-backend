import "dotenv/config";
import express, {NextFunction, Request, Response} from "express";
import mongoose from "mongoose";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "./src/routes/authRoutes";
import projectRoutes from "./src/routes/projectRoutes";
import ticketRoutes from "./src/routes/ticketRoutes";
import collabRoutes from "./src/routes/collabRoutes";
import profileRoutes from "./src/routes/profileRoutes";
import AppError from "./src/utils/AppError";

const port = process.env.PORT || 8000;
const mongoURI = process.env.MONGO_ATLAS_URI!;

mongoose.connect(mongoURI, {dbName: "taskBoard"})
.then(()=>{
    console.log("MongoDB connected");
})
.catch((err)=>{
    console.log("MongoDB connection error: ", err);
});

const app = express();

const allowedUrls = [process.env.FRONTEND_URL];
const corsOptions = {
    origin: (origin: string | undefined, callback: (err: Error | null, allow: boolean)=>void)=>{
        if(allowedUrls.indexOf(origin) !== -1  || !origin){
            callback(null, true);
        }
        else{
            callback(new Error("Not allowed by CORS"), false);
        }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"]
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

app.use("/api", authRoutes);
app.use("/api", projectRoutes);
app.use("/api", ticketRoutes);
app.use("/api", collabRoutes);
app.use("/api", profileRoutes);

app.get("/", (req: Request, res: Response)=>{
    res.send("TaskBoard backend server live");
});

app.use((err: AppError, req: Request, res: Response, next: NextFunction)=>{
      const {statusCode = 500, message = "Something went wrong"} = err;
      console.log("Error:");
      console.log("Status Code: ", statusCode);
      console.log("Message: ", message);
      res.status(statusCode).json({message});
})

app.listen(port, ()=>{
    console.log(`Server running on port ${port}`);
})