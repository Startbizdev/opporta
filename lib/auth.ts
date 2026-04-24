import { prisma } from "./prisma";
import { sendVerificationEmail } from "./email";
import crypto from "crypto";

export async function generateMagicLink(email: string) {
  let user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        email,
        username: email.split("@")[0] + "-" + crypto.randomBytes(3).toString("hex"),
      },
    });
  }

  const token = crypto.randomBytes(32).toString("hex");
  await prisma.user.update({
    where: { id: user.id },
    data: {
      id: user.id,
    },
  });

  await sendVerificationEmail(email, token);
  return user.id;
}

export async function verifyEmail(email: string, token: string) {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    return null;
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      emailVerified: new Date(),
    },
  });

  await prisma.creditBalance.create({
    data: {
      userId: user.id,
      amount: 3,
    },
  }).catch(() => {});

  return user;
}

export async function getUserById(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    include: { creditBalance: true },
  });
}
