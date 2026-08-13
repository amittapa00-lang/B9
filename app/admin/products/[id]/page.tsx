import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ProductForm from "@/components/admin/products/ProductForm";

interface Props {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditProductPage({
  params,
}: Props) {
  const { id } = await params;

  const product = await prisma.product.findUnique({
    where: {
      id,
    },
    include: {
      images: {
        orderBy: {
          sortOrder: "asc",
        },
      },
    },
  });

  if (!product) {
    notFound();
  }

  const categories = await prisma.category.findMany({
    orderBy: {
      name: "asc",
    },
  });

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="mb-8 text-3xl font-bold">
        แก้ไขสินค้า
      </h1>

      <ProductForm
        categories={categories}
        product={{
          id: product.id,
          name: product.name,
          sku: product.sku,
          description: product.description,
          categoryId: product.categoryId,
          price: product.price,
          stock: product.stock,
          // แก้ไขตรงนี้: ส่งเป็น Array of Objects ที่มี property imageUrl
          images: product.images.map((image) => ({
            imageUrl: image.imageUrl,
          })),
        }}
      />
    </div>
  );
}