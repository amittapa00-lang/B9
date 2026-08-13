import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Noto_Sans_Thai, Noto_Serif_Thai } from "next/font/google";
import { prisma } from "@/lib/prisma";
import ProductGallery from "@/components/products/ProductGallery";
import Navbar from "@/components/layout/Navbar";
import AddToCartButton from "@/components/products/AddToCartButton";

/**
 * Design tokens (ชุดเดียวกับหน้ารายการสินค้า)
 * ink        #16241D  — ตัวอักษรหลัก
 * surface    #FBFAF6  — พื้นหลังกระดาษอุ่น
 * brand      #0E6B4C  — เขียวหยก (CTA/ลิงก์)
 * brand-dark #0A4E38
 * gold       #C9932E  — ทองประทับตรา
 * line       #E6E2D6  — เส้นขอบอ่อน
 * muted      #74806F  — ตัวอักษรรอง
 */

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

const THB = new Intl.NumberFormat("th-TH", {
  style: "currency",
  currency: "THB",
  maximumFractionDigits: 0,
});

interface Props {
  params: Promise<{
    slug: string;
  }>;
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;

  // แปลง URL ที่ encode แล้วกลับเป็นข้อความปกติ
  const decodedSlug = decodeURIComponent(slug);

  const product = await prisma.product.findFirst({
    where: {
      slug: decodedSlug,
    },
    include: {
      category: true,
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

  const relatedProducts = await prisma.product.findMany({
    where: {
      categoryId: product.categoryId,
      id: {
        not: product.id,
      },
      isActive: true,
    },
    include: {
      images: {
        take: 1,
        orderBy: {
          sortOrder: "asc",
        },
      },
    },
    take: 4,
  });

  const inStock = product.stock > 0;
  const lowStock = inStock && product.stock <= 5;

  return (
    <div
      className={`${notoSans.variable} ${notoSerif.variable} min-h-screen bg-[#FBFAF6]`}
      style={{ fontFamily: "var(--font-sans-thai)" }}
    >
      <Navbar />

      <main className="mx-auto max-w-6xl px-4 pb-28 pt-6 sm:px-6 sm:pb-16 sm:pt-10 lg:px-8">
        {/* ===== Breadcrumb ===== */}
        <nav
          aria-label="เส้นทางนำทาง"
          className="mb-6 flex flex-wrap items-center gap-1.5 text-sm text-[#74806F]"
        >
          <Link href="/" className="transition hover:text-[#0E6B4C]">
            หน้าแรก
          </Link>
          <span aria-hidden="true">/</span>
          <Link href="/product" className="transition hover:text-[#0E6B4C]">
            สินค้าทั้งหมด
          </Link>
          <span aria-hidden="true">/</span>
          <span>{product.category.name}</span>
          <span aria-hidden="true">/</span>
          <span className="truncate text-[#16241D]">{product.name}</span>
        </nav>

        {/* ===== เนื้อหาหลัก: รูปภาพ + ข้อมูลสินค้า ===== */}
        <div className="grid gap-6 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-10 xl:gap-14">
          {/* กรอบรูปภาพสินค้า — ยึดตำแหน่งขณะเลื่อนบนจอใหญ่ */}
          <div className="lg:sticky lg:top-6 lg:self-start">
            <div className="overflow-hidden rounded-2xl border border-[#E6E2D6] bg-white p-3 shadow-sm sm:p-4">
              <ProductGallery images={product.images} productName={product.name} />
            </div>
          </div>

          {/* แผงข้อมูลสินค้า */}
          <div className="flex flex-col gap-6">
            <div>
              <p className="text-sm font-medium uppercase tracking-wide text-[#0E6B4C]">
                {product.category.name}
              </p>

              <h1
                style={{ fontFamily: "var(--font-serif-thai)" }}
                className="mt-2 text-2xl font-bold leading-tight text-[#16241D] sm:text-3xl lg:text-4xl"
              >
                {product.name}
              </h1>

              <p className="mt-2 text-xs text-[#A6AC9D]">
                รหัสสินค้า (SKU): {product.sku}
              </p>
            </div>

            {/* กล่องซื้อสินค้า: ราคา + สถานะสต็อก + ปุ่มหยิบใส่ตะกร้า รวมไว้ในกรอบเดียว */}
            <div className="rounded-2xl border border-[#E6E2D6] bg-white p-5 sm:p-6">
              <div className="flex items-end justify-between gap-3">
                <span className="text-3xl font-bold text-[#0E6B4C] sm:text-4xl">
                  {THB.format(Number(product.price))}
                </span>

                {inStock ? (
                  <span
                    className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
                      lowStock
                        ? "bg-[#C9932E]/10 text-[#C9932E]"
                        : "bg-[#0E6B4C]/10 text-[#0E6B4C]"
                    }`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        lowStock ? "bg-[#C9932E]" : "bg-[#0E6B4C]"
                      }`}
                    />
                    {lowStock ? `เหลือ ${product.stock} ชิ้น` : "มีสินค้าพร้อมส่ง"}
                  </span>
                ) : (
                  <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-600">
                    <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                    สินค้าหมด
                  </span>
                )}
              </div>

              <div className="mt-5">
                <AddToCartButton productId={product.id} />
              </div>
            </div>

            {/* คำอธิบายสินค้า */}
            <div className="rounded-2xl border border-[#E6E2D6] bg-white p-5 sm:p-6">
              <h2 className="mb-3 text-base font-bold text-[#16241D]">
                รายละเอียดสินค้า
              </h2>
              <div className="whitespace-pre-wrap text-[15px] leading-8 text-[#5B655A]">
                {product.description}
              </div>
            </div>
          </div>
        </div>

        {/* ===== สินค้าที่เกี่ยวข้อง ===== */}
        {relatedProducts.length > 0 && (
          <section className="mt-16 border-t border-[#E6E2D6] pt-12 sm:mt-20 sm:pt-14">
            <span className="text-xs font-semibold uppercase tracking-wide text-[#74806F]">
              แนะนำเพิ่มเติม
            </span>
            <h2
              style={{ fontFamily: "var(--font-serif-thai)" }}
              className="mb-8 mt-1 text-2xl font-bold text-[#16241D] sm:text-3xl"
            >
              สินค้าที่เกี่ยวข้อง
            </h2>

            <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
              {relatedProducts.map((item) => (
                <Link
                  key={item.id}
                  href={`/product/${item.slug}`}
                  className="group overflow-hidden rounded-2xl border border-[#E6E2D6] bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
                >
                  {/* กรอบมัตขาว รอบรูปภาพ ให้ดูเป็นสตูดิโอถ่ายสินค้า */}
                  <div className="relative aspect-square bg-[#F3F1E9] p-3 sm:p-4">
                    <div className="relative h-full w-full overflow-hidden rounded-xl bg-white">
                      {item.images.length > 0 ? (
                        <Image
                          src={item.images[0].imageUrl}
                          alt={item.name}
                          fill
                          sizes="(max-width: 640px) 50vw, 25vw"
                          className="object-contain p-2 transition duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-sm text-[#A6AC9D]">
                          ไม่มีรูปภาพ
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="p-4 sm:p-5">
                    <h3 className="line-clamp-2 min-h-[2.5em] text-sm font-semibold text-[#16241D] sm:text-base">
                      {item.name}
                    </h3>
                    <p className="mt-2 text-lg font-bold text-[#0E6B4C]">
                      {THB.format(Number(item.price))}
                    </p>
                    <div className="mt-2 flex items-center gap-1 text-xs font-semibold text-[#74806F] transition group-hover:text-[#0E6B4C]">
                      ดูรายละเอียด
                      <svg
                        viewBox="0 0 20 20"
                        className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1"
                        fill="none"
                      >
                        <path
                          d="M4 10h12m0 0-4-4m4 4-4 4"
                          stroke="currentColor"
                          strokeWidth={1.8}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>

      {/* ===== แถบสั่งซื้อลอยด้านล่าง (แสดงเฉพาะจอเล็ก/กลาง) ===== */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[#E6E2D6] bg-white/95 px-4 py-3 backdrop-blur lg:hidden">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs text-[#74806F]">ราคา</p>
            <p className="truncate text-xl font-bold text-[#0E6B4C]">
              {THB.format(Number(product.price))}
            </p>
          </div>
          <div className="w-full max-w-55">
            <AddToCartButton productId={product.id} />
          </div>
        </div>
      </div>
    </div>
  );
}