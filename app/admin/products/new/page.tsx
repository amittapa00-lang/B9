import { prisma } from "@/lib/prisma";
import ProductForm from "@/components/admin/products/ProductForm";

export default async function NewProductPage() {
  const categories = await prisma.category.findMany({
    orderBy: {
      name: "asc",
    },
  });

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="mb-8 text-3xl font-bold">
        เพิ่มสินค้า
      </h1>

      <ProductForm categories={categories} />
    </div>
  );
}