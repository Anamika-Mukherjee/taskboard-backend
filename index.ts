import "dotenv/config";
import express from "express";
import mongoose from "mongoose";

const port = process.env.PORT || 8000;
const mongoURI = process.env.MONGO_ATLAS_URI!;

mongoose.connect(mongoURI, {dbName: "taskBoard"})
.then(()=>{
    console.log("MongoDB connected");
})
.catch((err)=>{
    console.log("MongoDB connection error: ", err);
})

const app = express();

app.listen(port, ()=>{
    console.log(`Server running on port ${port}`);
})