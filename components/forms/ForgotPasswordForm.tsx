"use client";

import { useState } from "react";
import Link from "next/link";

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setLoading(true);

    const res = await fetch("/api/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    setLoading(false);

    if (res.ok) {
      setSent(true);
    } else {
      const data = await res.json();
      alert(data.message ?? "เกิดข้อผิดพลาด");
    }
  }

  if (sent) {
    return (
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-xl text-center">
        <h1 className="text-2xl font-bold text-[#0B3D2E]">ตรวจสอบอีเมลของคุณ</h1>
        <p className="mt-3 text-gray-500">
          ถ้าอีเมล <span className="font-medium">{email}</span> มีอยู่ในระบบ
          เราได้ส่งลิงก์สำหรับตั้งรหัสผ่านใหม่ไปให้แล้ว
        </p>
       <Link
  href="/login"
  className="mt-6 inline-block rounded-xl bg-[#0B3D2E] px-6 py-3 font-semibold"
  style={{ color: "#ffffff" }}
>
  กลับไปหน้าเข้าสู่ระบบ
</Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-xl">
      <h1 className="text-3xl font-bold text-[#0B3D2E]">ลืมรหัสผ่าน?</h1>

      <p className="mt-2 text-gray-500">
        กรอกอีเมลที่ใช้สมัคร เราจะส่งลิงก์สำหรับตั้งรหัสผ่านใหม่ให้คุณ
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        <div>
          <label className="block text-sm font-medium">Email</label>

          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 focus:border-[#0B3D2E] focus:outline-none"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-[#0B3D2E] py-3 font-semibold text-white transition hover:bg-[#14503d] disabled:opacity-50"
        >
          {loading ? "Sending..." : "ส่งลิงก์รีเซ็ตรหัสผ่าน"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-600">
        นึกรหัสผ่านออกแล้ว?{" "}
        <Link href="/login" className="font-semibold text-[#0B3D2E]">
          เข้าสู่ระบบ
        </Link>
      </p>
    </div>
  );
}