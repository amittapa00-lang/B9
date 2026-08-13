// components/sections/home/FeaturedCollection.tsx
import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

const priceFmt = new Intl.NumberFormat("th-TH");

export default async function FeaturedCollection() {
  const featured = await prisma.product.findMany({
    where: { isActive: true, stock: { gt: 0 } },
    orderBy: { price: "desc" },
    take: 4,
    include: { images: { orderBy: { sortOrder: "asc" }, take: 1 } },
  });

  if (featured.length === 0) return null;

  return (
    <section className="bg-[#FCFBF7] py-16 md:py-20">
      <div className="mx-auto max-w-6xl px-4 md:px-8">
        <div className="mx-auto max-w-xl text-center">
          <span className="font-mono text-xs uppercase tracking-[0.2em] text-[#70855C]">
            คัดสรร 04 ชิ้น
          </span>
          <h2 className="mt-2 text-balance font-serif text-3xl font-light leading-tight text-[#21301F] md:text-4xl">
            อัปเกรดชีวิตประจำวัน
            <br className="hidden md:block" />
            ด้วยของใช้ที่ใช่กว่าเดิม
          </h2>
        </div>

        <div className="mt-10 grid grid-cols-2 gap-5 md:grid-cols-4 md:gap-6">
          {featured.map((product) => (
            <Link
              key={product.id}
              href={`/products/${product.slug}`}
              className="group block"
            >
              <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-[#E7ECDF] shadow-sm transition group-hover:shadow-md">
                <Image
                  src={product.images[0]?.imageUrl ?? "/placeholder.png"}
                  alt={product.name}
                  fill
                  sizes="(max-width: 768px) 45vw, 22vw"
                  className="object-cover transition duration-500 group-hover:scale-105"
                />
              </div>
              <p className="mt-4 text-base text-[#21301F] group-hover:underline">
                {product.name}
              </p>
              <p className="mt-1 font-mono text-sm text-[#21301F]">
                <span className="text-[#B98457]">฿</span>{" "}
                {priceFmt.format(Number(product.price))}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}