import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json(
      { message: "Unauthorized" },
      { status: 401 }
    );
  }

  const body = await req.json();

  if (body.isDefault) {
    await prisma.address.updateMany({
      where: {
        userId: session.user.id,
      },
      data: {
        isDefault: false,
      },
    });
  }

  await prisma.address.create({
    data: {
      userId: session.user.id,

      fullName: body.fullName,
      phone: body.phone,
      address: body.address,

      subDistrict: body.subDistrict,
      district: body.district,
      province: body.province,
      postalCode: body.postalCode,

      note: body.note,

      isDefault: body.isDefault,
    },
  });

  return NextResponse.json({
    success: true,
  });
}









