import Link from "next/link";
import Card from "@/components/ui/Card";
import type { Brand } from "@/data/brands";

interface BrandCardProps {
  brand: Brand;
}

export default function BrandCard({
  brand,
}: BrandCardProps) {
  return (
    <Card className="group h-full">

      <div
        className={`flex h-14 w-14 items-center justify-center rounded-2xl ${brand.color} text-3xl transition duration-300 group-hover:scale-110 sm:h-16 sm:w-16 sm:text-4xl md:h-20 md:w-20 md:text-5xl`}
      >
        {brand.icon}
      </div>

      <h3 className="mt-5 text-lg font-bold text-[#0B3D2E] sm:mt-6 sm:text-xl md:mt-8 md:text-2xl">
        {brand.name}
      </h3>

      <p className="mt-3 text-sm leading-6 text-gray-600 sm:mt-4 sm:text-base sm:leading-7 md:leading-8">
        {brand.description}
      </p>

      <Link
        href={brand.href}
        className="mt-5 inline-flex items-center text-sm font-semibold text-[#0B3D2E] transition hover:translate-x-1 sm:mt-6 sm:text-base md:mt-8"
      >
        ดูรายละเอียดเพิ่มเติม →
      </Link>

    </Card>
  );
}