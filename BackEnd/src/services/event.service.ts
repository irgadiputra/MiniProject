import prisma from "../lib/prisma";
import { EventListQuery, EventParam, SearchParams, UpdateEventParam, CreateVoucher, ReviewParam } from "../type/event.type";

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
  file?: Express.Multer.File
) {

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

async function GetEventListService({ skip, limit }: EventListQuery) {
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

async function DeleteEventService(
  eventId: number
) {

  const deletedEvent = await prisma.event.delete({
    where: { id: eventId },
  });

  return deletedEvent;
}

async function CreateVoucherService(
  eventId: number,
  payload: CreateVoucher
) {

  const voucher = await prisma.voucher.create({
    data: {
      ...payload,
      start_date: new Date(payload.start_date),
      end_date: new Date(payload.end_date),
      event_id: eventId,
      discount: payload.discount,
    },
  });

  return voucher;
}

async function deleteVoucherService(
  eventId: number,
  code: string
) {
  
  const voucher = await prisma.voucher.findFirst({
    where: { event_id: eventId, code },
  });

  if (!voucher) throw new Error("voucher not found");

  await prisma.voucher.delete({
    where: { id: voucher.id },
  });

  return { message: "Voucher deleted successfully" };
}


async function getEventAttendeesService(
  eventId: number,
  { skip, limit }: EventListQuery
) {

  const [attendees, totalCount] = await Promise.all([
      prisma.transaction.findMany({
          where: {
              event_id: eventId,
              status: "DONE", // only confirmed attendees
          },
          skip,
          take: limit,
          orderBy: {
              created_at: 'desc',
          },
          select: {
              user: {
                  select: { first_name: true, last_name: true },
              },
              quantity: true,
              total_price: true,
          },
      }),
      prisma.transaction.count({
          where: {
              event_id: eventId,
              status: "DONE",
          },
      }),
  ]);

  const formatted = attendees.map((t) => ({
      name: t.user.first_name + " " + t.user.last_name,
      quantity: t.quantity,
      total_paid: t.total_price,
  }));

  return formatted;
  
}

async function createReviewService(
  userId: number,
  eventId: number, 
  param: ReviewParam,) {
  const event = await prisma.event.findUnique({
      where: { id: eventId },
  });

  if (!event) throw new Error("Event not found");

  const attended = await prisma.transaction.findFirst({
      where: {
          user_id: userId,
          event_id: eventId,
          status: "DONE",
      },
  });

  if (!attended) throw new Error("You can only review after attending the event");

  const existing = await prisma.review.findUnique({
      where: {
          user_id_event_id: { user_id: userId, event_id: eventId },
      },
  });

  if (existing) throw new Error("You have already reviewed this event");

  return prisma.review.create({
      data: {
          user_id: userId,
          event_id: eventId,
          rating: param.rating,
          comment: param.comment,
      },
  });
}

export { 
  CreateEventService,
  GetEventListService,
  SearchEventService,
  UpdateEventService,
  DeleteEventService,
  CreateVoucherService,
  deleteVoucherService,
  getEventAttendeesService,
  createReviewService
}