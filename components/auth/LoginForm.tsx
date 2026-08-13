"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn, useSession } from "next-auth/react";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const { update } = useSession();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setLoading(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setLoading(false);
      alert("Email หรือ Password ไม่ถูกต้อง");
      return;
    }

    // โหลด Session ใหม่
    await update();

    // ดึง Session ล่าสุด
    const res = await fetch("/api/auth/session");
    const session = await res.json();

    setLoading(false);

    if (session?.user?.role === "ADMIN") {
      router.replace("/admin/dashboard");
    } else {
      router.replace("/");
    }
  }

  return (
    <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-xl">
      <h1 className="text-3xl font-bold text-[#0B3D2E]">Welcome Back</h1>

      <p className="mt-2 text-gray-500">Login to B-Long Trading</p>

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

        <div>
          <div className="flex items-center justify-between">
            <label className="block text-sm font-medium">Password</label>

            <Link
              href="/forgot-password"
              className="text-sm font-medium text-[#0B3D2E] hover:underline"
            >
              ลืมรหัสผ่าน?
            </Link>
          </div>

          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 focus:border-[#0B3D2E] focus:outline-none"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-[#0B3D2E] py-3 font-semibold text-white transition hover:bg-[#14503d] disabled:opacity-50"
        >
          {loading ? "Signing In..." : "Login"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-600">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="font-semibold text-[#0B3D2E]">
          Register
        </Link>
      </p>
    </div>
  );
}