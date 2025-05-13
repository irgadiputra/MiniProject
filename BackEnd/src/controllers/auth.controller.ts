import { Request, Response, NextFunction } from "express";
import {
  RegisterService,
  LoginService,
  UpdateProfileService,
  KeepLoginService,
  VerifyEmailService,
  SendVerifyEmailService,
} from "../services/auth.service";
import { IUserReqParam } from "../custom";
import { verify } from "jsonwebtoken";


async function RegisterController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    await RegisterService(req.body);

    res.status(200).send({
      message: "Register Berhasil",
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

    res.status(200).cookie("access_token", data.token).send({
      message: "update profile berhasil",
      user: data.user.first_name,
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

async function verifyEmailController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const token = req.query.token as string;

  try {
    const decoded = verify(token, process.env.SECRET_KEY as string) as { id: number };
    const result = await VerifyEmailService(decoded.id);
    res.send(`<h2>${result}</h2><p>You may now close this tab.</p>`);
  } catch (err) {
    next(err);
  }
}

async function SendverifyEmailController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { id } = req.user as IUserReqParam;
  try {
    await SendVerifyEmailService(id);
    res.status(200).send({
      message: "Email sent",
    });
  } catch (err) {
    next(err);
  }
}

export { RegisterController, LoginController, UpdateProfileController, KeepLoginController, verifyEmailController, SendverifyEmailController };
