import { NextResponse } from "next/server";
import { resend } from "@/lib/resend";

export async function GET() {
  try {
    const data = await resend.emails.send({
      from: "B-Long Trading <onboarding@resend.dev>",
      to: ["amitta.pa00@gmail.com"], // เปลี่ยนเป็นอีเมลของคุณ
      subject: "ทดสอบส่งอีเมล",
      html: `
        <h1>ส่งสำเร็จ 🎉</h1>
        <p>นี่คืออีเมลทดสอบจาก B-Long Trading</p>
      `,
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        message: "Send Email Failed",
      },
      {
        status: 500,
      }
    );
  }
}