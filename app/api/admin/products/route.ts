import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import slugify from "slugify";

interface ProductBody {
  name: string;
  sku: string;
  description: string;
  categoryId: string;
  price: number;
  stock: number;
  images: string[];
}

export async function POST(req: Request) {
  try {
    const body: ProductBody = await req.json();

    // ตรวจสอบ SKU ซ้ำ
    const skuExists = await prisma.product.findUnique({
      where: {
        sku: body.sku,
      },
    });

    if (skuExists) {
      return NextResponse.json(
        {
          message: "SKU นี้มีอยู่แล้ว",
        },
        {
          status: 400,
        }
      );
    }

    // สร้าง slug จากชื่อสินค้า
    const baseSlug = slugify(body.name, {
      lower: true,
      strict: true,
      locale: "th",
      trim: true,
    });

    let slug = baseSlug;
    let count = 1;

    // ถ้า slug ซ้ำ ให้ต่อเลขท้าย
    while (true) {
      const exists = await prisma.product.findUnique({
        where: {
          slug,
        },
      });

      if (!exists) break;

      slug = `${baseSlug}-${count}`;
      count++;
    }

    const product = await prisma.product.create({
      data: {
        name: body.name,
        sku: body.sku,
        slug,
        description: body.description,
        categoryId: body.categoryId,
        price: Number(body.price),
        stock: Number(body.stock),

        images: {
          create: body.images.map((url, index) => ({
            imageUrl: url,
            sortOrder: index,
          })),
        },
      },

      include: {
        images: true,
        category: true,
      },
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        message: "Create Product Failed",
      },
      {
        status: 500,
      }
    );
  }
}