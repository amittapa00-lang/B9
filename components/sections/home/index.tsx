// components/sections/home/index.tsx
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { prisma } from "@/lib/prisma";

const priceFmt = new Intl.NumberFormat("th-TH");

// สีตายตัว ใช้ inline style เพื่อกันปัญหา Tailwind purge / CSS ทับ
const COLOR = {
  onDark: "#FFFFFF",       // ตัวหนังสือบนพื้นเข้ม
  onDarkSoft: "#E8C9A8",   // ตัวหนังสือรองบนพื้นเข้ม (โทนส้ม อ่อนลง)
  onLight: "#14210F",      // ตัวหนังสือบนพื้นอ่อน (เกือบดำ)
  onLightSoft: "#3F4A38",  // ตัวหนังสือรองบนพื้นอ่อน
  accent: "#B5713F",       // clay accent
};

export default async function HomeSections() {
  const newArrivals = await prisma.product.findMany({
    where: { isActive: true, stock: { gt: 0 } },
    orderBy: { createdAt: "desc" },
    take: 8,
    include: { images: { orderBy: { sortOrder: "asc" }, take: 1 } },
  });

  return (
    <>
      {/* new arrivals — deep fern band (พื้นเข้ม) */}
      {newArrivals.length > 0 && (
        <section style={{ backgroundColor: "#24331C" }}>
          <div className="mx-auto max-w-6xl px-4 py-5 md:px-8 md:py-9">
            <div className="text-center">
              <span
                className="font-mono text-[11px] font-medium uppercase tracking-[0.2em]"
                style={{ color: COLOR.onDarkSoft }}
              >
                มาใหม่ล่าสุด
              </span>
              <h2
                className="mt-2 font-serif text-3xl font-light md:text-4xl"
                style={{ color: COLOR.onDark }}
              >
                สินค้าที่คุณอาจสนใจ
              </h2>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
              {newArrivals.map((product, i) => (
                <div key={product.id} className="group">
                  <Link href={`/products/${product.slug}`} className="block">
                    <div className="relative aspect-4/5 overflow-hidden rounded-2xl bg-[#F1EDE1]">
                      <Image
                        src={product.images[0]?.imageUrl ?? "/placeholder.png"}
                        alt={product.name}
                        fill
                        sizes="(max-width: 768px) 45vw, 22vw"
                        className="object-cover transition duration-500 group-hover:scale-105"
                      />
                      <span
                        className="absolute left-3 top-3 rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-wide"
                        style={{
                          backgroundColor: i === 0 ? COLOR.accent : "#FFFFFF",
                          color: i === 0 ? "#FFFFFF" : COLOR.onLight,
                        }}
                      >
                        {i === 0 ? "Sale" : "New"}
                      </span>
                    </div>
                  </Link>
                  <div className="mt-3">
                    <Link
                      href={`/products/${product.slug}`}
                      className="line-clamp-1 block text-sm font-medium hover:underline"
                      style={{ color: COLOR.onDark }}
                    >
                      {product.name}
                    </Link>
                    <p className="mt-1 font-mono text-sm font-medium" style={{ color: COLOR.onDark }}>
                      <span style={{ color: COLOR.onDarkSoft }}>฿</span>{" "}
                      {priceFmt.format(Number(product.price))}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-3 text-center">
              <Link
                href="/products?sort=newest"
                className="inline-flex items-center gap-1 rounded-full border px-6 py-2.5 text-sm font-medium transition"
                style={{ borderColor: "rgba(255,255,255,0.4)", color: COLOR.onDark }}
              >
                ดูทั้งหมด <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      )}
    </>
  );
}