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
exports.getOrganizerStats = getOrganizerStats;
exports.getOrganizerProfileService = getOrganizerProfileService;
const prisma_1 = __importDefault(require("../lib/prisma"));
function getOrganizerStats(organizerId, range) {
    return __awaiter(this, void 0, void 0, function* () {
        const allowedTruncs = ['day', 'month', 'year'];
        if (!allowedTruncs.includes(range)) {
            throw new Error("Invalid dateTrunc value");
        }
        const rawResult = yield prisma_1.default.$queryRawUnsafe(`
        SELECT
          DATE_TRUNC('${range}', t."created_at") AS period,
          SUM(t."total_price") AS revenue,
          SUM(t."quantity") AS tickets_sold,
          COUNT(*) AS transactions
        FROM "Transaction" t
        JOIN "Event" e ON e."id" = t."event_id"
        WHERE e."organizer_id" = $1 AND t."status" = 'DONE'
        GROUP BY period
        ORDER BY period ASC;
      `, organizerId);
        // Fix BigInt serialization issue
        const result = rawResult.map((row) => ({
            period: row.period,
            revenue: Number(row.revenue),
            tickets_sold: Number(row.tickets_sold),
            transactions: Number(row.transactions),
        }));
        return result;
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
