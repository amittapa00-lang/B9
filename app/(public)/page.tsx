import Hero from "@/components/sections/home/Hero";
import AboutPreview from "@/components/sections/home/AboutPreview";
import BrandsSection from "@/components/sections/home/BrandsSection";
import HomeSections from "@/components/sections/home";
import { prisma } from "@/lib/prisma";

export default async function HomePage() {
  // Top-level categories, along with their direct children's ids —
  // products may be assigned to the parent category OR to one of its
  // sub-categories, so we need both when collecting "3 products per
  // main category".
  const categories = await prisma.category.findMany({
    where: { parentId: null, isActive: true },
    orderBy: { sortOrder: "asc" },
    include: {
      children: { select: { id: true } },
    },
  });

  const heroCategories = await Promise.all(
    categories.map(async (category) => {
      const categoryIds = [category.id, ...category.children.map((c) => c.id)];

      const products = await prisma.product.findMany({
        where: {
          categoryId: { in: categoryIds },
          isActive: true,
          stock: { gt: 0 },
        },
        orderBy: { createdAt: "desc" },
        take: 3,
        include: { images: { orderBy: { sortOrder: "asc" }, take: 1 } },
      });

      return {
        id: category.id,
        name: category.name,
        slug: category.slug,
        products: products.map((product) => ({
          id: product.id,
          name: product.name,
          slug: product.slug,
          price: product.price,
          image: product.images[0]?.imageUrl ?? "/placeholder.png",
        })),
      };
    })
  );

  const heroCategoriesWithProducts = heroCategories.filter(
    (category) => category.products.length > 0
  );

  return (
    <>
      <Hero categories={heroCategoriesWithProducts} />
      <AboutPreview />
      <BrandsSection />

      <HomeSections />
    </>
  );
}