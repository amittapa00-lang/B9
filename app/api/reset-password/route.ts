import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";
import { ResetPasswordSchema } from "@/lib/validations/auth";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const result = ResetPasswordSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { message: "Invalid data", errors: result.error.flatten() },
        { status: 400 }
      );
    }

    const { token, password } = result.data;

    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
    });

    if (!resetToken) {
      return NextResponse.json(
        { message: "ลิงก์รีเซ็ตรหัสผ่านไม่ถูกต้อง" },
        { status: 400 }
      );
    }

    if (resetToken.expires < new Date()) {
      await prisma.passwordResetToken.delete({ where: { token } });

      return NextResponse.json(
        { message: "ลิงก์รีเซ็ตรหัสผ่านหมดอายุแล้ว กรุณาขอลิงก์ใหม่" },
        { status: 400 }
      );
    }

    const hashedPassword = await hashPassword(password);

    await prisma.user.update({
      where: { email: resetToken.email },
      data: { password: hashedPassword },
    });

    await prisma.passwordResetToken.delete({ where: { token } });

    return NextResponse.json(
      { message: "ตั้งรหัสผ่านใหม่สำเร็จ" },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}