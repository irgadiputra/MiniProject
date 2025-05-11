import { Router } from "express";
import { VerifyToken, EOGuard, isEventOrganizer } from "../middlewares/auth.middleware";
import { getOrganizerProfileController, getStatsController } from "../controllers/orgenaizer.controller";
const router = Router();

router.get("/stats", VerifyToken, getStatsController);
router.get("/review", VerifyToken, getOrganizerProfileController);

export default router;