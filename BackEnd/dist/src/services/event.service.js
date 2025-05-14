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
exports.GetEventListByOrganizerService = GetEventListByOrganizerService;
exports.GetOrganizerEventByIdService = GetOrganizerEventByIdService;
exports.GetEventByIdService = GetEventByIdService;
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
                    status: param.status,
                    description: param.description,
                    organizer_id: userId,
                    image: `/evt/${file.filename}`,
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
function UpdateEventService(eventId, param, file) {
    return __awaiter(this, void 0, void 0, function* () {
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
            updateData.image = `/evt/${file.filename}`;
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
                id: true,
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
function GetEventListByOrganizerService(_a) {
    return __awaiter(this, arguments, void 0, function* ({ organizerId, skip, limit, }) {
        const events = yield prisma_1.default.event.findMany({
            where: {
                organizer_id: organizerId, // Use organizer_id to find events by this organizer
            },
            skip,
            take: limit,
            select: {
                id: true,
                name: true,
                price: true,
                image: true,
                location: true,
                start_date: true,
                end_date: true,
                quota: true,
                status: true,
                description: true,
                transactions: true
            },
            orderBy: {
                start_date: 'asc', // Sort events by start date in ascending order
            },
        });
        return events;
    });
}
function GetOrganizerEventByIdService(organizerId, eventId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const event = yield prisma_1.default.event.findFirst({
                where: {
                    id: eventId,
                    organizer_id: organizerId,
                },
                select: {
                    id: true,
                    name: true,
                    location: true,
                    price: true,
                    start_date: true,
                    end_date: true,
                    quota: true,
                    status: true,
                    description: true,
                    image: true,
                    transactions: {
                        select: {
                            id: true,
                            user_id: true,
                            quantity: true,
                            original_amount: true,
                            discounted_amount: true,
                            event_id: true,
                            status: true,
                            total_price: true,
                            point_reward: true,
                            point: true,
                            payment_proof: true,
                            payment_uploaded_at: true,
                            confirmed_at: true,
                            expired_at: true,
                            voucher_id: true,
                            coupon_id: true,
                            created_at: true,
                            user: {
                                select: {
                                    id: true,
                                    email: true,
                                },
                            },
                            event: {
                                select: {
                                    id: true,
                                    name: true,
                                    location: true, // Select relevant event fields if needed
                                },
                            },
                            voucher: {
                                select: {
                                    id: true,
                                    code: true,
                                    discount: true, // Select relevant voucher fields if needed
                                },
                            },
                            coupon: {
                                select: {
                                    id: true,
                                    code: true,
                                    discount: true, // Select relevant coupon fields if needed
                                },
                            },
                        },
                    },
                    voucher_event: {
                        select: {
                            id: true,
                            code: true,
                            discount: true,
                            event_id: true,
                            start_date: true,
                            end_date: true,
                            created_at: true,
                        },
                    },
                },
            });
            if (!event) {
                throw new Error("Event not found or does not belong to this organizer");
            }
            return event;
        }
        catch (error) {
            throw error;
        }
    });
}
function GetEventByIdService(eventId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const event = yield prisma_1.default.event.findUnique({
                where: {
                    id: eventId,
                },
                select: {
                    id: true,
                    name: true,
                    location: true,
                    price: true,
                    start_date: true,
                    end_date: true,
                    quota: true,
                    status: true,
                    description: true,
                    image: true,
                    transactions: true,
                    voucher_event: {
                        select: {
                            id: true,
                            code: true,
                            discount: true,
                            event_id: true,
                            start_date: true,
                            end_date: true,
                            created_at: true,
                        },
                    },
                },
            });
            if (!event) {
                throw new Error("Event not found");
            }
            return event;
        }
        catch (error) {
            throw error;
        }
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
function DeleteEventService(eventId) {
    return __awaiter(this, void 0, void 0, function* () {
        const deletedEvent = yield prisma_1.default.event.delete({
            where: { id: eventId },
        });
        return deletedEvent;
    });
}
function CreateVoucherService(eventId, payload) {
    return __awaiter(this, void 0, void 0, function* () {
        const event = yield prisma_1.default.event.findUnique({
            where: { id: eventId },
        });
        if (!event) {
            throw new Error(`Event with ID ${eventId} does not exist`);
        }
        const voucher = yield prisma_1.default.voucher.create({
            data: {
                code: payload.code,
                discount: payload.discount,
                start_date: new Date(payload.start_date),
                end_date: new Date(payload.end_date),
                event_id: eventId,
            },
        });
        return voucher;
    });
}
function deleteVoucherService(eventId, code) {
    return __awaiter(this, void 0, void 0, function* () {
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
function getEventAttendeesService(eventId_1, _a) {
    return __awaiter(this, arguments, void 0, function* (eventId, { skip, limit }) {
        const [attendees, totalCount] = yield Promise.all([
            prisma_1.default.transaction.findMany({
                where: {
                    event_id: eventId,
                    status: "DONE",
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
