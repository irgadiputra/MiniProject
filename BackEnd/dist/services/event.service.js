"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateEventService = CreateEventService;
exports.GetEventListService = GetEventListService;
exports.SearchEventService = SearchEventService;
exports.UpdateEventService = UpdateEventService;
exports.DeleteEventService = DeleteEventService;
exports.CreateVoucherService = CreateVoucherService;
exports.deleteVoucherService = deleteVoucherService;
exports.getEventAttendeesService = getEventAttendeesService;
exports.createReviewService = createReviewService;
exports.getOrganizerProfileService = getOrganizerProfileService;
exports.isEventOrganizer = isEventOrganizer;
const prisma_1 = __importDefault(require("../lib/prisma"));
function CreateEventService(param, userId, file) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const event = yield prisma_1.default.event.create({
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
        }
        catch (err) {
            throw err;
        }
    });
}
function UpdateEventService(eventId, param, userId, file) {
    return __awaiter(this, void 0, void 0, function* () {
        isEventOrganizer(userId, eventId);
        // Prepare update fields
        const updateData = {};
        if (param.quota)
            updateData.quota = Number(param.quota);
        if (param.price)
            updateData.price = Number(param.price);
        if (param.start_date)
            updateData.start_date = new Date(param.start_date);
        if (param.end_date)
            updateData.end_date = new Date(param.end_date);
        if (file)
            updateData.image = `/public/event/${file.filename}`;
        const updatedEvent = yield prisma_1.default.event.update({
            where: { id: eventId },
            data: updateData,
        });
        return updatedEvent;
    });
}
function GetEventListService(_a) {
    return __awaiter(this, arguments, void 0, function* ({ skip, limit }) {
        const events = yield prisma_1.default.event.findMany({
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
    });
}
function SearchEventService(_a) {
    return __awaiter(this, arguments, void 0, function* ({ name, location, status, page, limit }) {
        const skip = (page - 1) * limit;
        const events = yield prisma_1.default.event.findMany({
            where: Object.assign(Object.assign(Object.assign({}, (name && { name: { contains: name, mode: "insensitive" } })), (location && { location: { contains: location, mode: "insensitive" } })), (status && { status: { equals: status } })),
            include: {
                organizer: {
                    select: { first_name: true, last_name: true },
                },
            },
            skip,
            take: limit,
            orderBy: { start_date: "asc" },
        });
        return events.map(event => (Object.assign(Object.assign({}, event), { organizer: `${event.organizer.first_name} ${event.organizer.last_name}` })));
    });
}
function DeleteEventService(userId, eventId) {
    return __awaiter(this, void 0, void 0, function* () {
        isEventOrganizer(userId, eventId);
        const deletedEvent = yield prisma_1.default.event.delete({
            where: { id: eventId },
        });
        return deletedEvent;
    });
}
function CreateVoucherService(userId, eventId, payload) {
    return __awaiter(this, void 0, void 0, function* () {
        isEventOrganizer(userId, eventId);
        const voucher = yield prisma_1.default.voucher.create({
            data: Object.assign(Object.assign({}, payload), { start_date: new Date(payload.start_date), end_date: new Date(payload.end_date), event_id: eventId, discount: payload.discount }),
        });
        return voucher;
    });
}
function deleteVoucherService(userId, eventId, code) {
    return __awaiter(this, void 0, void 0, function* () {
        isEventOrganizer(userId, eventId);
        const voucher = yield prisma_1.default.voucher.findFirst({
            where: { event_id: eventId, code },
        });
        if (!voucher)
            throw new Error("voucher not found");
        yield prisma_1.default.voucher.delete({
            where: { id: voucher.id },
        });
        return { message: "Voucher deleted successfully" };
    });
}
function getEventAttendeesService(userId_1, eventId_1, _a) {
    return __awaiter(this, arguments, void 0, function* (userId, eventId, { skip, limit }) {
        isEventOrganizer(userId, eventId);
        const [attendees, totalCount] = yield Promise.all([
            prisma_1.default.transaction.findMany({
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
            prisma_1.default.transaction.count({
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
    });
}
function createReviewService(userId, eventId, param) {
    return __awaiter(this, void 0, void 0, function* () {
        const event = yield prisma_1.default.event.findUnique({
            where: { id: eventId },
        });
        if (!event)
            throw new Error("Event not found");
        const attended = yield prisma_1.default.transaction.findFirst({
            where: {
                user_id: userId,
                event_id: eventId,
                status: "DONE",
            },
        });
        if (!attended)
            throw new Error("You can only review after attending the event");
        const existing = yield prisma_1.default.review.findUnique({
            where: {
                user_id_event_id: { user_id: userId, event_id: eventId },
            },
        });
        if (existing)
            throw new Error("You have already reviewed this event");
        return prisma_1.default.review.create({
            data: {
                user_id: userId,
                event_id: eventId,
                rating: param.rating,
                comment: param.comment,
            },
        });
    });
}
function getOrganizerProfileService(userId) {
    return __awaiter(this, void 0, void 0, function* () {
        const events = yield prisma_1.default.event.findMany({
            where: { organizer_id: userId },
            select: {
                id: true,
                name: true,
                review: {
                    select: {
                        rating: true,
                        comment: true,
                        user: { select: { first_name: true, last_name: true } },
                        created_at: true,
                    },
                },
            },
        });
        const allReviews = events.flatMap(e => e.review);
        const averageRating = allReviews.length > 0
            ? allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length
            : null;
        return {
            organizerId: userId,
            totalEvents: events.length,
            totalReviews: allReviews.length,
            averageRating,
            reviews: allReviews,
        };
    });
}
function isEventOrganizer(userId, eventId) {
    return __awaiter(this, void 0, void 0, function* () {
        const event = yield prisma_1.default.event.findUnique({
            where: { id: eventId },
        });
        if (!event)
            throw new Error("Event not found");
        if (event.organizer_id !== userId)
            throw new Error("Unauthorized");
    });
}
