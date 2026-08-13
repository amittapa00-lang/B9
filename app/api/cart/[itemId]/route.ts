import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

interface Props {
  params: Promise<{
    itemId: string;
  }>;
}

// เพิ่ม / ลด จำนวน
export async function PATCH(
  req: Request,
  { params }: Props
) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json(
      { message: "Unauthorized" },
      { status: 401 }
    );
  }

  const { itemId } = await params;

  const body = await req.json();

  const quantity = Number(body.quantity);

  if (quantity <= 0) {
    await prisma.cartItem.delete({
      where: {
        id: itemId,
      },
    });

    return NextResponse.json({
      success: true,
    });
  }

  // ดึง cartItem พร้อมสินค้า + เจ้าของตะกร้า
  // เพื่อเช็คสต๊อกและสิทธิ์ก่อนอัปเดต
  const cartItem = await prisma.cartItem.findUnique({
    where: {
      id: itemId,
    },
    include: {
      product: true,
      cart: true,
    },
  });

  if (!cartItem) {
    return NextResponse.json(
      { message: "ไม่พบสินค้าในตะกร้า" },
      { status: 404 }
    );
  }

  // ตรวจสอบว่าเป็นตะกร้าของ user คนนี้จริง
  if (cartItem.cart.userId !== session.user.id) {
    return NextResponse.json(
      { message: "Unauthorized" },
      { status: 403 }
    );
  }

  // ตรวจสอบสต๊อก ห้ามเพิ่มจำนวนเกินสต๊อกที่มีจริง
  if (quantity > cartItem.product.stock) {
    return NextResponse.json(
      {
        message: `สินค้า ${cartItem.product.name} เหลือในสต๊อกเพียง ${cartItem.product.stock} ชิ้น`,
      },
      { status: 400 }
    );
  }

  await prisma.cartItem.update({
    where: {
      id: itemId,
    },
    data: {
      quantity,
    },
  });

  return NextResponse.json({
    success: true,
  });
}

// ลบสินค้า
export async function DELETE(
  req: Request,
  { params }: Props
) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json(
      { message: "Unauthorized" },
      { status: 401 }
    );
  }

  const { itemId } = await params;

  await prisma.cartItem.delete({
    where: {
      id: itemId,
    },
  });

  return NextResponse.json({
    success: true,
  });
}