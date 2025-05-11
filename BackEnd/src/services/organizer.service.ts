import prisma from "../lib/prisma";

async function getOrganizerStats(
    organizerId: number,
    range: 'day' | 'month' | 'year'
) {
    const allowedTruncs = ['day', 'month', 'year'];
    if (!allowedTruncs.includes(range)) {
        throw new Error("Invalid dateTrunc value");
    }

    const rawResult = await prisma.$queryRawUnsafe(`
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
      `, organizerId) as {
        period: Date
        revenue: bigint
        tickets_sold: bigint
        transactions: bigint
      }[];

    // Fix BigInt serialization issue
    const result = rawResult.map((row: any) => ({
        period: row.period,
        revenue: Number(row.revenue),
        tickets_sold: Number(row.tickets_sold),
        transactions: Number(row.transactions),
    }));

    return result;
}



async function getOrganizerProfileService(userId: number) {
    const events = await prisma.event.findMany({
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

    const averageRating =
        allReviews.length > 0
            ? allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length
            : null;

    return {
        organizerId: userId,
        totalEvents: events.length,
        totalReviews: allReviews.length,
        averageRating,
        reviews: allReviews,
    };
}

export { getOrganizerStats, getOrganizerProfileService }