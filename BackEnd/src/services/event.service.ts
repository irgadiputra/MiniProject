import { Event } from "@prisma/client";
import { IEvent } from "../interface/user.interface";
import { sign } from "jsonwebtoken";
import prisma from "../lib/prisma";

async function CreateEventService(
    param: IEvent,
    userId: number,
    file: Express.Multer.File
) {
    try {
      const event = await prisma.event.create({
        data: {
          name: param.name,
          location: param.location,
          start_date: new Date(param.start_date),
          end_date: new Date(param.end_date),
          quota: Number(param.quota),
          status: "New",
          description: param.description,
          organizer_id: userId,
          image: `/public/event/${file.filename}`,
          price: Number(param.price),
        },
      });
  
      return event;
    } catch (err) {
      throw err;
    }
  }

  export {CreateEventService}