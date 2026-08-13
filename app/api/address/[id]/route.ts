import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

interface Props {
  params: Promise<{
    id: string;
  }>;
}

export async function PUT(
  req: Request,
  { params }: Props
) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json(
      {},
      { status: 401 }
    );
  }

  const { id } = await params;

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

  await prisma.address.update({
    where: {
      id,
    },
    data: {
      fullName: body.fullName,
      phone: body.phone,
      address: body.address,
      province: body.province,
      district: body.district,
      subDistrict: body.subDistrict,
      postalCode: body.postalCode,
      note: body.note,
      isDefault: body.isDefault,
    },
  });

  return NextResponse.json({
    success: true,
  });
}
export async function DELETE(
  req: Request,
  { params }: Props
) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json(
      { message: "Unauthorized" },
      { status: 401 }
    );
  }

  const { id } = await params;

  // ตรวจสอบว่าเป็นเจ้าของที่อยู่จริง
  const address = await prisma.address.findFirst({
    where: {
      id,
      userId: session.user.id,
    },
  });

  if (!address) {
    return NextResponse.json(
      { message: "Address not found" },
      { status: 404 }
    );
  }

  await prisma.address.delete({
    where: {
      id,
    },
  });

  return NextResponse.json({
    success: true,
  });
}