import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { resend } from "@/lib/resend";
import { ForgotPasswordSchema } from "@/lib/validations/auth";
import crypto from "crypto";
import { addHours } from "date-fns";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const result = ForgotPasswordSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { message: "Invalid data", errors: result.error.flatten() },
        { status: 400 }
      );
    }

    const { email } = result.data;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    // ไม่บอกว่ามี/ไม่มีบัญชีนี้ในระบบ (กัน enumeration attack)
    if (!user) {
      return NextResponse.json(
        { message: "ถ้าอีเมลนี้มีอยู่ในระบบ เราได้ส่งลิงก์รีเซ็ตรหัสผ่านไปให้แล้ว" },
        { status: 200 }
      );
    }

    // ลบ token เก่าของอีเมลนี้ทิ้งก่อน
    await prisma.passwordResetToken.deleteMany({
      where: { email: user.email },
    });

    const token = crypto.randomUUID();

    await prisma.passwordResetToken.create({
      data: {
        email: user.email,
        token,
        expires: addHours(new Date(), 1), // ลิงก์รีเซ็ตหมดอายุเร็วกว่ายืนยันอีเมล เพื่อความปลอดภัย
      },
    });

    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`;

    try {
      await resend.emails.send({
        from: process.env.EMAIL_FROM || "B-Long Trading <onboarding@resend.dev>",
        to: user.email,
        subject: "รีเซ็ตรหัสผ่านของคุณ - B-Long Trading",
        html: `
          <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
            <h2 style="color:#0B3D2E;">สวัสดีคุณ ${user.name}</h2>
            <p>เราได้รับคำขอรีเซ็ตรหัสผ่านของบัญชีคุณ กรุณากดปุ่มด้านล่างเพื่อตั้งรหัสผ่านใหม่</p>
            <p style="margin: 24px 0;">
              <a href="${resetUrl}" style="background:#0B3D2E;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;">
                ตั้งรหัสผ่านใหม่
              </a>
            </p>
            <p style="color:#888;font-size:14px;">ลิงก์นี้จะหมดอายุใน 1 ชั่วโมง หากคุณไม่ได้ทำรายการนี้ กรุณาเพิกเฉยต่ออีเมลฉบับนี้</p>
          </div>
        `,
      });
    } catch (emailError) {
      console.error("Send reset email error:", emailError);
    }

    return NextResponse.json(
      { message: "ถ้าอีเมลนี้มีอยู่ในระบบ เราได้ส่งลิงก์รีเซ็ตรหัสผ่านไปให้แล้ว" },
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