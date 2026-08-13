import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-");
}

export async function POST(req: Request) {
  const body = await req.json();

  const category = await prisma.category.create({
    data: {
      name: body.name,
      slug: slugify(body.name),
      parentId: body.parentId || null,
    },
  });

  return NextResponse.json(category);
}