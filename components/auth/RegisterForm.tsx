"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function RegisterForm() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    setLoading(true);

    const res = await fetch("/api/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        email,
        password,
      }),
    });

    const data = await res.json();

    setLoading(false);

    if (!res.ok) {
      alert(data.message);
      return;
    }

    alert("สมัครสมาชิกสำเร็จ");

    router.push("/login");
  }

  return (
    <div className="w-full max-w-md rounded-3xl bg-white shadow-xl p-8">
      <h1 className="text-3xl font-bold text-[#0B3D2E]">
        สร้างบัญชีผู้ใช้
      </h1>

      <p className="mt-2 text-gray-500">
        เข้าร่วมกับ B-Long Trading
      </p>

      <form
        onSubmit={handleSubmit}
        className="mt-8 space-y-5"
      >
        <div>
          <label>ชื่อ-นามสกุล</label>

          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-2 w-full rounded-xl border px-4 py-3"
            required
          />
        </div>

        <div>
          <label>อีเมล</label>

          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-2 w-full rounded-xl border px-4 py-3"
            required
          />
        </div>

        <div>
          <label>รหัสผ่าน</label>

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-2 w-full rounded-xl border px-4 py-3"
            required
          />
        </div>

        <button
          disabled={loading}
          className="w-full rounded-xl bg-[#0B3D2E] py-3 text-white"
        >
          {loading ? "กำลังสร้างบัญชี..." : "สร้างบัญชี"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm">
        มีบัญชีอยู่แล้ว?{" "}
        <Link
          href="/login"
          className="font-semibold text-[#0B3D2E]"
        >
          เข้าสู่ระบบ
        </Link>
      </p>
    </div>
  );
}