import { Noto_Sans_Thai, Noto_Serif_Thai } from "next/font/google";
import { prisma } from "@/lib/prisma";
import {
  ProductExplorer,
  type ExplorerItem,
  type CategoryNode,
} from "@/components/products/ProductExplorer";

const notoSans = Noto_Sans_Thai({
  subsets: ["thai", "latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans-thai",
});

const notoSerif = Noto_Serif_Thai({
  subsets: ["thai", "latin"],
  weight: ["600", "700"],
  variable: "--font-serif-thai",
});

export const metadata = {
  title: "สินค้าทั้งหมด | ร้านค้าของเรา",
  description: "เลือกชมสินค้าคุณภาพที่คัดสรรมาเพื่อคุณ",
};

// จำนวนสินค้าขายดีสูงสุดที่จะดึงมา (เรียงตามยอดสั่งซื้อจริง)
const BEST_SELLER_LIMIT = 24;

export default async function ProductPage() {
  const [products, rootCategories, bestSellerAgg] = await Promise.all([
    prisma.product.findMany({
      where: { isActive: true },
      include: {
        images: { orderBy: { sortOrder: "asc" } },
        category: {
          include: { parent: true },
        },
      },
      orderBy: { createdAt: "desc" },
    }),

    // หมวดหมู่หลัก พร้อมหมวดย่อยที่ผูกอยู่
    prisma.category.findMany({
      where: { parentId: null },
      include: {
        children: { orderBy: { name: "asc" } },
      },
      orderBy: { name: "asc" },
    }),

    // นับยอดขายจริงจาก OrderItem เพื่อหาสินค้าขายดี
    // ปรับชื่อโมเดล/ฟิลด์ตรงนี้ให้ตรงกับ schema จริงของคุณ
    prisma.orderItem.groupBy({
      by: ["productId"],
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: "desc" } },
      take: BEST_SELLER_LIMIT,
    }),
  ]);

  const salesByProductId = new Map<string, number>(
    bestSellerAgg.map((row) => [row.productId, row._sum.quantity ?? 0])
  );

  // แปลงข้อมูลให้ปลอดภัยสำหรับส่งไปยัง Client Component
  const items: ExplorerItem[] = products.map((product) => ({
    id: product.id,
    slug: product.slug,
    name: product.name,
    price: Number(product.price),
    createdAt: product.createdAt.toISOString(),
    categoryId: product.category.id,
    categoryName: product.category.name,
    categorySlug: product.category.slug,
    parentCategoryId: product.category.parent?.id ?? null,
    parentCategoryName: product.category.parent?.name ?? null,
    imageUrl: product.images[0]?.imageUrl ?? null,
    salesCount: salesByProductId.get(product.id) ?? 0,
    isBestSeller: salesByProductId.has(product.id),
  }));

  const categoryTree: CategoryNode[] = rootCategories.map((cat) => ({
    id: cat.id,
    name: cat.name,
    slug: cat.slug,
    children: cat.children.map((child) => ({
      id: child.id,
      name: child.name,
      slug: child.slug,
      children: [],
    })),
  }));

  return (
    <main
      className={`${notoSans.variable} ${notoSerif.variable} min-h-screen bg-[#FBFAF6]`}
      style={{ fontFamily: "var(--font-sans-thai)" }}
    >
      <ProductExplorer items={items} categoryTree={categoryTree} />
    </main>
  );
}