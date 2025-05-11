import { Router } from "express";
import { CreateEventController, GetEventListController, SearchEventController, UpdateEventController, DeleteEventController, CreateVoucherController, deleteVoucherController, getEventAttendeesController, createReviewController} from "../controllers/event.controller";
import ReqValidator from "../middlewares/validator.middleware";
import { VerifyToken, EOGuard, isEventOrganizer } from "../middlewares/auth.middleware";
import { eventSchema } from "../schemas/event.schema";
import { Multer } from "../utils/multer";
const router = Router();

router.post("/", VerifyToken, Multer("diskStorage", "EVT", "event").single("file"), ReqValidator(eventSchema), CreateEventController);
router.patch("/:id", VerifyToken, isEventOrganizer, Multer("diskStorage", "EVT", "event").single("file"), UpdateEventController);
router.delete("/:id", VerifyToken, isEventOrganizer, DeleteEventController);
router.get("/", GetEventListController, isEventOrganizer);
router.get("/search", SearchEventController);
router.post("/:id/voucher", VerifyToken, isEventOrganizer, CreateVoucherController);
router.delete("/:id/voucher/:code", VerifyToken, isEventOrganizer, deleteVoucherController);
router.get("/:id/attendees", VerifyToken, isEventOrganizer, getEventAttendeesController);
router.post("/:id/review", VerifyToken, createReviewController);

export default router;