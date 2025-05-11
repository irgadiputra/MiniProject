import { User } from "@prisma/client";
import { sign } from "jsonwebtoken";
import prisma from "../lib/prisma";
import { hash, genSaltSync, compare } from "bcrypt";
import { FE_URL, SECRET_KEY } from "../config";
import { LoginParam, RegisterParam, UpdateProfileParam } from "../type/user.type";

import handlebars from "handlebars";
import path from "path";
import fs from "fs";
import { Transporter } from "../utils/nodemailer";
import { IUserReqParam } from "../custom";

async function FindUserByEmail(email: string) {
  try {
    const user = await prisma.user.findFirst({
      select: {
        email: true,
        first_name: true,
        last_name: true,
        password: true,
        id: true
      },
      where: {
        email,
      },
    });
    return user;
  } catch (err) {
    throw err;
  }
}

async function RegisterService(param: RegisterParam & { referral_code?: string }) {
  try {
    const isExist = await FindUserByEmail(param.email);
    const referralBonus = 10000;
    const referrerBonus = 10000;
    const now = new Date();
    const expiryDate = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000); // 3 months from now
    let newUser = {
      id: -1,
      first_name: param.first_name,
      last_name: param.last_name,
      email: param.email};

    if (isExist) throw new Error("Email sudah terdaftar");

    await prisma.$transaction(async (t) => {
      let referredById: number | null = null;
      let newUserPoint = 0;

      if (param.referral_code) {
        const referrer = await t.user.findUnique({
          where: { referal_code: param.referral_code },
        });

        if (!referrer) throw new Error("Kode referral tidak valid");

        // Reward the referrer
        await t.user.update({
          where: { id: referrer.id },
          data: {
            point: referrer.point + referrerBonus,
          },
        });

        referredById = referrer.id;
        newUserPoint = referralBonus; // reward for being referred
      }

      const salt = genSaltSync(10);
      const hashedPassword = await hash(param.password, salt);
      const referalCode = await generateUniqueReferralCode();

      newUser = await t.user.create({
        data: {
          first_name: param.first_name,
          last_name: param.last_name,
          email: param.email,
          password: hashedPassword,
          is_verified: false,
          status_role: param.status_role,
          point: newUserPoint,
          referal_code: referalCode,
          referred_by: referredById,
        },
      });

      // if new user got points, add history
      if (newUserPoint > 0) {
        await t.pointHistory.create({
          data: {
            userId: newUser.id,
            points: newUserPoint,
            description: "Referral bonus (used someone’s referral code)",
            expiresAt: expiryDate,
          },
        });
      }
    });

    const templatePath = path.join(
      __dirname,
      "../utils/templates",
      "register-template.hbs"
    );

    if (newUser.id > 0){
      const payload = {
        email: newUser.email,
        first_name: newUser.first_name,
        last_name: newUser.last_name,
        id: newUser.id,
      }
      const token = sign(payload, String(SECRET_KEY), { expiresIn: "15m" });
  
      const templateSource = fs.readFileSync(templatePath, "utf-8");
      const compiledTemplate = handlebars.compile(templateSource);
      const html = compiledTemplate({ email: param.email, fe_url: `${FE_URL}/auth/verify-email?token=${token}` })
  
      await Transporter.sendMail({
        from: "LoketKita",
        to: param.email,
        subject: "Welcome",
        html
      });
    }
    
  } catch (err) {
    throw err;
  }
}


async function LoginService(param: LoginParam) {
  try {
    const user = await FindUserByEmail(param.email);

    if (!user) throw new Error("Email tidak terdaftar");

    const checkPass = await compare(param.password, user.password);

    if (!checkPass) throw new Error("Password Salah");

    const payload = {
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      id: user.id,
    }

    const token = sign(payload, String(SECRET_KEY), { expiresIn: "1h" });

    return { user: payload, token };
  } catch (err) {
    throw err;
  }
}

async function UpdateProfileService(file: Express.Multer.File, param: UpdateProfileParam, id: number) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: id },
    });

    if (!user) {
      throw new Error("User not found");
    }

    const updateData: any = {};

    // Prepare update fields
    if (param.first_name) updateData.first_name = param.first_name;
    if (param.last_name) updateData.last_name = param.last_name;
    if (param.email) updateData.email = param.email;
    if (param.point) updateData.point = Number(param.point);
    if (param.is_verified) updateData.is_verified = Boolean(param.is_verified);
    if (file) updateData.profile_pict = `/public/avatar/${file.filename}`;

    // Update password if provided
    if (param.new_password) {
      if (!param.old_password) {
        throw new Error("Old password is required to set a new password");
      }

      const isMatch = await compare(param.old_password, user.password);
      if (!isMatch) {
        throw new Error("Old password is incorrect");
      }

      const salt = genSaltSync(10);
      const hashedNewPassword = await hash(param.new_password, salt);
      updateData.password = hashedNewPassword;
    }

    const updatedUser = await prisma.user.update({
      where: { id: id },
      data: updateData,
    });

    return updatedUser;
  } catch (err) {
    throw err;
  }
}

async function KeepLoginService(id: number) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: id },
    });

    if (!user) {
      throw new Error("User not found");
    }
    const payload = {
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      id: user.id,
    }

    const token = sign(payload, String(SECRET_KEY), { expiresIn: "1h" });

    return { user: payload, token };
  } catch (err) {
    throw err;
  }
}

async function VerifyEmailService(id: number) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: id },
    });

    if (!user) {
      throw new Error("User not found");
    }
    await prisma.user.update({
      where: { id: id },
      data: { is_verified: true },
    });

    return "user verified";
  } catch (err) {
    throw err;
  }
}

//corn task
async function expireUserPoints() {
  const now = new Date();

  // Step 1: Find expired points
  const expiredHistories = await prisma.pointHistory.findMany({
    where: {
      expiresAt: {
        lt: now,
      },
    },
  });

  if (expiredHistories.length === 0) {
    console.log('No expired points to process.');
    return;
  }

  console.log(`Processing ${expiredHistories.length} expired point histories.`);

  // Step 2: Process all expired points inside transaction
  await prisma.$transaction(async (tx) => {
    for (const history of expiredHistories) {
      // Decrease user's points
      await tx.user.update({
        where: { id: history.userId },
        data: {
          point: {
            decrement: history.points, // safer than doing point - x manually
          },
        },
      });

      // Delete expired point history
      await tx.pointHistory.delete({
        where: { id: history.id },
      });
    }
  });

  console.log('Expired points processed successfully.');
}

async function generateUniqueReferralCode(length = 8) {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = "";

  while (true) {
    code = Array.from({ length }, () => charset[Math.floor(Math.random() * charset.length)]).join('');

    const existingUser = await prisma.user.findUnique({
      where: { referal_code: code },
    });

    if (!existingUser) break;
  }

  return code;
}



export { RegisterService, LoginService, UpdateProfileService, KeepLoginService, expireUserPoints, VerifyEmailService };
