import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // ตรวจสอบ Login
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          message: "กรุณาเข้าสู่ระบบก่อน",
        },
        {
          status: 401,
        }
      );
    }

    // ตรวจสอบ Admin
    if (session.user.role !== "ADMIN") {
      return NextResponse.json(
        {
          message: "ไม่มีสิทธิ์เข้าถึงหน้านี้",
        },
        {
          status: 403,
        }
      );
    }

    // ดึง Orders ทั้งหมด
    const orders = await prisma.order.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },

        address: true,

        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                sku: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json(orders);
  } catch (error) {
    console.error("Admin Orders Error:", error);

    return NextResponse.json(
      {
        message: "ไม่สามารถโหลดคำสั่งซื้อได้",
      },
      {
        status: 500,
      }
    );
  }
}