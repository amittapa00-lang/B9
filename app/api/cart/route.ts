import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "Please login first" },
        { status: 401 }
      );
    }

    const body = await req.json();

    const productId = body.productId;

    if (!productId) {
      return NextResponse.json(
        { message: "Product not found" },
        { status: 400 }
      );
    }

    // ตรวจสอบว่าสินค้ามีอยู่จริง
    const product = await prisma.product.findUnique({
      where: {
        id: productId,
      },
    });

    if (!product) {
      return NextResponse.json(
        { message: "Product not found" },
        { status: 404 }
      );
    }

    // ค้นหาตะกร้า
    let cart = await prisma.cart.findUnique({
      where: {
        userId: session.user.id,
      },
    });

    // ยังไม่มีตะกร้า
    if (!cart) {
      cart = await prisma.cart.create({
        data: {
          userId: session.user.id,
        },
      });
    }

    // มีสินค้านี้อยู่แล้วหรือยัง
    const item = await prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        productId,
      },
    });

    if (item) {
      // มีอยู่แล้ว -> จะเพิ่มจำนวนอีก 1 ต้องไม่เกินสต๊อก
      if (item.quantity + 1 > product.stock) {
        return NextResponse.json(
          {
            message: `สินค้า ${product.name} เหลือในสต๊อกเพียง ${product.stock} ชิ้น (มีอยู่ในตะกร้าแล้ว ${item.quantity} ชิ้น)`,
          },
          { status: 400 }
        );
      }

      await prisma.cartItem.update({
        where: {
          id: item.id,
        },
        data: {
          quantity: {
            increment: 1,
          },
        },
      });
    } else {
      // ยังไม่มีในตะกร้า -> ต้องมีสต๊อกอย่างน้อย 1 ชิ้น
      if (product.stock < 1) {
        return NextResponse.json(
          { message: `สินค้า ${product.name} หมดสต๊อก` },
          { status: 400 }
        );
      }

      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId,
          quantity: 1,
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: "Added to cart",
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        message: "Internal Server Error",
      },
      {
        status: 500,
      }
    );
  }
}