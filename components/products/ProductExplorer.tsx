"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";

/**
 * Design tokens
 * ink        #16241D
 * surface    #FBFAF6
 * card       #FFFFFF
 * brand      #0E6B4C
 * brand-dark #0A4E38
 * gold       #C9932E  — ป้าย "ใหม่"
 * ember      #C2410C  — ป้าย/ไฮไลต์ "ขายดี"
 * line       #E6E2D6
 * muted      #74806F
 */

export type CategoryNode = {
  id: string;
  name: string;
  slug: string;
  children: CategoryNode[];
};

export type ExplorerItem = {
  id: string;
  slug: string;
  name: string;
  price: number;
  createdAt: string;
  categoryId: string;
  categoryName: string;
  categorySlug: string;
  parentCategoryId: string | null;
  parentCategoryName: string | null;
  imageUrl: string | null;
  salesCount: number;
  isBestSeller: boolean;
};

type SortKey = "newest" | "price-asc" | "price-desc" | "name" | "bestselling";

const SORT_LABEL: Record<SortKey, string> = {
  newest: "ใหม่ล่าสุด",
  bestselling: "ขายดีที่สุด",
  "price-asc": "ราคา: ต่ำ → สูง",
  "price-desc": "ราคา: สูง → ต่ำ",
  name: "ชื่อ: ก → ฮ",
};

const ALL_FILTER = "__all__";
const BEST_SELLER_FILTER = "__best_sellers__";

function isNew(createdAt: string) {
  const days = (Date.now() - new Date(createdAt).getTime()) / 86_400_000;
  return days <= 14;
}

const THB = new Intl.NumberFormat("th-TH", {
  style: "currency",
  currency: "THB",
  maximumFractionDigits: 0,
});

// นับจำนวนสินค้าต่อหมวดหมู่ แล้วตัดหมวดที่ไม่มีสินค้าออกจากรายการที่แสดง
function pruneEmptyCategories(
  tree: CategoryNode[],
  items: ExplorerItem[]
): CategoryNode[] {
  const countByCategoryId = new Map<string, number>();
  for (const item of items) {
    countByCategoryId.set(
      item.categoryId,
      (countByCategoryId.get(item.categoryId) ?? 0) + 1
    );
  }

  return tree
    .map((parent) => {
      const children = parent.children.filter(
        (child) => (countByCategoryId.get(child.id) ?? 0) > 0
      );
      const parentOwnCount = countByCategoryId.get(parent.id) ?? 0;
      const totalCount =
        parentOwnCount +
        children.reduce((sum, c) => sum + (countByCategoryId.get(c.id) ?? 0), 0);

      return totalCount > 0 ? { ...parent, children } : null;
    })
    .filter((c): c is CategoryNode => c !== null);
}

export function ProductExplorer({
  items,
  categoryTree: rawCategoryTree,
}: {
  items: ExplorerItem[];
  categoryTree: CategoryNode[];
}) {
  const [activeFilter, setActiveFilter] = useState<string>(ALL_FILTER);
  const [sortKey, setSortKey] = useState<SortKey>("newest");
  const [quickView, setQuickView] = useState<ExplorerItem | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);

  // ตัดหมวดหมู่ที่ไม่มีสินค้าออก ก่อนส่งให้แผงตัวกรอง
  const categoryTree = useMemo(
    () => pruneEmptyCategories(rawCategoryTree, items),
    [rawCategoryTree, items]
  );

  useEffect(() => {
    if (!quickView && !filtersOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setQuickView(null);
      setFiltersOpen(false);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [quickView, filtersOpen]);

  // ชื่อหมวดหมู่/ป้ายที่กำลังเลือกอยู่ ไว้แสดงในข้อความสรุปผล
  const activeLabel = useMemo(() => {
    if (activeFilter === ALL_FILTER) return null;
    if (activeFilter === BEST_SELLER_FILTER) return "สินค้าขายดี";
    for (const parent of categoryTree) {
      if (parent.id === activeFilter) return parent.name;
      const child = parent.children.find((c) => c.id === activeFilter);
      if (child) return `${parent.name} • ${child.name}`;
    }
    return null;
  }, [activeFilter, categoryTree]);

  const visible = useMemo(() => {
    let list = items;

    if (activeFilter === BEST_SELLER_FILTER) {
      list = list.filter((i) => i.isBestSeller);
    } else if (activeFilter !== ALL_FILTER) {
      // เลือกหมวดหลัก -> รวมสินค้าของหมวดย่อยทั้งหมดด้วย
      // เลือกหมวดย่อย -> เฉพาะสินค้าของหมวดนั้น
      list = list.filter(
        (i) => i.categoryId === activeFilter || i.parentCategoryId === activeFilter
      );
    }

    const sorted = [...list];
    switch (sortKey) {
      case "price-asc":
        sorted.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        sorted.sort((a, b) => b.price - a.price);
        break;
      case "name":
        sorted.sort((a, b) => a.name.localeCompare(b.name, "th"));
        break;
      case "bestselling":
        sorted.sort((a, b) => b.salesCount - a.salesCount);
        break;
      default:
        sorted.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
    }
    return sorted;
  }, [items, activeFilter, sortKey]);

  function selectFilter(id: string) {
    setActiveFilter(id);
    setFiltersOpen(false);
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
      {/* ===== Hero ===== */}
      <div className="mb-8 sm:mb-10">
        <span className="inline-flex items-center gap-2 rounded-full border border-[#E6E2D6] bg-white px-3 py-1 text-xs font-medium tracking-wide text-[#74806F]">
          <span className="h-1.5 w-1.5 rounded-full bg-[#0E6B4C]" />
          คอลเลกชันของเรา
        </span>
        <h1
          style={{ fontFamily: "var(--font-serif-thai)" }}
          className="mt-4 text-3xl font-bold leading-tight text-[#16241D] sm:text-4xl lg:text-5xl"
        >
          สินค้าทั้งหมด
        </h1>
        <p className="mt-2 max-w-xl text-sm text-[#74806F] sm:text-base">
          เลือกชมสินค้าคุณภาพที่เราคัดสรรมาเพื่อคุณ พบ{" "}
          <span className="font-semibold text-[#16241D]">{visible.length}</span>{" "}
          รายการ{activeLabel ? ` ในหมวด "${activeLabel}"` : ""}
        </p>
      </div>

      {items.length === 0 ? (
        <EmptyState
          title="ยังไม่มีสินค้าในขณะนี้"
          subtitle="กรุณากลับมาตรวจสอบอีกครั้งในภายหลัง"
        />
      ) : (
        <div className="lg:grid lg:grid-cols-[260px_1fr] lg:items-start lg:gap-8">
          <aside className="hidden lg:block">
            <FilterPanel
              categoryTree={categoryTree}
              activeFilter={activeFilter}
              onSelectFilter={selectFilter}
              sortKey={sortKey}
              onSelectSort={setSortKey}
            />
          </aside>

          <div>
            <div className="mb-5 flex items-center justify-between gap-3 lg:hidden">
              <button
                onClick={() => setFiltersOpen(true)}
                className="flex items-center gap-2 rounded-lg border border-[#E6E2D6] bg-white px-4 py-2 text-sm font-medium text-[#16241D] shadow-sm transition hover:border-[#0E6B4C] hover:text-[#0E6B4C]"
              >
                <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none">
                  <path
                    d="M3 5h14M6 10h8M9 15h2"
                    stroke="currentColor"
                    strokeWidth={1.8}
                    strokeLinecap="round"
                  />
                </svg>
                ตัวกรอง / เรียงลำดับ
                {activeFilter !== ALL_FILTER && (
                  <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#0E6B4C] text-[10px] font-bold text-white">
                    1
                  </span>
                )}
              </button>
            </div>

            {visible.length === 0 ? (
              <EmptyState
                title="ไม่พบสินค้าในหมวดหมู่นี้"
                subtitle="ลองเลือกหมวดหมู่อื่น หรือดูสินค้าทั้งหมด"
                action={
                  <button
                    onClick={() => setActiveFilter(ALL_FILTER)}
                    className="mt-4 rounded-lg bg-[#0E6B4C] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#0A4E38]"
                  >
                    ล้างตัวกรอง
                  </button>
                }
              />
            ) : (
              <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 xl:grid-cols-3">
                {visible.map((item) => (
                  <ProductCard
                    key={item.id}
                    item={item}
                    onQuickView={() => setQuickView(item)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {filtersOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="ตัวกรองและเรียงลำดับ"
          className="fixed inset-0 z-50 flex lg:hidden"
          onClick={() => setFiltersOpen(false)}
        >
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative flex h-full w-[85%] max-w-xs flex-col overflow-y-auto bg-[#FBFAF6] p-5 shadow-2xl"
          >
            <div className="mb-4 flex items-center justify-between">
              <p className="text-base font-bold text-[#16241D]">ตัวกรอง / เรียงลำดับ</p>
              <button
                onClick={() => setFiltersOpen(false)}
                aria-label="ปิดแผงตัวกรอง"
                className="flex h-8 w-8 items-center justify-center rounded-full text-[#74806F] transition hover:bg-[#F3F1E9] hover:text-[#16241D]"
              >
                <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none">
                  <path
                    d="m5 5 10 10M15 5 5 15"
                    stroke="currentColor"
                    strokeWidth={1.8}
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>
            <FilterPanel
              categoryTree={categoryTree}
              activeFilter={activeFilter}
              onSelectFilter={selectFilter}
              sortKey={sortKey}
              onSelectSort={setSortKey}
            />
          </div>
        </div>
      )}

      {quickView && (
        <QuickViewModal item={quickView} onClose={() => setQuickView(null)} />
      )}
    </div>
  );
}

function FilterPanel({
  categoryTree,
  activeFilter,
  onSelectFilter,
  sortKey,
  onSelectSort,
}: {
  categoryTree: CategoryNode[];
  activeFilter: string;
  onSelectFilter: (id: string) => void;
  sortKey: SortKey;
  onSelectSort: (k: SortKey) => void;
}) {
  // เปิดหมวดหลักที่กำลังถูกเลือก (หรือมีลูกที่ถูกเลือก) ไว้ล่วงหน้า
  const [expanded, setExpanded] = useState<Set<string>>(() => {
    const initial = new Set<string>();
    for (const parent of categoryTree) {
      if (
        parent.id === activeFilter ||
        parent.children.some((c) => c.id === activeFilter)
      ) {
        initial.add(parent.id);
      }
    }
    return initial;
  });

  function toggleExpanded(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <div className="space-y-7">
      {/* หมวดหมู่ */}
      <div>
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-[#74806F]">
          หมวดหมู่
        </p>
        <ul className="space-y-1">
          <SimpleRow
            label="ทั้งหมด"
            active={activeFilter === ALL_FILTER}
            onClick={() => onSelectFilter(ALL_FILTER)}
          />
          <SimpleRow
            label="สินค้าขายดี"
            active={activeFilter === BEST_SELLER_FILTER}
            onClick={() => onSelectFilter(BEST_SELLER_FILTER)}
            icon={
              <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none">
                <path
                  d="M10 2c1 2.5-1.5 3.5-1.5 6 0 1.4 1 2.5 2.5 2.5S13.5 9.4 13.5 8c1.5 1.5 2.5 3.5 2.5 5.5C16 16.5 13.3 18 10 18s-6-1.5-6-4.5c0-3 2-5 3.5-6.5C8 6 8 4 10 2Z"
                  stroke="currentColor"
                  strokeWidth={1.6}
                  strokeLinejoin="round"
                />
              </svg>
            }
            accent="#C2410C"
          />

          {categoryTree.length > 0 && (
            <li className="pt-2">
              <div className="h-px bg-[#E6E2D6]" />
            </li>
          )}

          {categoryTree.map((parent) => {
            const isOpen = expanded.has(parent.id);
            const hasChildren = parent.children.length > 0;
            return (
              <li key={parent.id} className="pt-1">
                <div className="flex items-center">
                  <button
                    onClick={() => onSelectFilter(parent.id)}
                    className={`flex flex-1 items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition ${
                      activeFilter === parent.id
                        ? "bg-[#0E6B4C] font-semibold text-white shadow-sm"
                        : "text-[#16241D] hover:bg-[#F3F1E9]"
                    }`}
                  >
                    {parent.name}
                  </button>
                  {hasChildren && (
                    <button
                      onClick={() => toggleExpanded(parent.id)}
                      aria-label={isOpen ? "ย่อหมวดย่อย" : "ขยายหมวดย่อย"}
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[#74806F] transition hover:bg-[#F3F1E9] hover:text-[#16241D]"
                    >
                      <svg
                        viewBox="0 0 20 20"
                        className={`h-4 w-4 transition-transform ${isOpen ? "rotate-90" : ""}`}
                        fill="none"
                      >
                        <path
                          d="M7 4l6 6-6 6"
                          stroke="currentColor"
                          strokeWidth={1.8}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>
                  )}
                </div>

                {hasChildren && isOpen && (
                  <ul className="mt-1 space-y-1 border-l border-[#E6E2D6] pl-3">
                    {parent.children.map((child) => (
                      <SimpleRow
                        key={child.id}
                        label={child.name}
                        active={activeFilter === child.id}
                        onClick={() => onSelectFilter(child.id)}
                        compact
                      />
                    ))}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      </div>

      {/* เรียงลำดับ */}
      <div>
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-[#74806F]">
          เรียงตาม
        </p>
        <ul className="space-y-1">
          {(Object.keys(SORT_LABEL) as SortKey[]).map((k) => (
            <li key={k}>
              <button
                onClick={() => onSelectSort(k)}
                className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition ${
                  sortKey === k
                    ? "bg-[#0E6B4C]/10 font-semibold text-[#0E6B4C]"
                    : "text-[#74806F] hover:bg-[#F3F1E9] hover:text-[#16241D]"
                }`}
              >
                <span
                  className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                    sortKey === k ? "bg-[#0E6B4C]" : "bg-transparent"
                  }`}
                />
                {SORT_LABEL[k]}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function SimpleRow({
  label,
  active,
  onClick,
  compact,
  icon,
  accent,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  compact?: boolean;
  icon?: React.ReactNode;
  accent?: string;
}) {
  return (
    <li>
      <button
        onClick={onClick}
        className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left transition ${
          compact ? "text-sm" : "text-sm"
        } ${
          active
            ? "font-semibold text-white shadow-sm"
            : "text-[#74806F] hover:bg-[#F3F1E9] hover:text-[#16241D]"
        }`}
        style={active ? { backgroundColor: accent ?? "#0E6B4C" } : undefined}
      >
        {icon && (
          <span style={{ color: active ? "#fff" : accent }}>{icon}</span>
        )}
        {label}
      </button>
    </li>
  );
}

function ProductCard({
  item,
  onQuickView,
}: {
  item: ExplorerItem;
  onQuickView: () => void;
}) {
  const fresh = isNew(item.createdAt);

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-[#E6E2D6] bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl">
      {/* ป้ายตราประทับ มุมซ้ายบน: ใหม่ / ขายดี (โชว์อย่างใดอย่างหนึ่ง ให้ความสำคัญกับ "ใหม่" ก่อน) */}
      {fresh ? (
        <div className="absolute left-3 top-3 z-10 flex h-11 w-11 flex-col items-center justify-center rounded-full border-2 border-dashed border-[#C9932E] bg-[#FBFAF6] text-[10px] font-bold leading-tight text-[#C9932E] shadow-sm">
          ใหม่
        </div>
      ) : item.isBestSeller ? (
        <div className="absolute left-3 top-3 z-10 flex items-center gap-1 rounded-full bg-[#C2410C] px-2.5 py-1 text-[10px] font-bold leading-tight text-white shadow-sm">
          <svg viewBox="0 0 20 20" className="h-3 w-3" fill="currentColor">
            <path d="M10 2c1 2.5-1.5 3.5-1.5 6 0 1.4 1 2.5 2.5 2.5S13.5 9.4 13.5 8c1.5 1.5 2.5 3.5 2.5 5.5C16 16.5 13.3 18 10 18s-6-1.5-6-4.5c0-3 2-5 3.5-6.5C8 6 8 4 10 2Z" />
          </svg>
          ขายดี
        </div>
      ) : null}

      <Link href={`/product/${item.slug}`} className="block">
        <div className="relative aspect-square overflow-hidden bg-[#F3F1E9]">
          {item.imageUrl ? (
            <Image
              src={item.imageUrl}
              alt={item.name}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover transition duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-[#A6AC9D]">
              ไม่มีรูปภาพ
            </div>
          )}

          <div className="absolute inset-x-0 bottom-0 translate-y-full bg-linear-to-t from-black/60 to-transparent p-3 transition duration-300 group-hover:translate-y-0 group-focus-within:translate-y-0">
            <button
              onClick={(e) => {
                e.preventDefault();
                onQuickView();
              }}
              className="w-full rounded-lg bg-white/95 py-2 text-xs font-semibold text-[#16241D] backdrop-blur transition hover:bg-white"
            >
              ดูตัวอย่างด่วน
            </button>
          </div>
        </div>

        <div className="space-y-1.5 p-4 sm:p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-[#0E6B4C]">
            {item.parentCategoryName
              ? `${item.parentCategoryName} • ${item.categoryName}`
              : item.categoryName}
          </p>

          <h2
            style={{ fontFamily: "var(--font-serif-thai)" }}
            className="line-clamp-2 min-h-[2.7em] text-base font-semibold text-[#16241D] sm:text-lg"
          >
            {item.name}
          </h2>

          <p className="text-xl font-bold text-[#0E6B4C] sm:text-2xl">
            {THB.format(item.price)}
          </p>

          <div className="flex items-center gap-1.5 pt-2 text-sm font-semibold text-[#16241D] transition group-hover:text-[#0E6B4C]">
            ดูรายละเอียด
            <svg
              viewBox="0 0 20 20"
              className="h-4 w-4 transition-transform group-hover:translate-x-1"
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
    </div>
  );
}

function QuickViewModal({
  item,
  onClose,
}: {
  item: ExplorerItem;
  onClose: () => void;
}) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`ดูตัวอย่างสินค้า ${item.name}`}
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="grid w-full max-w-2xl grid-cols-1 gap-0 overflow-hidden rounded-t-2xl bg-white shadow-2xl sm:grid-cols-2 sm:rounded-2xl"
      >
        <div className="relative aspect-square bg-[#F3F1E9] sm:aspect-auto">
          {item.imageUrl ? (
            <Image src={item.imageUrl} alt={item.name} fill className="object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-[#A6AC9D]">
              ไม่มีรูปภาพ
            </div>
          )}
        </div>

        <div className="flex flex-col p-6">
          <button
            onClick={onClose}
            aria-label="ปิดหน้าต่างตัวอย่าง"
            className="ml-auto flex h-8 w-8 items-center justify-center rounded-full text-[#74806F] transition hover:bg-[#F3F1E9] hover:text-[#16241D]"
          >
            <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none">
              <path
                d="m5 5 10 10M15 5 5 15"
                stroke="currentColor"
                strokeWidth={1.8}
                strokeLinecap="round"
              />
            </svg>
          </button>

          <p className="text-xs font-medium uppercase tracking-wide text-[#0E6B4C]">
            {item.parentCategoryName
              ? `${item.parentCategoryName} • ${item.categoryName}`
              : item.categoryName}
          </p>
          <h3
            style={{ fontFamily: "var(--font-serif-thai)" }}
            className="mt-1 text-xl font-bold text-[#16241D]"
          >
            {item.name}
          </h3>
          <p className="mt-3 text-2xl font-bold text-[#0E6B4C]">
            {THB.format(item.price)}
          </p>

          <div className="mt-auto flex flex-col gap-2 pt-6">
            <Link
              href={`/product/${item.slug}`}
              className="rounded-lg bg-[#0E6B4C] px-4 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-[#0A4E38]"
            >
              ดูรายละเอียดสินค้า
            </Link>
            <button
              onClick={onClose}
              className="rounded-lg border border-[#E6E2D6] px-4 py-2.5 text-sm font-medium text-[#74806F] transition hover:border-[#16241D] hover:text-[#16241D]"
            >
              ปิดหน้าต่างนี้
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function EmptyState({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-dashed border-[#E6E2D6] bg-white/60 px-6 py-16 text-center sm:py-20">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#F3F1E9] text-2xl">
        🛍️
      </div>
      <p className="mt-4 text-lg font-semibold text-[#16241D]">{title}</p>
      <p className="mt-1 text-sm text-[#74806F]">{subtitle}</p>
      {action}
    </div>
  );
}