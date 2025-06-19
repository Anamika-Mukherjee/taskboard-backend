import express from "express";
import createProjectController from "../controllers/projectControllers/createProjectController";
import { verifyToken } from "../utils/middleware";
import getProjectController from "../controllers/projectControllers/getProjectController";
import getProjectDetailsController from "../controllers/projectControllers/getProjectDetailsController";
import editProjectController from "../controllers/projectControllers/editProjectController";
import deleteProjectController from "../controllers/projectControllers/deleteProjectController";
import searchProjectController from "../controllers/projectControllers/searchProjectController";

const router = express.Router();

//Project routes

router.post("/project/create", verifyToken, createProjectController);
router.get("/project/getallprojects", verifyToken, getProjectController);
router.get("/project/getprojectdetails/:projectId", verifyToken, getProjectDetailsController);
router.patch("/project/edit/:projectId", verifyToken, editProjectController);
router.delete("/project/delete/:projectId", verifyToken, deleteProjectController);
router.get("/project/search", verifyToken, searchProjectController);

export default router;