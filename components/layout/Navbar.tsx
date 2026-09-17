"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { AnimatePresence, motion } from "framer-motion";

import Logo from "@/components/common/Logo";
import LogoutButton from "@/components/auth/LogoutButton";
import CartBadge from "@/components/cart/CartBadge";

import {
  Package,
  User,
  LayoutDashboard,
  Search,
  ChevronRight,
  ChevronDown,
} from "lucide-react";

const menus = [
  { name: "หน้าแรก", href: "/" },
  { name: "เกี่ยวกับเรา", href: "/company" },
  { name: "แบรนด์ของเรา", href: "/brands" },
  { name: "สินค้า", href: "/product" },
  { name: "ติดต่อเรา", href: "/contact" },
];

interface CategoryChild {
  id: string;
  name: string;
  slug: string;
}

interface CategoryNode extends CategoryChild {
  children: CategoryChild[];
}

interface ProductItem {
  id: string;
  name: string;
  slug: string;
}

type ProductsMapType = Record<string, ProductItem[] | "loading">;

// ตัด array เป็นกลุ่ม ๆ ละ size ชิ้น สำหรับจัดคอลัมน์เมกะเมนู
function chunk<T>(arr: T[], size: number): T[][] {
  const result: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size));
  }
  return result;
}

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();

  const [open, setOpen] = useState(false); // เมนูมือถือ
  const [search, setSearch] = useState("");
  const [categories, setCategories] = useState<CategoryNode[]>([]);

  // ===== เมกะเมนู =====
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ===== หมวดหมู่ย่อยที่กำลังขยาย + สินค้าในหมวดนั้น =====
  const [expandedChildId, setExpandedChildId] = useState<string | null>(null);
  const [productsMap, setProductsMap] = useState<ProductsMapType>({});

  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) => setCategories(Array.isArray(data) ? data : []))
      .catch(() => setCategories([]));
  }, []);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!search.trim()) return;
    router.push(`/product?q=${encodeURIComponent(search.trim())}`);
  }

  function openMenu(id: string) {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setActiveCategoryId(id);
  }

  function scheduleClose() {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => {
      setActiveCategoryId(null);
      setExpandedChildId(null);
    }, 150);
  }

  // คลิกชื่อหมวดหมู่ย่อย -> โชว์ชื่อสินค้าในหมวดนั้น (ไม่เปลี่ยนหน้า)
  async function toggleChildProducts(
    e: React.MouseEvent,
    child: CategoryChild
  ) {
    e.preventDefault();

    if (expandedChildId === child.id) {
      setExpandedChildId(null);
      return;
    }

    setExpandedChildId(child.id);

    if (!productsMap[child.id]) {
      setProductsMap((prev: ProductsMapType) => ({
        ...prev,
        [child.id]: "loading",
      }));
      try {
        const res = await fetch(`/api/categories/${child.slug}/products`);
        const data = await res.json();
        setProductsMap((prev: ProductsMapType) => ({
          ...prev,
          [child.id]: Array.isArray(data) ? data : [],
        }));
      } catch {
        setProductsMap((prev: ProductsMapType) => ({
          ...prev,
          [child.id]: [],
        }));
      }
    }
  }

  const activeCategory = categories.find((c) => c.id === activeCategoryId);

  return (
    <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 md:h-20 lg:px-8">
        {/* Logo */}
        <Logo />

        {/* Desktop Menu */}
        <nav className="hidden items-center gap-8 lg:flex">
          {menus.map((menu) => {
            const active =
              menu.href === "/"
                ? pathname === "/"
                : pathname.startsWith(menu.href);

            return (
              <Link
                key={menu.name}
                href={menu.href}
                className={`relative text-sm font-medium transition ${
                  active
                    ? "text-[#0B3D2E]"
                    : "text-gray-600 hover:text-[#0B3D2E]"
                }`}
              >
                {menu.name}

                {active && (
                  <motion.span
                    layoutId="navbar-active"
                    className="absolute -bottom-1 left-0 h-0.5 w-full bg-[#0B3D2E]"
                    transition={{
                      type: "spring",
                      stiffness: 380,
                      damping: 30,
                    }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Desktop Right */}
        <div className="hidden items-center gap-6 lg:flex">
          <CartBadge />

          {session?.user ? (
            <>
              {session.user.role === "ADMIN" ? (
                <Link
                  href="/admin/dashboard"
                  className="flex items-center gap-2 rounded-full bg-amber-600 px-5 py-3 text-white hover:bg-amber-700"
                >
                  <LayoutDashboard size={18} />
                  แดชบอร์ดผู้ดูแลระบบ
                </Link>
              ) : (
                <>
                  <Link
                    href="/orders"
                    className="flex items-center gap-2 text-gray-700 hover:text-[#0B3D2E]"
                  >
                    <Package size={20} />
                    รายการสั่งซื้อ
                  </Link>

                  <Link
                    href="/profile"
                    className="flex items-center gap-2 text-gray-700 hover:text-[#0B3D2E]"
                  >
                    <User size={20} />
                    {session.user.name}
                  </Link>
                </>
              )}

              <LogoutButton />
            </>
          ) : (
            <>
              <Link
                href="/register"
                onClick={() => setOpen(false)}
                className="rounded-full bg-[#1e9a75] px-6 py-3 text-center font-semibold text-white! hover:bg-[#145941]"
              >
                สมัครสมาชิก
              </Link>

              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="rounded-full bg-emerald-600 px-6 py-3 text-center font-semibold text-white! hover:bg-emerald-700"
              >
                เข้าสู่ระบบ
              </Link>
            </>
          )}
        </div>

        {/* Mobile Right Controls */}
        <div className="flex items-center gap-4 lg:hidden">
          <CartBadge />

          <button
            onClick={() => setOpen(!open)}
            className="rounded-lg border p-2"
            aria-label="Toggle Menu"
          >
            ☰
          </button>
        </div>
      </div>

      {/* ===== แถวช่องค้นหา ===== */}
      <div className="border-t border-gray-100 bg-gray-50/60">
        <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
          <form onSubmit={handleSearch} className="mx-auto max-w-2xl">
            <div className="flex items-center overflow-hidden rounded-full border border-gray-200 bg-white shadow-sm transition focus-within:border-[#0B3D2E]">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="ค้นหาสินค้า..."
                className="w-full bg-transparent px-5 py-2.5 text-sm text-gray-700 outline-none placeholder:text-gray-400"
              />
              <button
                type="submit"
                className="flex h-full shrink-0 items-center justify-center bg-[#0B3D2E] px-5 py-2.5 text-white transition hover:bg-[#145941]"
                aria-label="ค้นหา"
              >
                <Search size={18} />
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* ===== แถวหมวดหมู่ + เมกะเมนู (Desktop) ===== */}
      {categories.length > 0 && (
        <div
          className="relative hidden border-t border-gray-100 bg-white lg:block"
          onMouseLeave={scheduleClose}
        >
          <div className="mx-auto flex max-w-7xl items-center gap-6 px-4 py-3 text-sm font-medium text-gray-700 sm:px-6 lg:px-8">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/product?category=${cat.slug}`}
                onMouseEnter={() => openMenu(cat.id)}
                className={`whitespace-nowrap transition ${
                  activeCategoryId === cat.id
                    ? "text-[#0B3D2E]"
                    : "hover:text-[#0B3D2E]"
                }`}
              >
                {cat.name}
              </Link>
            ))}
          </div>

          {/* ===== แผงเมกะเมนู ===== */}
          <AnimatePresence>
            {activeCategory && activeCategory.children.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.15 }}
                onMouseEnter={() => openMenu(activeCategory.id)}
                className="absolute left-0 top-full z-50 w-full border-t border-gray-100 bg-white shadow-xl"
              >
                <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                  <div className="grid grid-cols-2 gap-x-8 gap-y-6 sm:grid-cols-3 lg:grid-cols-4">
                    {chunk(activeCategory.children, 8).map((group, idx) => (
                      <div key={idx} className="flex flex-col gap-3">
                        {group.map((child) => {
                          const isExpanded = expandedChildId === child.id;
                          const products = productsMap[child.id];

                          return (
                            <div key={child.id} className="flex flex-col">
                              <button
                                onClick={(e) => toggleChildProducts(e, child)}
                                className="flex items-center justify-between gap-2 text-left text-sm text-gray-600 transition hover:text-[#0B3D2E]"
                              >
                                {child.name}
                                <ChevronDown
                                  size={14}
                                  className={`shrink-0 transition-transform ${
                                    isExpanded ? "rotate-180" : ""
                                  }`}
                                />
                              </button>

                              {isExpanded && (
                                <div className="mt-1.5 flex flex-col gap-1 border-l-2 border-[#0B3D2E]/20 py-1 pl-3">
                                  {products === "loading" && (
                                    <span className="text-xs text-gray-400">
                                      กำลังโหลด...
                                    </span>
                                  )}

                                  {Array.isArray(products) &&
                                    products.length === 0 && (
                                      <span className="text-xs text-gray-400">
                                        ยังไม่มีสินค้าในหมวดนี้
                                      </span>
                                    )}

                                  {Array.isArray(products) &&
                                    products.map((p) => (
                                      <Link
                                        key={p.id}
                                        href={`/product/${p.slug}`}
                                        onClick={() => {
                                          setActiveCategoryId(null);
                                          setExpandedChildId(null);
                                        }}
                                        className="text-xs text-gray-500 transition hover:text-[#0B3D2E]"
                                      >
                                        {p.name}
                                      </Link>
                                    ))}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ))}
                  </div>

                  <Link
                    href={`/product?category=${activeCategory.slug}`}
                    onClick={() => {
                      setActiveCategoryId(null);
                      setExpandedChildId(null);
                    }}
                    className="mt-6 inline-flex items-center gap-1 text-sm font-semibold text-[#0B3D2E] hover:underline"
                  >
                    ดูสินค้าทั้งหมดใน &quot;{activeCategory.name}&quot;
                    <ChevronRight size={14} />
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* ===== เมนูมือถือ ===== */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t bg-white lg:hidden"
          >
            <div className="flex flex-col p-4">
              {menus.map((menu) => (
                <Link
                  key={menu.name}
                  href={menu.href}
                  onClick={() => setOpen(false)}
                  className={`rounded-lg px-4 py-3 ${
                    pathname.startsWith(menu.href)
                      ? "bg-green-50 text-[#0B3D2E]"
                      : "hover:bg-gray-100"
                  }`}
                >
                  {menu.name}
                </Link>
              ))}

              {categories.length > 0 && (
                <div className="mt-2 border-t pt-2">
                  <p className="px-4 py-2 text-xs font-semibold uppercase text-gray-400">
                    หมวดหมู่สินค้า
                  </p>
                  {categories.map((cat) => (
                    <details key={cat.id} className="px-2">
                      <summary className="cursor-pointer list-none rounded-lg px-2 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100">
                        {cat.name}
                      </summary>
                      <div className="flex flex-col gap-1 py-1 pl-4">
                        <Link
                          href={`/product?category=${cat.slug}`}
                          onClick={() => setOpen(false)}
                          className="rounded-lg px-3 py-1.5 text-sm text-[#0B3D2E]"
                        >
                          ดูทั้งหมด
                        </Link>

                        {cat.children.map((child) => {
                          const isExpanded = expandedChildId === child.id;
                          const products = productsMap[child.id];

                          return (
                            <div key={child.id} className="flex flex-col">
                              <button
                                onClick={(e) => toggleChildProducts(e, child)}
                                className="flex items-center justify-between gap-2 rounded-lg px-3 py-1.5 text-left text-sm text-gray-600"
                              >
                                {child.name}
                                <ChevronDown
                                  size={14}
                                  className={`shrink-0 transition-transform ${
                                    isExpanded ? "rotate-180" : ""
                                  }`}
                                />
                              </button>

                              {isExpanded && (
                                <div className="ml-4 flex flex-col gap-1 border-l-2 border-[#0B3D2E]/20 py-1 pl-3">
                                  {products === "loading" && (
                                    <span className="text-xs text-gray-400">
                                      กำลังโหลด...
                                    </span>
                                  )}

                                  {Array.isArray(products) &&
                                    products.length === 0 && (
                                      <span className="text-xs text-gray-400">
                                        ยังไม่มีสินค้าในหมวดนี้
                                      </span>
                                    )}

                                  {Array.isArray(products) &&
                                    products.map((p) => (
                                      <Link
                                        key={p.id}
                                        href={`/product/${p.slug}`}
                                        onClick={() => {
                                          setOpen(false);
                                          setExpandedChildId(null);
                                        }}
                                        className="text-xs text-gray-500"
                                      >
                                        {p.name}
                                      </Link>
                                    ))}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </details>
                  ))}
                </div>
              )}

              <div className="mt-4 border-t pt-4">
                {session?.user ? (
                  <div className="flex flex-col gap-2">
                    {session.user.role === "ADMIN" ? (
                      <Link
                        href="/admin/dashboard"
                        onClick={() => setOpen(false)}
                        className="rounded-lg bg-[#0B3D2E] px-4 py-3 text-center text-white"
                      >
                        แดชบอร์ดผู้ดูแลระบบ
                      </Link>
                    ) : (
                      <>
                        <Link
                          href="/orders"
                          onClick={() => setOpen(false)}
                          className="rounded-lg px-4 py-3 hover:bg-gray-100"
                        >
                          📦 รายการสั่งซื้อ
                        </Link>

                        <Link
                          href="/profile"
                          onClick={() => setOpen(false)}
                          className="rounded-lg px-4 py-3 hover:bg-gray-100"
                        >
                          👤 {session.user.name}
                        </Link>
                      </>
                    )}

                    <LogoutButton />
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    <Link
                      href="/register"
                      onClick={() => setOpen(false)}
                      className="rounded-full bg-[#1e9a75] px-6 py-3 text-center font-semibold text-white hover:bg-[#145941]"
                    >
                      สมัครสมาชิก
                    </Link>

                    <Link
                      href="/login"
                      onClick={() => setOpen(false)}
                      className="rounded-full bg-[#0B3D2E] px-6 py-3 text-center font-semibold text-white hover:bg-[#145941]"
                    >
                      เข้าสู่ระบบ
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}