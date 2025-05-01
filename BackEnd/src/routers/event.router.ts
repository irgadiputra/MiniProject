import { Router } from "express";
import { CreateEventController} from "../controllers/event.controller";
import ReqValidator from "../middlewares/validator.middleware";
import { VerifyToken, EOGuard } from "../middlewares/auth.middleware";
import { eventSchema } from "../schemas/event.schema";
import { Multer } from "../utils/multer";
const router = Router();

router.post("/", VerifyToken, Multer("diskStorage", "EVT", "event").single("file"), ReqValidator(eventSchema), CreateEventController);

export default router;