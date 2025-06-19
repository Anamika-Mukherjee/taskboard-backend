import express from "express";
import signupController from "../controllers/authControllers/signupController";
import signinController from "../controllers/authControllers/signinController";
import signoutController from "../controllers/authControllers/signoutController";
import {checkAuth, verifyToken} from "../utils/middleware";
import checkAuthController from "../controllers/authControllers/checkAuthController";

const router = express.Router();

//Authentication routes

router.post("/auth/signup", signupController);
router.post("/auth/signin", signinController);
router.get("/auth/signout", verifyToken, signoutController);
router.get("/auth/checkauth", checkAuth, checkAuthController);

export default router;