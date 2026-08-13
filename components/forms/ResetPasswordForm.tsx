"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ResetPasswordForm({ token }: { token?: string }) {
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  if (!token) {
    return (
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-xl text-center">
        <h1 className="text-2xl font-bold text-[#0B3D2E]">ลิงก์ไม่ถูกต้อง</h1>
        <p className="mt-3 text-gray-500">ไม่พบ Token สำหรับรีเซ็ตรหัสผ่าน</p>
        <Link
          href="/forgot-password"
          className="mt-6 inline-block rounded-xl bg-[#0B3D2E] px-6 py-3 text-white font-semibold"
        >
          ขอลิงก์ใหม่
        </Link>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert("รหัสผ่านไม่ตรงกัน");
      return;
    }

    setLoading(true);

    const res = await fetch("/api/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });

    const data = await res.json();

    setLoading(false);

    if (!res.ok) {
      alert(data.message);
      return;
    }

    alert("ตั้งรหัสผ่านใหม่สำเร็จ กรุณาเข้าสู่ระบบ");
    router.push("/login");
  }

  return (
    <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-xl">
      <h1 className="text-3xl font-bold text-[#0B3D2E]">ตั้งรหัสผ่านใหม่</h1>

      <p className="mt-2 text-gray-500">กรอกรหัสผ่านใหม่ของคุณ</p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        <div>
          <label className="block text-sm font-medium">รหัสผ่านใหม่</label>

          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 focus:border-[#0B3D2E] focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">ยืนยันรหัสผ่านใหม่</label>

          <input
            type="password"
            required
            minLength={6}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 focus:border-[#0B3D2E] focus:outline-none"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-[#0B3D2E] py-3 font-semibold text-white transition hover:bg-[#14503d] disabled:opacity-50"
        >
          {loading ? "Saving..." : "บันทึกรหัสผ่านใหม่"}
        </button>
      </form>
    </div>
  );
}