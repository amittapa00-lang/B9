import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface Props {
  params: Promise<{
    id: string;
  }>;
}

function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-");
}

export async function PUT(
  req: Request,
  { params }: Props
) {
  const { id } = await params;

  const body = await req.json();

  const category =
    await prisma.category.update({
      where: {
        id,
      },
      data: {
        name: body.name,
        slug: slugify(body.name),
        parentId:
          body.parentId || null,
      },
    });

  return NextResponse.json(category);
}
export async function DELETE(
  req: Request,
  { params }: Props
) {
  const { id } = await params;

  await prisma.category.delete({
    where: {
      id,
    },
  });

  return NextResponse.json({
    success: true,
  });
}