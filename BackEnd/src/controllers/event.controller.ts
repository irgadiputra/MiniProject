import { Request, Response, NextFunction } from "express";
import {
  CreateEventService,
  DeleteEventService,
  GetEventListService,
  SearchEventService,
  UpdateEventService,
  CreateVoucherService,
  deleteVoucherService,
  getEventAttendeesService,
  createReviewService
} from "../services/event.service";
import { IUserReqParam } from "../custom";
import { CreateVoucher, EventParam, ReviewParam, UpdateEventParam } from "../type/event.type";

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
    const eventId = parseInt(req.params.id);
    const file = req.file as Express.Multer.File;
    const request = req.body as UpdateEventParam;

    const data = await UpdateEventService(eventId, request, file);

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
    const eventId = parseInt(req.params.id);

    const deletedEvent = await DeleteEventService(eventId);

    res.status(200).json({
      message: "Event deleted successfully",
      data: deletedEvent,
    });
  } catch (err) {
    next(err);
  }
}

async function CreateVoucherController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const eventId = parseInt(req.params.id);
    const request = req.body as CreateVoucher;

    const result = await CreateVoucherService(Number(eventId), request);

    res.status(201).json({ message: "Voucher created", data: result });
  } catch (err) {
    next(err);
  }
}

async function deleteVoucherController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const eventId = parseInt(req.params.id);
    const code = req.params.code; 

    const deletedEvent = await deleteVoucherService(Number(eventId), code);

    res.status(200).json({
      message: "Event deleted successfully",
      data: deletedEvent,
    });
    res.json({ message: "Voucher deleted successfully" });
  } catch (err) {
    next(err);
  }
}

async function getEventAttendeesController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
      const eventId = parseInt(req.params.id);
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const skip = (page - 1) * limit;

      const result = await getEventAttendeesService(eventId, { skip, limit });
      res.status(201).json({
          message: 'Event attendee list ',
          data: result
      });
  } catch (err) {
      console.error(err);
      next(err);
  }
}

async function createReviewController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const eventId = parseInt(req.params.id);
    const { id: userId } = req.user as IUserReqParam;
    const request = req.body as ReviewParam; 

    const createdReview = await createReviewService(userId, Number(eventId), request);

    res.status(200).json({
      message: "Review created successfully",
      data: createdReview,
    });
    res.json({ message: "Review created successfully" });
  } catch (err) {
    next(err);
  }
}



export {
  CreateEventController,
  GetEventListController,
  SearchEventController,
  UpdateEventController,
  DeleteEventController,
  CreateVoucherController,
  deleteVoucherController,
  getEventAttendeesController,
  createReviewController
}