"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { AnimatePresence, motion } from "framer-motion";

import Logo from "@/components/common/Logo";
import LogoutButton from "@/components/auth/LogoutButton";

import CartBadge from "@/components/cart/CartBadge";

import {
  Package,
  User,
  LayoutDashboard,
} from "lucide-react";

const menus = [
  { name: "หน้าแรก", href: "/" },
  { name: "เกี่ยวกับเรา", href: "/company" },
  { name: "แบรนด์ของเรา", href: "/brands" },
  { name: "สินค้า", href: "/product" },
  { name: "ติดต่อเรา", href: "/contact" },
];

export default function Navbar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);

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
          {/* CartBadge แสดงผลตลอดเวลาทั้ง Desktop และ Mobile */}
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