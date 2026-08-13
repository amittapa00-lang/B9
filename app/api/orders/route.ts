import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    // =====================================================
    // ตรวจสอบ Login
    // =====================================================

    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          message: "Please login first",
        },
        {
          status: 401,
        }
      );
    }

    const userId = session.user.id;

    // =====================================================
    // รับข้อมูลจาก Checkout
    // =====================================================

    const body = await req.json();

    const addressId =
      typeof body.addressId === "string"
        ? body.addressId
        : "";

    const slipUrl =
      typeof body.slipUrl === "string"
        ? body.slipUrl
        : "";

    // =====================================================
    // ตรวจสอบ Address
    // =====================================================

    if (!addressId) {
      return NextResponse.json(
        {
          message:
            "กรุณาเลือกที่อยู่จัดส่ง",
        },
        {
          status: 400,
        }
      );
    }

    // =====================================================
    // ตรวจสอบ Slip
    // =====================================================

    if (!slipUrl) {
      return NextResponse.json(
        {
          message:
            "กรุณาอัปโหลดสลิปการโอนเงินก่อนสั่งซื้อ",
        },
        {
          status: 400,
        }
      );
    }

    // =====================================================
    // ตรวจสอบ Address
    // ต้องเป็นของ User คนนี้
    // =====================================================

    const address =
      await prisma.address.findFirst({
        where: {
          id: addressId,
          userId,
        },
      });

    if (!address) {
      return NextResponse.json(
        {
          message:
            "ไม่พบที่อยู่จัดส่งที่เลือก",
        },
        {
          status: 404,
        }
      );
    }

    // =====================================================
    // ดึง Cart
    // =====================================================

    const cart =
      await prisma.cart.findUnique({
        where: {
          userId,
        },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      });

    // =====================================================
    // ตรวจสอบ Cart
    // =====================================================

    if (
      !cart ||
      cart.items.length === 0
    ) {
      return NextResponse.json(
        {
          message:
            "ไม่มีสินค้าในตะกร้า",
        },
        {
          status: 400,
        }
      );
    }

    // =====================================================
    // ตรวจสอบ Stock
    // (เป็นแค่การเช็คคร่าวๆ เพื่อ UX ตอนสั่งซื้อ
    // ยังไม่ตัดสต๊อกจริง — สต๊อกจะถูกตัดจริงตอนแอดมิน
    // กด "ยืนยันการชำระเงิน" ในหน้า Admin เท่านั้น)
    // =====================================================

    for (const item of cart.items) {
      if (
        item.quantity >
        item.product.stock
      ) {
        return NextResponse.json(
          {
            message: `สินค้า ${item.product.name} มีสินค้าไม่เพียงพอ`,
          },
          {
            status: 400,
          }
        );
      }
    }

    // =====================================================
    // คำนวณ Total
    // =====================================================

    const total =
      cart.items.reduce(
        (sum, item) =>
          sum +
          item.product.price *
            item.quantity,
        0
      );

    // =====================================================
    // สร้าง Order
    // (สถานะเริ่มต้น PENDING, ยังไม่ตัด Stock)
    // =====================================================

    const order =
      await prisma.$transaction(
        async (tx) => {
          const newOrder =
            await tx.order.create({
              data: {
                userId,

                addressId,

                slipUrl,

                total,

                status: "PENDING",

                items: {
                  create:
                    cart.items.map(
                      (item) => ({
                        productId:
                          item.productId,

                        quantity:
                          item.quantity,

                        price:
                          item.product.price,
                      })
                    ),
                },
              },

              include: {
                items: true,

                address: true,
              },
            });

          // =================================================
          // ล้าง Cart
          // (ไม่มีการตัด Stock ที่นี่แล้ว —
          // การตัด Stock จะเกิดขึ้นตอนแอดมินยืนยันการชำระเงิน
          // ที่ PATCH /api/admin/orders/[id])
          // =================================================

          await tx.cartItem.deleteMany({
            where: {
              cartId: cart.id,
            },
          });

          return newOrder;
        }
      );

    // =====================================================
    // Response
    // =====================================================

    return NextResponse.json(
      {
        success: true,

        message:
          "Order created successfully",

        order,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error(
      "Create Order Error:",
      error
    );

    return NextResponse.json(
      {
        message:
          "เกิดข้อผิดพลาดในการสร้างคำสั่งซื้อ",
      },
      {
        status: 500,
      }
    );
  }
}