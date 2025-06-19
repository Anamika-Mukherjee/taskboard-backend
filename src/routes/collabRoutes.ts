import express from "express";
import { verifyToken } from "../utils/middleware";
import getCollabController from "../controllers/collabControllers/getCollabController";
import getCollabDetailsController from "../controllers/collabControllers/getCollabDetailsController";
import updateTicketStatusController from "../controllers/collabControllers/updateTicketStatus";

const router = express.Router();

//Collaboration project routes

router.get("/collaborations/getallcollabs", verifyToken, getCollabController);
router.get("/collaborations/getcollabdetails/:projectId", verifyToken, getCollabDetailsController);
router.patch("/collaborations/updateticketstatus/:ticketId", verifyToken, updateTicketStatusController);

export default router;