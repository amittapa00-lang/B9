"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Sparkles, ShieldCheck } from "lucide-react";

/**
 * Palette — "Sage Market" (B-NINE TRADING Signature Edition)
 *   mist    #E7ECDF – page background (soft sage)
 *   linen   #FCFBF7 – card surface
 *   forest  #21301F – ink / headline text
 *   moss    #70855C – primary accent: CTAs, active pill
 *   fern    #33452B – deep accent: hover, dark sections
 *   clay    #B98457 – secondary accent: price, "new" tag
 */

interface HeroProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  image: string;
}

interface HeroCategory {
  id: string;
  name: string;
  slug: string;
  products: HeroProduct[];
}

interface HeroProps {
  categories: HeroCategory[];
}

const priceFmt = new Intl.NumberFormat("th-TH");

export default function Hero({ categories }: HeroProps) {
  const [activeId, setActiveId] = useState(categories[0]?.id);
  const active = categories.find((c) => c.id === activeId) ?? categories[0];

  return (
    <section className="relative overflow-hidden bg-[#E7ECDF] pt-6 pb-20 md:pb-28 selection:bg-[#70855C] selection:text-[#FCFBF7]">
      {/* --- Ambient Dynamic Glowing Background Elements --- */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-120 h-120 md:w-3xl md:h-192 rounded-full bg-linear-to-br from-[#70855C]/20 via-[#B98457]/10 to-transparent blur-3xl pointer-events-none animate-pulse duration-1000" />
      <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-[#FCFBF7]/60 blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-0 w-96 h-96 rounded-full bg-[#70855C]/15 blur-3xl pointer-events-none" />

      <div className="relative mx-auto max-w-5xl px-4 md:px-8">
        
        {/* --- Brand Header & Intro Section --- */}
        <div className="mx-auto max-w-3xl text-center">
          
          {/* --- LOGO WITH SOFT GLOW & HOVER EFFECT --- */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="flex justify-center mb-2 -mt-6 md:-mt-10"
          >
            <Link 
              href="/" 
              className="group relative block h-40 w-88 md:h-52 md:w-lg transition-transform duration-500 hover:scale-105 active:scale-95"
            >
              <Image
                src="/images/b-nine-logo.png"
                alt="B-NINE TRADING Logo"
                fill
                sizes="(max-width: 768px) 352px, 512px"
                className="object-contain filter drop-shadow-xs transition-all duration-500 group-hover:drop-shadow-md"
                priority
              />
            </Link>
          </motion.div>

          {/* Main Headline */}
          <motion.h1 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="text-balance font-serif text-xl font-light leading-[1.3] tracking-tight text-[#21301F] md:text-3xl lg:text-4xl -mt-2"
          >
            คัดสรรความเรียบง่าย
            <span className="block mt-1.5 font-normal text-[#70855C] tracking-normal">
              เพื่อชีวิตที่ยั่งยืน
            </span>
          </motion.h1>

          {/* Subtitle Description */}
          <motion.p 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="mx-auto mt-4 max-w-xl text-base md:text-lg text-[#21301F]/75 leading-relaxed font-light"
          >
            ที่ <strong className="font-semibold text-[#21301F]">B-NINE TRADING</strong> เราคัดสรรไอเทมของใช้ธรรมชาติ ออกแบบมาเพื่อการใช้งานจริง สัมผัสความละเมียดละไมในทุกวันของคุณ
          </motion.p>

          {/* Call to Action Buttons */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="mt-7 flex flex-wrap items-center justify-center gap-4"
          >
            <Link
              href="/product"
              className="group relative inline-flex items-center gap-3 overflow-hidden rounded-full bg-[#70855C] px-8 py-4 text-sm font-medium text-[#FCFBF7] shadow-xl shadow-[#70855C]/25 transition-all duration-300 hover:bg-[#33452B] hover:shadow-2xl hover:shadow-[#33452B]/30 hover:-translate-y-0.5 active:translate-y-0"
            >
              <span>สำรวจสินค้าทั้งหมด</span>
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1.5" />
              {/* Shimmer Light Effect */}
              <div className="absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/20 to-transparent group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
            </Link>

            <Link
              href="/company"
              className="inline-flex items-center gap-2 rounded-full border border-[#21301F]/15 bg-[#FCFBF7]/50 backdrop-blur-md px-8 py-4 text-sm font-medium text-[#21301F] shadow-xs transition-all duration-300 hover:bg-[#FCFBF7] hover:border-[#21301F]/30 hover:shadow-md hover:-translate-y-0.5 active:translate-y-0"
            >
              <ShieldCheck className="h-4 w-4 text-[#70855C]" />
              เรื่องราวของเรา
            </Link>
          </motion.div>
        </div>

        {/* --- Category Pill Capsule Navigation --- */}
        {categories.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="mt-16"
          >
            <div className="flex items-center justify-between mb-5 px-2">
              <h3 className="font-serif text-xl md:text-2xl text-[#21301F] font-medium tracking-tight">
                แบรนด์ 
              </h3>
              <span className="font-mono text-xs text-[#70855C] uppercase tracking-widest bg-[#70855C]/10 px-3 py-1 rounded-full border border-[#70855C]/20">
                Brand
              </span>
            </div>

            {/* Glassmorphism Capsule Container */}
            <div className="relative flex flex-col md:flex-row items-center justify-center gap-3 md:gap-4 rounded-[36px] bg-[#FCFBF7]/70 p-3 md:p-4 shadow-[0_20px_50px_-15px_rgba(33,48,31,0.07)] backdrop-blur-2xl border border-white/80">
              {categories.map((category) => {
                const isActive = category.id === active?.id;
                const representativeImage = category.products[0]?.image || "/images/placeholder.jpg";

                return (
                  <button
                    key={category.id}
                    onClick={() => setActiveId(category.id)}
                    className={`relative group flex items-center gap-3.5 pl-2.5 pr-7 py-2.5 rounded-full transition-colors duration-300 w-full md:w-auto justify-start z-10 cursor-pointer ${
                      isActive ? "text-[#FCFBF7]" : "text-[#21301F] hover:text-[#33452B]"
                    }`}
                  >
                    {/* Animated Active Background Pill */}
                    {isActive && (
                      <motion.div
                        layoutId="activeCategoryPill"
                        className="absolute inset-0 bg-[#21301F] rounded-full shadow-lg shadow-[#21301F]/20 -z-10"
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                    )}

                    <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-white/90 shadow-xs shrink-0">
                      <Image
                        src={representativeImage}
                        alt={category.name}
                        fill
                        sizes="48px"
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    </div>
                    
                    <span className="text-base font-medium tracking-wide">
                      {category.name}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* --- Animated Product Grid --- */}
            <AnimatePresence mode="wait">
              {active && (
                <motion.div
                  key={active.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-7"
                >
                  {active.products.map((product, i) => (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: i * 0.08 }}
                      className="group flex flex-col"
                    >
                      <Link href={`/product/${product.slug}`} className="block relative">
                        {/* Product Card Container */}
                        <div className="relative aspect-4/5 overflow-hidden rounded-3xl bg-[#FCFBF7] shadow-xs border border-[#21301F]/5 transition-all duration-500 group-hover:shadow-xl group-hover:shadow-[#21301F]/10 group-hover:border-[#70855C]/40">
                          <Image
                            src={product.image}
                            alt={product.name}
                            fill
                            sizes="(max-width: 768px) 50vw, 33vw"
                            className="object-cover transition-transform duration-700 ease-out group-hover:scale-108"
                          />
                          
                          {/* Smooth Gradient Overlay on Hover */}
                          <div className="absolute inset-0 bg-linear-to-t from-[#21301F]/60 via-[#21301F]/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                          {/* "New Item" Badge */}
                          {i === 0 && (
                            <span className="absolute left-3.5 top-3.5 z-10 flex items-center gap-1 rounded-full bg-[#B98457]/90 backdrop-blur-md px-3 py-1 text-[10px] font-medium uppercase tracking-wider text-[#FCFBF7] shadow-md border border-white/20">
                              <Sparkles className="h-3 w-3" />
                              New Arrival
                            </span>
                          )}

                          {/* Quick Action Button Sliding Up */}
                          <div className="absolute inset-x-4 bottom-4 translate-y-4 opacity-0 transition-all duration-300 ease-out group-hover:translate-y-0 group-hover:opacity-100 z-10">
                            <span className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#FCFBF7]/95 py-3 text-xs font-semibold text-[#21301F] shadow-lg backdrop-blur-md transition-all duration-200 hover:bg-[#FCFBF7] hover:scale-[1.02] active:scale-95">
                              <span>ดูรายละเอียดสินค้า</span>
                              <ArrowRight className="h-3.5 w-3.5 text-[#70855C]" />
                            </span>
                          </div>
                        </div>
                      </Link>

                      {/* Product Details */}
                      <div className="mt-3.5 px-1 flex flex-col grow justify-between">
                        <Link
                          href={`/product/${product.slug}`}
                          className="line-clamp-1 text-sm md:text-base font-medium text-[#21301F] transition-colors duration-200 hover:text-[#70855C]"
                        >
                          {product.name}
                        </Link>

                        <div className="mt-1 flex items-center justify-between">
                          <p className="font-mono text-base md:text-lg font-semibold text-[#21301F]">
                            <span className="text-[#B98457] font-sans text-sm">฿</span>{" "}
                            {priceFmt.format(product.price)}
                          </p>

                          <span className="text-[10px] font-mono text-[#70855C] bg-[#FCFBF7] px-2.5 py-0.5 rounded-full border border-[#70855C]/20 shadow-2xs">
                            B-NINE
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

      </div>
    </section>
  );
}