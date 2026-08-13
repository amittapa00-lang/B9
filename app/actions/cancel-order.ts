"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function cancelOrder(orderId: string) {
  const session = await auth();

  if (!session?.user?.id) {
    return { success: false, message: "กรุณาเข้าสู่ระบบ" };
  }

  const order = await prisma.order.findFirst({
    where: {
      id: orderId,
      userId: session.user.id, // ยกเลิกได้เฉพาะออเดอร์ของตัวเอง
    },
  });

  if (!order) {
    return { success: false, message: "ไม่พบคำสั่งซื้อ หรือคำสั่งซื้อนี้ไม่ใช่ของคุณ" };
  }

  if (order.status === "CANCELLED") {
    return { success: false, message: "คำสั่งซื้อนี้ถูกยกเลิกไปแล้ว" };
  }

  // หมายเหตุ: ไม่คืนสต๊อกสินค้าที่ตัดไปแล้ว ไม่ว่าออเดอร์จะอยู่สถานะใดก็ตาม
  await prisma.order.update({
    where: { id: orderId },
    data: { status: "CANCELLED" },
  });

  revalidatePath(`/orders/${orderId}`);
  revalidatePath("/orders");

  return { success: true, message: "ยกเลิกคำสั่งซื้อสำเร็จ" };
}