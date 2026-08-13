"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function CartBadge() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    async function fetchCartCount() {
      try {
        const res = await fetch("/api/cart/count", {
          cache: "no-store",
        });

        if (!res.ok) return;

        const data = await res.json();
        setCount(data.count);
      } catch (error) {
        console.error("Failed to fetch cart count:", error);
      }
    }

    // ดึงข้อมูลครั้งแรกเมื่อ Mount
    fetchCartCount();

    const handleCartUpdated = () => {
      fetchCartCount();
    };

    window.addEventListener("cart-updated", handleCartUpdated);

    return () => {
      window.removeEventListener("cart-updated", handleCartUpdated);
    };
  }, []);

  return (
    <Link
      href="/cart"
      className="relative inline-flex items-center gap-2"
    >
      <span>🛒</span>
      <span>Cart</span>

      {count > 0 && (
        <span className="absolute -right-4 -top-3 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-xs font-bold text-white">
          {count}
        </span>
      )}
    </Link>
  );
}