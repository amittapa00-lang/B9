import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const category = await prisma.category.findUnique({
    where: { slug },
  });

  if (!category) {
    return NextResponse.json([], { status: 404 });
  }

  const products = await prisma.product.findMany({
    where: {
      categoryId: category.id,
      isActive: true,
    },
    select: {
      id: true,
      name: true,
      slug: true,
    },
    orderBy: { createdAt: "desc" },
    take: 8,
  });

  return NextResponse.json(products);
}