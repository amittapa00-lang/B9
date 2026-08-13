"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  productId: string;
}

export default function AddToCartButton({ productId }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function addToCart() {
    setLoading(true);

    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message ?? "Add to cart failed");
        return;
      }

      // ยิง Event แจ้งเตือนอัปเดตตะกร้าสินค้าก่อนเปลี่ยนหน้าหรือรีเฟรช
      window.dispatchEvent(new Event("cart-updated"));

      router.refresh();
      router.push("/cart");
    } catch (error) {
      console.error(error);
      alert("เกิดข้อผิดพลาด");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      disabled={loading}
      onClick={addToCart}
      className="rounded-xl bg-green-700 px-8 py-4 font-semibold text-white transition hover:bg-green-800 disabled:opacity-50"
    >
      {loading ? "Adding..." : "Add to Cart"}
    </button>
  );
}