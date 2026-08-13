"use client";

import { useRouter } from "next/navigation";

export default function DeleteProductButton({
  id,
}: {
  id: string;
}) {
  const router = useRouter();

  async function handleDelete() {
    const ok = confirm("ลบสินค้านี้ใช่หรือไม่?");

    if (!ok) return;

    const res = await fetch(
      `/api/admin/products/${id}`,
      {
        method: "DELETE",
      }
    );

    if (!res.ok) {
      alert("ลบสินค้าไม่สำเร็จ");
      return;
    }

    router.refresh();
  }

  return (
    <button
      onClick={handleDelete}
      className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
    >
      ลบสินค้า
    </button>
  );
}