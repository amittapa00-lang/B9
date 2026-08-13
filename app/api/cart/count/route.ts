import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({
        count: 0,
      });
    }

    const cart = await prisma.cart.findUnique({
      where: {
        userId: session.user.id,
      },
      include: {
        items: true,
      },
    });

    // นับจำนวน "รายการสินค้า"
    // ไม่รวม quantity
    //
    // ตัวอย่าง:
    // ยาดม 10 ชิ้น = 1 รายการ
    // ขนม 5 ชิ้น = 1 รายการ
    // ข้าว 2 ชิ้น = 1 รายการ
    //
    // รวม Cart Badge = 3
    const count = cart?.items.length ?? 0;

    return NextResponse.json({
      count,
    });
  } catch (error) {
    console.error(
      "Cart Count Error:",
      error
    );

    return NextResponse.json(
      {
        message: "Failed to get cart count",
      },
      {
        status: 500,
      }
    );
  }
}