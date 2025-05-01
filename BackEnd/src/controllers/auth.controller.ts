import { Request, Response, NextFunction } from "express";
import {
  RegisterService,
  LoginService,
  UpdateProfileService,
  KeepLoginService,
} from "../services/auth.service";
import { IUserReqParam } from "../custom";


async function RegisterController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const data = await RegisterService(req.body);

    res.status(200).send({
      message: "Register Berhasil",
      data,
    });
  } catch (err) {
    next(err);
  }
}

async function LoginController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const data = await LoginService(req.body);

    res.status(200).cookie("access_token", data.token).send({
      message: "Login Berhasil",
      user: data.user,
    });
  } catch (err) {
    next(err);
  }
}

async function UpdateProfileController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const file = req.file as Express.Multer.File;
    const { id } = req.user as IUserReqParam;
    const data = await UpdateProfileService(file, req.body, id);

    res.status(200).cookie("access_token", data.email).send({
      message: "update profile berhasil",
      user: data.first_name,
    });
  } catch (err) {
    next(err);
  }
}

async function KeepLoginController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { id } = req.user as IUserReqParam;
    const data = await KeepLoginService(id);

    res.status(200).cookie("access_token", data.token).send({
      message: "ReLogin Berhasil",
      user: data.user,
    });
  } catch (err) {
    next(err);
  }
}


export {RegisterController, LoginController, UpdateProfileController, KeepLoginController};
