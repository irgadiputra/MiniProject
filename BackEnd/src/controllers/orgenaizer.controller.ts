import { Request, Response, NextFunction } from "express";
import { getOrganizerProfileService, getOrganizerStats } from "../services/organizer.service";
import { IUserReqParam } from "../custom";

async function getStatsController(
    req: Request,
    res: Response,
    next: NextFunction
) {
    const { id: organizerId } = req.user as IUserReqParam;
    const range = req.query.range as 'day' | 'month' | 'year';

    try {
        const stats = await getOrganizerStats(organizerId, range);
        res.status(200).send({ stats });
    } catch (err) {
        next(err);
    }
}


async function getOrganizerProfileController(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { id: userId } = req.user as IUserReqParam;
  
      const profile = await getOrganizerProfileService(userId);
      res.status(200).json({
        message: "Organizer profile",
        data: profile,
      });
    } catch (err) {
      next(err);
    }
  }

export { getStatsController, getOrganizerProfileController }