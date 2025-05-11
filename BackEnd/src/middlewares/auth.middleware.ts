import { Request, Response, NextFunction } from "express";
import { verify } from "jsonwebtoken";
import { IUserReqParam } from "../custom";
import { SECRET_KEY } from "../config";
import prisma from "../lib/prisma";

async function VerifyToken(req: Request, res: Response, next: NextFunction) {
    try {
        const token = req.header("Authorization")?.replace("Bearer ", "");

        if (!token) throw new Error("Unauthorized");

        const verifyUser = verify(token, String(SECRET_KEY));

        if (!verifyUser) throw new Error("Invalid Token");

        req.user = verifyUser as IUserReqParam;

        next();
    } catch (err) {
        next(err);
    }
}

async function EOGuard(req: Request, res: Response, next: NextFunction) {
    try {
        if (req.user?.email !== "Event Organizer") throw new Error("Restricted");

        next();
    } catch (err) {
        next(err)
    }
}

async function isEventOrganizer(req: Request, res: Response, next: NextFunction) {
    const eventId = parseInt(req.params.id);
    const { id: userId } = req.user as IUserReqParam;

    const event = await prisma.event.findUnique({
        where: { id: eventId },
    });

    if (!event) throw new Error("Event not found");
    if (event.organizer_id !== userId) throw new Error("Unauthorized");
}


async function isAdmin(req: Request, res: Response, next: NextFunction) {
    const { id: userId } = req.user as IUserReqParam;
    const user = await prisma.event.findUnique({
        where: { id: userId },
    });
    if (user?.status != "admin") throw new Error("Unauthorized");
}

export { VerifyToken, EOGuard, isEventOrganizer, isAdmin }