"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";

interface Category {
  id: string;
  name: string;
}

interface Props {
  category: {
    id: string;
    name: string;
    parentId: string | null;
  };
  categories: Category[];
}

export default function EditCategoryForm({
  category,
  categories,
}: Props) {
  const router = useRouter();

  const [name, setName] = useState(category.name);
  const [parentId, setParentId] = useState(category.parentId ?? "");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const res = await fetch(`/api/admin/categories/${category.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        parentId: parentId || null, // ส่ง null หากไม่มี parentId
      }),
    });

    setLoading(false);

    if (!res.ok) {
      alert("แก้ไขหมวดหมู่ไม่สำเร็จ กรุณาลองใหม่อีกครั้ง");
      return;
    }

    router.push("/admin/categories");
    router.refresh();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 rounded-2xl bg-white p-8 shadow-sm border border-gray-100"
    >
      <div>
        <label className="font-medium text-gray-700">ชื่อหมวดหมู่</label>
        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-2 w-full rounded-xl border border-gray-200 p-3 outline-none focus:ring-2 focus:ring-[#0B3D2E]/20"
          placeholder="กรอกชื่อหมวดหมู่"
        />
      </div>

      <div>
        <label className="font-medium text-gray-700">หมวดหมู่หลัก (เลือกถ้ามี)</label>
        <select
          value={parentId}
          onChange={(e) => setParentId(e.target.value)}
          className="mt-2 w-full rounded-xl border border-gray-200 p-3 outline-none focus:ring-2 focus:ring-[#0B3D2E]/20"
        >
          <option value="">ไม่มี (เป็นหมวดหมู่หลัก)</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-4">
        {/* ปุ่มยกเลิก */}
        <Link
          href="/admin/categories"
          className="flex-1 text-center rounded-xl bg-gray-100 px-8 py-3 font-semibold text-gray-700 hover:bg-gray-200 transition-all"
        >
          ยกเลิก
        </Link>

        {/* ปุ่มบันทึก */}
        <button
          type="submit"
          disabled={loading}
          className="flex-1 rounded-xl bg-[#0B3D2E] px-8 py-3 font-semibold text-white hover:bg-[#082a20] transition-all disabled:opacity-50"
        >
          {loading ? "กำลังบันทึก..." : "บันทึกการแก้ไข"}
        </button>
      </div>
    </form>
  );
}