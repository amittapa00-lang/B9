// app/api/categories/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-");
}

export async function GET() {
  const categories = await prisma.category.findMany({
    where: {
      parentId: null,
      isActive: true,
    },
    include: {
      children: {
        where: { isActive: true },
        orderBy: { sortOrder: "asc" },
      },
    },
    orderBy: { sortOrder: "asc" },
  });

  return NextResponse.json(categories);
}

export async function POST(req: Request) {
  const body = await req.json();

  if (!body.name || typeof body.name !== "string" || !body.name.trim()) {
    return NextResponse.json(
      { message: "กรุณาระบุชื่อหมวดหมู่" },
      { status: 400 }
    );
  }

  const slug = slugify(body.name);

  const existing = await prisma.category.findUnique({
    where: { slug },
  });

  if (existing) {
    return NextResponse.json(
      { message: "มีหมวดหมู่ชื่อนี้อยู่แล้ว" },
      { status: 409 }
    );
  }

  const category = await prisma.category.create({
    data: {
      name: body.name.trim(),
      slug,
      parentId: body.parentId || null,
    },
  });

  return NextResponse.json(category, { status: 201 });
}