import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";
import { RegisterSchema } from "@/lib/validations/auth";
import { resend } from "@/lib/resend";
import crypto from "crypto";
import { addHours } from "date-fns";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const result = RegisterSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          message: "Invalid data",
          errors: result.error.flatten(),
        },
        { status: 400 }
      );
    }

    const { name, email, password } = result.data;

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "Email already exists" },
        { status: 409 }
      );
    }

    const hashedPassword = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "USER",
      },
    });

    // ลบ token เก่าของอีเมลนี้ (ถ้าเคยสมัครไม่สำเร็จ / กดสมัครซ้ำ)
    await prisma.emailVerificationToken.deleteMany({
      where: { email: user.email },
    });

    const token = crypto.randomUUID();

    await prisma.emailVerificationToken.create({
      data: {
        email: user.email,
        token,
        expires: addHours(new Date(), 24),
      },
    });

    const verifyUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/verify-email?token=${token}`;

try {
  await resend.emails.send({
    from: process.env.EMAIL_FROM || "B-Long Trading <onboarding@resend.dev>",
    to: user.email,
    subject: "ยืนยันอีเมลของคุณ - B-Long Trading",
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color:#0B3D2E;">สวัสดีคุณ ${user.name}</h2>
        <p>ขอบคุณที่สมัครสมาชิกกับ B-Long Trading กรุณากดปุ่มด้านล่างเพื่อยืนยันอีเมลของคุณ</p>
        <p style="margin: 24px 0;">
          <a href="${verifyUrl}" style="background:#0B3D2E;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;">
            ยืนยันอีเมล
          </a>
        </p>
        <p style="color:#888;font-size:14px;">ลิงก์นี้จะหมดอายุใน 24 ชั่วโมง</p>
      </div>
    `,
  });
} catch (emailError) {
  console.error("Send email error:", emailError);
}

    return NextResponse.json(
      {
        message: "Register success กรุณายืนยันอีเมลก่อนเข้าสู่ระบบ",
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}