import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// =====================================================
// GET - ดึง Address ของ User
// =====================================================

export async function GET() {
  try {
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

    const addresses = await prisma.address.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: [
        {
          isDefault: "desc",
        },
        {
          createdAt: "desc",
        },
      ],
    });

    return NextResponse.json(addresses);
  } catch (error) {
    console.error("GET Addresses Error:", error);

    return NextResponse.json(
      {
        message: "ไม่สามารถโหลดที่อยู่ได้",
      },
      {
        status: 500,
      }
    );
  }
}

// =====================================================
// POST - เพิ่ม Address ใหม่
// =====================================================

export async function POST(req: Request) {
  try {
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

    const userId = session.user.id;

    const body = await req.json();

    const {
      fullName,
      phone,
      address,
      subDistrict,
      district,
      province,
      postalCode,
      note,
      isDefault,
    } = body;

    // ตรวจสอบข้อมูลจำเป็น
    if (
      !fullName ||
      !phone ||
      !address ||
      !subDistrict ||
      !district ||
      !province ||
      !postalCode
    ) {
      return NextResponse.json(
        {
          message: "กรุณากรอกข้อมูลที่อยู่ให้ครบถ้วน",
        },
        {
          status: 400,
        }
      );
    }

    // ตรวจสอบว่ามี Address อยู่แล้วหรือไม่
    const existingAddressCount =
      await prisma.address.count({
        where: {
          userId,
        },
      });

    // ถ้าเป็น Address แรก ให้เป็น Default อัตโนมัติ
    const shouldBeDefault =
      existingAddressCount === 0 ||
      isDefault === true;

    // ถ้าตั้งเป็น Default
    // ให้ยกเลิก Default ของที่อยู่เดิมทั้งหมด
    if (shouldBeDefault) {
      await prisma.address.updateMany({
        where: {
          userId,
          isDefault: true,
        },
        data: {
          isDefault: false,
        },
      });
    }

    // สร้าง Address
    const newAddress =
      await prisma.address.create({
        data: {
          userId,
          fullName: String(fullName).trim(),
          phone: String(phone).trim(),
          address: String(address).trim(),
          subDistrict: String(subDistrict).trim(),
          district: String(district).trim(),
          province: String(province).trim(),
          postalCode: String(postalCode).trim(),
          note: note
            ? String(note).trim()
            : null,
          isDefault: shouldBeDefault,
        },
      });

    return NextResponse.json(
      {
        success: true,
        message: "บันทึกที่อยู่สำเร็จ",
        address: newAddress,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error(
      "POST Address Error:",
      error
    );

    return NextResponse.json(
      {
        message:
          "เกิดข้อผิดพลาดในการบันทึกที่อยู่",
      },
      {
        status: 500,
      }
    );
  }
}