import express from "express";
import {verifyToken} from "../utils/middleware";
import getProfileController from "../controllers/profileControllers/getProfile";
import editProfileController from "../controllers/profileControllers/editProfile";
import getAllUsersController from "../controllers/profileControllers/getAllUsers";

const router = express.Router();

//Profile routes

router.get("/profile/getallusers", getAllUsersController);
router.get("/profile/getprofile", verifyToken, getProfileController);
router.patch("/profile/editprofile", verifyToken, editProfileController);

export default router;