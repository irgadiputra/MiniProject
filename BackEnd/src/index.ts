import express, { Application, Request, Response, NextFunction } from "express";
import path from "path";
import { PORT } from "./config";
import AuthRouter from "./routers/auth.router";
import EventRouter from "./routers/event.router";
import { expireUserPointsTask } from "./utils/cron/user-point-task";

const port = PORT || 8080;
const app: Application = express();

expireUserPointsTask();

app.use(express.json());
app.get(
  "/api",
  (req: Request, res: Response, next: NextFunction) => {
    console.log("test masuk");
    next()
  },
  (req: Request, res: Response, next: NextFunction) => {
    res.status(200).send("ini api");
  }
);

app.use("/auth", AuthRouter);
app.use("/event", EventRouter);
app.use("/avt", express.static(path.join(__dirname, "./public/avatar")));

app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
