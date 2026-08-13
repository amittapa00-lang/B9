import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import EditCategoryForm from "@/components/admin/categories/EditCategoryForm";

interface Props {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditCategoryPage({
  params,
}: Props) {
  const { id } = await params;

  const category = await prisma.category.findUnique({
    where: {
      id,
    },
  });

  if (!category) {
    notFound();
  }

  const categories = await prisma.category.findMany({
    where: {
      parentId: null,
      NOT: {
        id,
      },
    },
    orderBy: {
      name: "asc",
    },
  });

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-8 text-3xl font-bold">
        Edit Category
      </h1>

      <EditCategoryForm
        category={category}
        categories={categories}
      />
    </div>
  );
}