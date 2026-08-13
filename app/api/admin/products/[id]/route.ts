import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-");
}

// =======================
// UPDATE PRODUCT
// =======================
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const body = await req.json();

    const product = await prisma.product.findUnique({
      where: {
        id,
      },
    });

    if (!product) {
      return NextResponse.json(
        {
          message: "ไม่พบสินค้า",
        },
        {
          status: 404,
        }
      );
    }

    // เช็ค SKU ซ้ำ
    const skuExists = await prisma.product.findFirst({
      where: {
        sku: body.sku,
        NOT: {
          id,
        },
      },
    });

    if (skuExists) {
      return NextResponse.json(
        {
          message: "รหัสสินค้านี้มีอยู่แล้ว",
        },
        {
          status: 400,
        }
      );
    }

    const slug = slugify(body.name);

    // เช็คชื่อซ้ำ
    const slugExists = await prisma.product.findFirst({
      where: {
        slug,
        NOT: {
          id,
        },
      },
    });

    if (slugExists) {
      return NextResponse.json(
        {
          message: "ชื่อสินค้านี้มีอยู่แล้ว",
        },
        {
          status: 400,
        }
      );
    }

    // ลบรูปเดิมทั้งหมด
    await prisma.productImage.deleteMany({
      where: {
        productId: id,
      },
    });

    // อัปเดตสินค้า
    const updated = await prisma.product.update({
      where: {
        id,
      },

      data: {
        name: body.name,
        sku: body.sku,
        slug,
        description: body.description,
        categoryId: body.categoryId,
        price: Number(body.price),
        stock: Number(body.stock),

        images: {
          create: body.images.map(
            (url: string, index: number) => ({
              imageUrl: url,
              sortOrder: index,
            })
          ),
        },
      },

      include: {
        images: true,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        message: "Update Failed",
      },
      {
        status: 500,
      }
    );
  }
}

// =======================
// DELETE PRODUCT
// =======================
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await prisma.product.delete({
      where: {
        id,
      },
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        message: "Delete Failed",
      },
      {
        status: 500,
      }
    );
  }
}