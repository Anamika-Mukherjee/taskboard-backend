import express from "express";
import { verifyToken } from "../utils/middleware";
import getTicketController from "../controllers/ticketControllers/getTicketController";
import createTicketController from "../controllers/ticketControllers/createTicketController";
import getTicketDetailsController from "../controllers/ticketControllers/getTicketDetailsController";
import editTicketController from "../controllers/ticketControllers/editTicketController";
import deleteTicketController from "../controllers/ticketControllers/deleteTicketController";
import searchTicketController from "../controllers/ticketControllers/searchTicketController";

const router = express.Router();

//Ticket routes

router.post("/ticket/create/:projectId", verifyToken, createTicketController);
router.get("/ticket/getalltickets/:projectId", verifyToken, getTicketController);
router.get("/ticket/getticketdetails/:ticketId", verifyToken, getTicketDetailsController);
router.patch("/ticket/edit/:ticketId", verifyToken, editTicketController);
router.delete("/ticket/delete/:projectId/:ticketId", verifyToken, deleteTicketController);
router.get("/ticket/search/:projectId", verifyToken, searchTicketController);

export default router;