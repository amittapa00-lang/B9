"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

// ---------------------------------------------------------------------------
// Shape matches what page.tsx builds from Prisma (up to 3 products per
// category — the small circle in the middle of each card cycles through
// them):
//
//   const categories = await prisma.category.findMany({
//     where: { parentId: null, isActive: true },
//     orderBy: { sortOrder: "asc" },
//     include: {
//       products: {
//         where: { isActive: true, stock: { gt: 0 } },
//         orderBy: { createdAt: "desc" },
//         take: 3,
//         include: { images: { orderBy: { sortOrder: "asc" }, take: 1 } },
//       },
//     },
//   });
// ---------------------------------------------------------------------------

export type HeroProduct = {
  id: string;
  name: string;
  slug: string;
  price: number;
  image: string;
};

export type HeroCategory = {
  id: string;
  name: string;
  slug: string;
  products: HeroProduct[];
};

function CategoryCard({ category }: { category: HeroCategory }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const products = category.products;

  useEffect(() => {
    if (products.length <= 1) return;

    const interval = setInterval(() => {
      setActiveIndex((current) => (current + 1) % products.length);
    }, 2500);

    return () => clearInterval(interval);
  }, [products.length]);

  const product = products[activeIndex];
  if (!product) return null;

  return (
    <Link href={`/product/${product.slug}`} className="shrink-0">
      <motion.div
        whileHover={{ scale: 1.04 }}
        className="flex w-32 flex-col items-center gap-2 rounded-2xl bg-white/80 p-3 shadow-sm backdrop-blur-sm cursor-pointer sm:w-36 sm:p-4"
      >
        <p className="line-clamp-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-[#0B3D2E] sm:text-xs">
          {category.name}
        </p>

        <div className="relative h-16 w-16 overflow-hidden rounded-full border-2 border-white shadow-sm sm:h-20 sm:w-20">
          <AnimatePresence mode="wait">
            <motion.div
              key={product.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="absolute inset-0"
            >
              <Image
                src={product.image}
                alt={product.name}
                fill
                sizes="(min-width: 640px) 96px, 80px"
                className="object-cover"
              />
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>
    </Link>
  );
}

export default function HeroImage({
  categories = [],
}: {
  categories?: HeroCategory[];
}) {
  const hasCategories = categories.length > 0;

  // Duplicate the list so the marquee can loop seamlessly.
  const marqueeCategories = hasCategories ? [...categories, ...categories] : [];

  return (
    <div className="relative flex justify-center overflow-hidden">

      <motion.div
        className="absolute h-56 w-56 rounded-full bg-green-200 opacity-40 blur-3xl sm:h-72 sm:w-72 md:h-96 md:w-96 lg:h-105 lg:w-105"
        animate={{ scale: [1, 1.08, 1], opacity: [0.4, 0.55, 0.4] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" as const }}
      />

      {hasCategories ? (
        <div
          className="relative w-full max-w-xl py-2"
          style={{
            maskImage:
              "linear-gradient(to right, transparent, black 8%, black 92%, transparent)",
            WebkitMaskImage:
              "linear-gradient(to right, transparent, black 8%, black 92%, transparent)",
          }}
        >
          <motion.div
            className="flex w-max gap-5 sm:gap-6"
            animate={{ x: ["0%", "-50%"] }}
            transition={{
              duration: Math.max(categories.length * 6, 12),
              repeat: Infinity,
              ease: "linear" as const,
            }}
          >
            {marqueeCategories.map((category, index) => (
              <CategoryCard key={`${category.id}-${index}`} category={category} />
            ))}
          </motion.div>
        </div>
      ) : (
        <div className="relative flex flex-col items-center gap-4 p-6 sm:gap-5 sm:p-8 md:gap-6 md:p-10">
          <motion.div
            animate={{
              y: [0, -10, 0],
              transition: {
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut" as const,
              },
            }}
            className="relative h-20 w-20 overflow-hidden rounded-full bg-green-500 shadow-md sm:h-24 sm:w-24 md:h-28 md:w-28"
          >
            <Image
              src="/logo/blong_logo.png"
              alt="B-NINE TRADING CO., LTD."
              fill
              sizes="(min-width: 768px) 112px, (min-width: 640px) 96px, 80px"
              className="object-cover"
            />
          </motion.div>
        </div>
      )}

    </div>
  );
}