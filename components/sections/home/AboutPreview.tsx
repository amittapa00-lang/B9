// components/sections/home/AboutPreview.tsx
import Link from "next/link";
import Image from "next/image";
import {
  Lightbulb,
  Headphones,
  Battery,
  Watch,
  Speaker,
  Camera,
  ArrowRight,
  Package,
} from "lucide-react";
import { prisma } from "@/lib/prisma";

const stats = [
  { label: "ปีที่ดำเนินธุรกิจ", value: "8+" },
  { label: "สินค้าให้เลือก", value: "1,200+" },
  { label: "ลูกค้าที่ไว้วางใจ", value: "50,000+" },
];

const shelfIcons = [Lightbulb, Headphones, Battery, Watch, Speaker, Camera];

async function getShowcaseProducts() {
  return prisma.product.findMany({
    where: { isActive: true },
    take: 6,
    orderBy: { createdAt: "desc" },
    include: { images: { orderBy: { sortOrder: "asc" }, take: 1 } },
  });
}

export default async function AboutPreview() {
  const products = await getShowcaseProducts();
  const hasProducts = products.length > 0;

  return (
    <section className="bg-[#FAF7F0]">
      <div className="mx-auto max-w-6xl px-4 pt-6 pb-6 md:px-8 md:pt-10 md:pb-10">
        <div className="grid items-center gap-12 md:grid-cols-2 md:gap-20">
          {/* photo panel */}
          <div className="grid grid-cols-3 gap-3 rounded-3xl bg-white p-5 shadow-[0_1px_3px_rgba(28,42,23,0.08)] ring-1 ring-[#E2DCCB] md:gap-4 md:p-8">
            {hasProducts
              ? products.map((product, i) => {
                  const image = product.images[0];
                  return (
                    <div
                      key={product.id}
                      className={`relative flex aspect-square items-center justify-center overflow-hidden rounded-2xl ${
                        i === 1 ? "bg-[#24331C]" : "bg-[#F1EDE1]"
                      }`}
                    >
                      {image ? (
                        <Image
                          src={image.imageUrl}
                          alt={product.name}
                          fill
                          sizes="(max-width: 768px) 30vw, 160px"
                          className="object-cover"
                        />
                      ) : (
                        <Package
                          className={`h-7 w-7 md:h-8 md:w-8 ${
                            i === 1 ? "text-[#F3F1E7]" : "text-[#3F4A38]"
                          }`}
                          strokeWidth={1.25}
                        />
                      )}
                    </div>
                  );
                })
              : shelfIcons.map((Icon, i) => (
                  <div
                    key={i}
                    className={`flex aspect-square items-center justify-center rounded-2xl ${
                      i === 1 ? "bg-[#24331C] text-[#F3F1E7]" : "bg-[#F1EDE1] text-[#3F4A38]"
                    }`}
                  >
                    <Icon className="h-7 w-7 md:h-8 md:w-8" strokeWidth={1.25} />
                  </div>
                ))}
          </div>

          {/* copy */}
          <div>
            <span className="font-serif text-sm italic text-[#5F7850]">
              เรื่องราวของเรา
            </span>
            <h2 className="mt-3 font-serif text-3xl font-medium leading-tight text-[#1C2A17] md:text-4xl">
              ร้านของใช้ที่เข้าใจ
              <br />
              ชีวิตประจำวันของคุณ
            </h2>
            <p className="mt-4 max-w-lg text-[#3F4A38]">
              เราคัดสินค้าทุกชิ้นด้วยตัวเอง ทดลองใช้จริงก่อนวางขาย
              เพื่อให้มั่นใจว่าทุกออเดอร์ที่ส่งถึงมือคุณ คุ้มค่าและใช้งานได้จริง
            </p>

            <div className="mt-8 grid grid-cols-3 gap-4 rounded-2xl bg-white p-5 shadow-[0_1px_3px_rgba(28,42,23,0.08)] ring-1 ring-[#E2DCCB]">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <p className="font-serif text-2xl font-medium text-[#1C2A17] md:text-3xl">
                    {stat.value}
                  </p>
                  <p className="mt-1 text-xs font-medium text-[#3F4A38] md:text-sm">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>

            <Link
              href="/about"
              className="mt-8 inline-flex items-center gap-2 rounded-full border border-[#1C2A17]/25 px-7 py-3 text-sm font-medium text-[#1C2A17] transition hover:border-[#24331C] hover:bg-[#24331C] hover:text-[#F3F1E7]"
            >
              อ่านเรื่องราวของเรา
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}