import { Request, Response, NextFunction } from "express";
import {
  CreateEventService,
} from "../services/event.service";
import { IUserReqParam } from "../custom";
import { IEvent } from "../interface/user.interface";

async function CreateEventController(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { id } = req.user as IUserReqParam;
      const request = req.body as IEvent;
      const file = req.file as Express.Multer.File;
      const data = await CreateEventService(request, id, file);
  
      res.status(200).send({
        message: "Event Berhasil dibuat",
        data,
      });
    } catch (err) {
      next(err);
    }
}


export {CreateEventController}