import prisma from "../lib/prisma";

async function getOrganizerStats(
  organizerId: number,
  range: 'day' | 'month' | 'year'
) {
  const allowedTruncs = ['day', 'month', 'year'];
  if (!allowedTruncs.includes(range)) {
    throw new Error("Invalid range value");
  }

  // Aggregated statistics
  const stats: any[] = await prisma.$queryRawUnsafe(`
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

  // Raw transaction data
  const raw: any[] = await prisma.$queryRawUnsafe(`
    SELECT
      t."id" AS transaction_id,
      DATE_TRUNC('${range}', t."created_at") AS period,
      t."confirmed_at" AS date,
      t."total_price" AS revenue,
      t."quantity" AS tickets_sold,
      t."created_at" AS created_at
    FROM "Transaction" t
    JOIN "Event" e ON e."id" = t."event_id"
    WHERE e."organizer_id" = $1 AND t."status" = 'DONE'
    ORDER BY t."created_at" ASC;
  `, organizerId);

  // Convert BigInt values to numbers (if needed)
  const parseBigInts = (data: any[]) => JSON.parse(JSON.stringify(data, (_, v) =>
    typeof v === 'bigint' ? Number(v) : v
  ));

  return {
    stats: parseBigInts(stats),
    raw: parseBigInts(raw)
  };
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