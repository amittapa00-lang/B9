import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Carrier } from "@prisma/client";

interface Props {
  params: Promise<{
    id: string;
  }>;
}

// ==============================
// GET ORDER DETAIL
// ==============================

export async function GET(
  req: Request,
  { params }: Props
) {
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
          message: "ไม่มีสิทธิ์เข้าถึงข้อมูลนี้",
        },
        {
          status: 403,
        }
      );
    }

    const { id } = await params;

    // ดึงข้อมูล Order
    const order = await prisma.order.findUnique({
      where: {
        id,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },

        address: true,

        items: {
          include: {
            product: {
              include: {
                images: {
                  orderBy: {
                    sortOrder: "asc",
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json(
        {
          message: "ไม่พบคำสั่งซื้อ",
        },
        {
          status: 404,
        }
      );
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error(
      "Get Admin Order Detail Error:",
      error
    );

    return NextResponse.json(
      {
        message:
          "ไม่สามารถโหลดรายละเอียดคำสั่งซื้อได้",
      },
      {
        status: 500,
      }
    );
  }
}

// ==============================
// UPDATE ORDER STATUS
// (ตัด/คืน Stock ตามจังหวะยืนยัน/ยกเลิกการชำระเงิน)
// รองรับการบันทึกเลขติดตามพัสดุ + บริษัทขนส่ง
// เมื่อเปลี่ยนสถานะเป็น SHIPPED
// ==============================

// บริษัทขนส่งที่รองรับ (ต้องตรงกับ enum Carrier ใน schema.prisma)
const allowedCarriers: Carrier[] = [
  "KERRY",
  "THAILAND_POST",
  "FLASH",
];

export async function PATCH(
  req: Request,
  { params }: Props
) {
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
          message: "ไม่มีสิทธิ์ดำเนินการ",
        },
        {
          status: 403,
        }
      );
    }

    const { id } = await params;

    const body = await req.json();

    const status = body.status;

    const trackingNumber: string | undefined =
      typeof body.trackingNumber === "string"
        ? body.trackingNumber.trim()
        : undefined;

    const carrier: Carrier | undefined =
      typeof body.carrier === "string"
        ? (body.carrier as Carrier)
        : undefined;

    if (!status) {
      return NextResponse.json(
        {
          message: "กรุณาระบุสถานะ",
        },
        {
          status: 400,
        }
      );
    }

    const allowedStatuses = [
      "PENDING",
      "PAID",
      "PROCESSING",
      "SHIPPED",
      "DELIVERED",
      "CANCELLED",
    ];

    if (!allowedStatuses.includes(status)) {
      return NextResponse.json(
        {
          message: "สถานะไม่ถูกต้อง",
        },
        {
          status: 400,
        }
      );
    }

    // ถ้าเปลี่ยนเป็นสถานะ "สินค้าจัดส่ง" ต้องมีบริษัทขนส่ง
    // และเลขติดตามพัสดุเสมอ
    if (status === "SHIPPED") {
      if (
        !carrier ||
        !allowedCarriers.includes(carrier)
      ) {
        return NextResponse.json(
          {
            message:
              "กรุณาเลือกบริษัทขนส่งให้ถูกต้อง",
          },
          {
            status: 400,
          }
        );
      }

      if (!trackingNumber) {
        return NextResponse.json(
          {
            message:
              "กรุณากรอกเลขติดตามพัสดุ",
          },
          {
            status: 400,
          }
        );
      }
    }

    // ข้อมูลจัดส่งที่จะบันทึกเพิ่ม (ถ้ามีส่งมา)
    const shippingData: {
      trackingNumber?: string;
      carrier?: Carrier;
    } = {};

    if (trackingNumber !== undefined) {
      shippingData.trackingNumber =
        trackingNumber;
    }

    if (carrier !== undefined) {
      shippingData.carrier = carrier;
    }

    // ตรวจสอบ Order พร้อมรายการสินค้า
    // (ต้องใช้ items ในการตัด/คืน Stock)
    const existingOrder =
      await prisma.order.findUnique({
        where: {
          id,
        },
        include: {
          items: true,
        },
      });

    if (!existingOrder) {
      return NextResponse.json(
        {
          message: "ไม่พบคำสั่งซื้อ",
        },
        {
          status: 404,
        }
      );
    }

    // ถ้าสถานะไม่เปลี่ยน ให้อัปเดตเฉพาะข้อมูลจัดส่ง (ถ้ามี)
    // โดยไม่ต้องยุ่งกับ Stock
    if (existingOrder.status === status) {
      if (Object.keys(shippingData).length === 0) {
        return NextResponse.json({
          success: true,
          message: "อัปเดตสถานะสำเร็จ",
          order: existingOrder,
        });
      }

      const updatedOrder = await prisma.order.update({
        where: {
          id,
        },
        data: shippingData,
      });

      return NextResponse.json({
        success: true,
        message: "อัปเดตข้อมูลจัดส่งสำเร็จ",
        order: updatedOrder,
      });
    }

    // =====================================================
    // สถานะที่ถือว่า "ยืนยันการชำระเงินแล้ว" -> ตัด Stock ไปแล้ว
    // =====================================================
    const confirmedStatuses = [
      "PAID",
      "PROCESSING",
      "SHIPPED",
      "DELIVERED",
    ];

    const wasConfirmed =
      confirmedStatuses.includes(
        existingOrder.status
      );

    const willBeConfirmed =
      confirmedStatuses.includes(status);

    let order;

    if (!wasConfirmed && willBeConfirmed) {
      // =====================================================
      // เพิ่งยืนยันการชำระเงินครั้งแรก (เช่น PENDING -> PAID)
      // -> ตัด Stock จริง ณ จุดนี้
      // =====================================================
      order = await prisma.$transaction(
        async (tx) => {
          // เช็คสต๊อกซ้ำอีกครั้ง ณ เวลาที่ยืนยันจริง
          // เพราะสต๊อกอาจเปลี่ยนไปตั้งแต่ตอนลูกค้าสั่งซื้อ
          for (const item of existingOrder.items) {
            const product =
              await tx.product.findUnique({
                where: {
                  id: item.productId,
                },
              });

            if (
              !product ||
              product.stock < item.quantity
            ) {
              throw new Error(
                `สินค้า ${
                  product?.name ??
                  item.productId
                } มีไม่เพียงพอสำหรับยืนยันคำสั่งซื้อนี้`
              );
            }
          }

          for (const item of existingOrder.items) {
            await tx.product.update({
              where: {
                id: item.productId,
              },
              data: {
                stock: {
                  decrement: item.quantity,
                },
              },
            });
          }

          return tx.order.update({
            where: {
              id,
            },
            data: {
              status,
              ...shippingData,
            },
          });
        }
      );
    } else if (
      wasConfirmed &&
      !willBeConfirmed
    ) {
      // =====================================================
      // ออเดอร์เคยตัด Stock ไปแล้ว แต่ตอนนี้ถูกยกเลิก/ย้อนกลับ
      // (เช่น PAID -> CANCELLED) -> คืน Stock กลับ
      // =====================================================
      order = await prisma.$transaction(
        async (tx) => {
          for (const item of existingOrder.items) {
            await tx.product.update({
              where: {
                id: item.productId,
              },
              data: {
                stock: {
                  increment: item.quantity,
                },
              },
            });
          }

          return tx.order.update({
            where: {
              id,
            },
            data: {
              status,
              ...shippingData,
            },
          });
        }
      );
    } else {
      // =====================================================
      // เปลี่ยนสถานะที่ไม่กระทบ Stock
      // เช่น PENDING -> CANCELLED, PAID -> PROCESSING,
      // PROCESSING -> SHIPPED, SHIPPED -> DELIVERED ฯลฯ
      // =====================================================
      order = await prisma.order.update({
        where: {
          id,
        },
        data: {
          status,
          ...shippingData,
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: "อัปเดตสถานะสำเร็จ",
      order,
    });
  } catch (error) {
    console.error(
      "Update Order Status Error:",
      error
    );

    const message =
      error instanceof Error
        ? error.message
        : "ไม่สามารถอัปเดตสถานะได้";

    return NextResponse.json(
      {
        message,
      },
      {
        status: 500,
      }
    );
  }
}