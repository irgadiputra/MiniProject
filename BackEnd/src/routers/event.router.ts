import { Router } from "express";
import { CreateEventController, GetEventListController, SearchEventController, UpdateEventController, DeleteEventController, CreateVoucherController, deleteVoucherController, getEventAttendeesController, createReviewController, getOrganizerProfileController} from "../controllers/event.controller";
import ReqValidator from "../middlewares/validator.middleware";
import { VerifyToken, EOGuard } from "../middlewares/auth.middleware";
import { eventSchema } from "../schemas/event.schema";
import { Multer } from "../utils/multer";
const router = Router();

router.post("/", VerifyToken, Multer("diskStorage", "EVT", "event").single("file"), ReqValidator(eventSchema), CreateEventController);
router.patch("/:id", VerifyToken, Multer("diskStorage", "EVT", "event").single("file"), UpdateEventController);
router.delete("/:id", VerifyToken, DeleteEventController);
router.get("/", GetEventListController);
router.get("/search", SearchEventController);
router.post("/:id/voucher", VerifyToken, CreateVoucherController);
router.delete("/:id/voucher/:code", VerifyToken, deleteVoucherController);
router.get("/:id/attendees", VerifyToken, getEventAttendeesController);
router.post("/:id/review", VerifyToken, createReviewController);
router.get("/:id/review", VerifyToken, getOrganizerProfileController);

export default router;