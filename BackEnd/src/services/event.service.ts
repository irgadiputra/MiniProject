import { Event } from "@prisma/client";
import { sign } from "jsonwebtoken";
import prisma from "../lib/prisma";
import { EventListQuery, EventParam, SearchParams, UpdateEventParam } from "../type/event.type";

async function CreateEventService(
    param: EventParam,
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

  async function UpdateEventService(
    eventId: number,
    param: UpdateEventParam,
    userId: number,
    file?: Express.Multer.File
  ) {
    // Check if event exists and belongs to user
    const event = await prisma.event.findUnique({
      where: { id: eventId },
    });
  
    if (!event) throw new Error("Event not found");
    if (event.organizer_id !== userId) throw new Error("Unauthorized");
  
    // Prepare update fields
    const updateData: any = {};
    
    if (param.quota) updateData.quota = Number(param.quota);
    if (param.price) updateData.price = Number(param.price);
    if (param.start_date) updateData.start_date = new Date(param.start_date);
    if (param.end_date) updateData.end_date = new Date(param.end_date);
    if (file) updateData.image = `/public/event/${file.filename}`;

    const updatedEvent = await prisma.event.update({
      where: { id: eventId },
      data: updateData,
    });
  
    return updatedEvent;
  }

  async function GetEventListService({skip, limit} : EventListQuery) {
    const events = await prisma.event.findMany({
      skip,
      take: limit,
      select: {
        name: true,
        price: true,
        image: true,
        location: true,
        start_date: true,
        end_date: true,
        quota: true,
        status: true,
        description: true,
        organizer: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            email: true, // optional, you can remove it if not needed
          },
        },
      },
      orderBy: {
        start_date: 'asc',
      },
    });
  
    return events;
  }
  
  async function SearchEventService({ name, location, status, page, limit }: SearchParams) {
    const skip = (page - 1) * limit;
  
    const events = await prisma.event.findMany({
      where: {
        ...(name && { name: { contains: name, mode: "insensitive" } }),
        ...(location && { location: { contains: location, mode: "insensitive" } }),
        ...(status && { status: { equals: status } }),
      },
      include: {
        organizer: {
          select: { first_name: true, last_name: true },
        },
      },
      skip,
      take: limit,
      orderBy: { start_date: "asc" },
    });
  
    return events.map(event => ({
      ...event,
      organizer: `${event.organizer.first_name} ${event.organizer.last_name}`,
    }));
  }

  async function DeleteEventService(userId: number, eventId: number) {
    // Check if event exists and belongs to user
    const event = await prisma.event.findUnique({
      where: { id: eventId },
    });
  
    if (!event) throw new Error("Event not found");
    if (event.organizer_id !== userId) throw new Error("Unauthorized");

    const deletedEvent = await prisma.event.delete({
      where: { id: eventId },
    });
  
    return deletedEvent;
  }

  export {CreateEventService, GetEventListService, SearchEventService, UpdateEventService, DeleteEventService}