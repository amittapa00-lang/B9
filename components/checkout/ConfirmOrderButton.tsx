"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ConfirmOrderButton() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  async function handleConfirmOrder() {
    if (loading) return;

    const confirmed = window.confirm(
      "ยืนยันการสั่งซื้อหรือไม่?"
    );

    if (!confirmed) {
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(
        "/api/orders",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
        }
      );

      const data = await res.json();

      if (!res.ok) {
        alert(
          data.message ||
            "ไม่สามารถสร้างคำสั่งซื้อได้"
        );

        return;
      }

      alert("สั่งซื้อสำเร็จ");

      router.push("/orders");

      router.refresh();
    } catch (error) {
      console.error(
        "Confirm Order Error:",
        error
      );

      alert(
        "เกิดข้อผิดพลาด ไม่สามารถสั่งซื้อได้"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleConfirmOrder}
      disabled={loading}
      className="mt-8 w-full rounded-xl bg-green-700 px-6 py-4 font-semibold text-white transition hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {loading
        ? "กำลังสั่งซื้อ..."
        : "Confirm Order"}
    </button>
  );
}