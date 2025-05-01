import { Request, Response, NextFunction } from "express";
import {
  CreateEventService,
  DeleteEventService,
  GetEventListService,
  SearchEventService,
  UpdateEventService,
} from "../services/event.service";
import { IUserReqParam } from "../custom";
import { updateEventSchema } from "../schemas/event.schema";
import { EventParam, UpdateEventParam } from "../type/event.type";

async function CreateEventController(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { id } = req.user as IUserReqParam;
      const request = req.body as EventParam;
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

async function UpdateEventController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { id: userId } = req.user as IUserReqParam;
    const eventId = parseInt(req.params.id);
    const file = req.file as Express.Multer.File;
    const request = req.body as UpdateEventParam;

    const data = await UpdateEventService(eventId, request, userId, file);

    res.status(200).json({
      message: "Event updated successfully",
      data,
    });
  } catch (error) {
    next(error);
  }
}

async function GetEventListController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const events = await GetEventListService({ skip, limit });
    res.status(200).json({
      message: "List of Events",
      data: events,
    });
  } catch (err) {
    next(err);
  }
}

async function SearchEventController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { name, location, status, page = 1, limit = 10 } = req.query;

    const searchParams = {
      name: name as string | undefined,
      location: location as string | undefined,
      status: status as string | undefined,
      page: parseInt(page as string),
      limit: parseInt(limit as string),
    };

    const data = await SearchEventService(searchParams);

    res.status(200).json({
      message: "Search event success",
      data,
    });
  } catch (err) {
    next(err);
  }
}

async function DeleteEventController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { id: userId } = req.user as IUserReqParam;
    const eventId = parseInt(req.params.id);

    const deletedEvent = await DeleteEventService(userId, eventId);

    res.status(200).json({
      message: "Event deleted successfully",
      data: deletedEvent,
    });
  } catch (err) {
    next(err);
  }
}

export {CreateEventController, GetEventListController, SearchEventController, UpdateEventController, DeleteEventController}