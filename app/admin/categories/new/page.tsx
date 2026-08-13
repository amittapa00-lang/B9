import { prisma } from "@/lib/prisma";
import NewCategoryForm from "@/components/admin/categories/NewCategoryForm";

export default async function NewCategoryPage() {
  const categories = await prisma.category.findMany({
    where: {
      parentId: null, // แสดงเฉพาะหมวดหลัก
    },
    orderBy: {
      name: "asc",
    },
  });

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-8 text-3xl font-bold">
        Add Category
      </h1>

      <NewCategoryForm categories={categories} />
    </div>
  );
}