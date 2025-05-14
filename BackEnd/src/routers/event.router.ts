import { Router } from "express";
import {
  CreateEventController,
  GetEventListController,
  SearchEventController,
  UpdateEventController,
  DeleteEventController,
  CreateVoucherController,
  deleteVoucherController,
  getEventAttendeesController,
  createReviewController,
  GetEventListByOrganizerController,
  getOrganizerEventByIdController,
  GetEventByIdController,
} from "../controllers/event.controller";
import ReqValidator from "../middlewares/validator.middleware";
import { VerifyToken, EOGuard, isEventOrganizer } from "../middlewares/auth.middleware";
import { eventSchema } from "../schemas/event.schema";
import { Multer } from "../utils/multer";

const router = Router();

router.post(
  "/",
  VerifyToken,
  Multer("diskStorage", "EVT", "event").single("image"),
  ReqValidator(eventSchema),
  CreateEventController
);
router.patch("/:id", VerifyToken, Multer("diskStorage", "EVT", "event").single("image"), UpdateEventController);
router.delete("/:id", VerifyToken, DeleteEventController);
router.get("/", GetEventListController);
router.get("/:id", GetEventByIdController)
router.get("/organizer/:organizerId", VerifyToken, GetEventListByOrganizerController);
router.get("/:eventId/organizer/:organizerId", VerifyToken, getOrganizerEventByIdController);
router.get("/search", SearchEventController);
router.post("/:id/voucher", VerifyToken, CreateVoucherController);
router.delete("/:id/voucher/:code", VerifyToken, deleteVoucherController);
router.get("/:id/attendees", VerifyToken, isEventOrganizer, getEventAttendeesController);
router.post("/:id/review", VerifyToken, createReviewController);

export default router;
