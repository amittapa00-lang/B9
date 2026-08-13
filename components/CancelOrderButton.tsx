"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { cancelOrder } from "@/app/actions/cancel-order";

export default function CancelOrderButton({ orderId }: { orderId: string }) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleConfirm() {
    setError(null);
    startTransition(async () => {
      const res = await cancelOrder(orderId);
      if (res.success) {
        setOpen(false);
        router.refresh();
      } else {
        setError(res.message);
      }
    });
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex-1 rounded-xl border border-red-600 px-6 py-4 text-center font-semibold text-red-600 transition hover:bg-red-50"
      >
        ยกเลิกคำสั่งซื้อ
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-lg">
            <h3 className="text-lg font-bold text-gray-900">
              ยืนยันการยกเลิกคำสั่งซื้อ
            </h3>

            <p className="mt-3 text-sm text-gray-600">
              เมื่อยกเลิกคำสั่งซื้อแล้ว{" "}
              <span className="font-semibold text-red-600">
                ทางร้านจะไม่คืนเงินที่ชำระมาให้ไม่ว่ากรณีใดก็ตาม
              </span>{" "}
              กรุณาตรวจสอบให้แน่ใจก่อนกดยืนยัน
            </p>

            {error && (
              <p className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-600">
                {error}
              </p>
            )}

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setOpen(false)}
                disabled={isPending}
                className="flex-1 rounded-xl border px-4 py-3 font-semibold text-gray-600 transition hover:bg-gray-50 disabled:opacity-50"
              >
                ปิด
              </button>

              <button
                onClick={handleConfirm}
                disabled={isPending}
                className="flex-1 rounded-xl bg-red-600 px-4 py-3 font-semibold text-white transition hover:bg-red-700 disabled:opacity-50"
              >
                {isPending ? "กำลังยกเลิก..." : "ยืนยันยกเลิก"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}