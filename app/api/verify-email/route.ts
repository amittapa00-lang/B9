import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");

  const appUrl = process.env.NEXT_PUBLIC_APP_URL;

  if (!token) {
    return NextResponse.redirect(`${appUrl}/verify-email?status=missing`);
  }

  const verificationToken = await prisma.emailVerificationToken.findUnique({
    where: { token },
  });

  if (!verificationToken) {
    return NextResponse.redirect(`${appUrl}/verify-email?status=invalid`);
  }

  if (verificationToken.expires < new Date()) {
    // ลบ token ที่หมดอายุทิ้ง
    await prisma.emailVerificationToken.delete({
      where: { token },
    });

    return NextResponse.redirect(`${appUrl}/verify-email?status=expired`);
  }

  await prisma.user.update({
    where: { email: verificationToken.email },
    data: { emailVerified: new Date() },
  });

  await prisma.emailVerificationToken.delete({
    where: { token },
  });

  return NextResponse.redirect(`${appUrl}/verify-email?status=success`);
}