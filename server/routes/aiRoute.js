import express from "express";
import { chatWithAssistant } from "../controllers/aiController.js";

const aiRouter = express.Router();

aiRouter.post("/chat", chatWithAssistant);

export default aiRouter;
