"use client";

import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";

export default function DeleteCategoryButton({
  id,
}: {
  id: string;
}) {
  const router = useRouter();

  async function handleDelete() {
    // ปรับข้อความยืนยันเป็นภาษาไทย
    if (
      !confirm("คุณต้องการลบหมวดหมู่นี้ใช่หรือไม่?")
    ) {
      return;
    }

    const res = await fetch(
      `/api/admin/categories/${id}`,
      {
        method: "DELETE",
      }
    );

    if (!res.ok) {
      // ปรับข้อความแจ้งเตือนเมื่อเกิดข้อผิดพลาด
      alert("ลบหมวดหมู่ไม่สำเร็จ");
      return;
    }

    router.refresh();
  }

  return (
    <button
      onClick={handleDelete}
      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
      title="ลบหมวดหมู่"
    >
      <Trash2 size={18} />
    </button>
  );
}