"use client";

import { useRouter } from "next/navigation";

interface Props {
  id: string;
}

export default function DeleteAddressButton({
  id,
}: Props) {
  const router = useRouter();

  async function handleDelete() {
    const confirmDelete = window.confirm(
      "ลบที่อยู่นี้ใช่หรือไม่?"
    );

    if (!confirmDelete) return;

    const res = await fetch(
      `/api/address/${id}`,
      {
        method: "DELETE",
      }
    );

    if (!res.ok) {
      alert("ลบไม่สำเร็จ");
      return;
    }

    router.refresh();
  }

  return (
    <button
      onClick={handleDelete}
      className="rounded-lg border border-red-500 px-4 py-2 text-red-500 transition hover:bg-red-50"
    >
      Delete
    </button>
  );
}