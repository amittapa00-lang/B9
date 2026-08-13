import Link from "next/link";
import { Fraunces, Inter } from "next/font/google";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import Navbar from "@/components/layout/Navbar";

// Display serif for identity / headings, quiet grotesque for body & data.
const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-display",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-body",
});

export default async function ProfilePage() {
  const session = await auth();

  if (!session?.user) return null;

  const user = await prisma.user.findUnique({
    where: {
      id: session.user.id,
    },
  });

  const initial = (user?.name?.trim()?.[0] ?? user?.email?.[0] ?? "?").toUpperCase();

  return (
    <>
      <Navbar />

      <div
        className={`${fraunces.variable} ${inter.variable} min-h-screen`}
        style={{ background: "#F6F3EC", fontFamily: "var(--font-body)" }}
      >
        <div className="mx-auto max-w-3xl px-6 py-14 md:px-10">
          {/* ---------- Identity header ---------- */}
          <div className="mb-10 flex items-center gap-5">
            <div
              className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full text-2xl"
              style={{
                background: "#0B3D2E",
                color: "#F6F3EC",
                fontFamily: "var(--font-display)",
                boxShadow: "0 0 0 3px #F6F3EC, 0 0 0 4px #C9A24B",
              }}
            >
              {initial}
            </div>

            <div>
              <h1
                className="text-3xl leading-tight text-[#12201A]"
                style={{ fontFamily: "var(--font-display)", fontWeight: 500 }}
              >
                {user?.name || "บัญชีของฉัน"}
              </h1>
              <p className="mt-1 text-sm tracking-wide text-[#6B7A72]">
                {user?.email}
              </p>
            </div>
          </div>

          {/* ---------- Details card ---------- */}
          <div
            className="rounded-[28px] bg-white px-8 py-9 md:px-10"
            style={{ boxShadow: "0 1px 2px rgba(18,32,26,0.04), 0 12px 32px -16px rgba(18,32,26,0.18)" }}
          >
            <p className="mb-8 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#B8934A]">
              ข้อมูลส่วนตัว
            </p>

            <div className="grid gap-8 md:grid-cols-2">
              <div>
                <label
                  htmlFor="name"
                  className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#6B7A72]"
                >
                  ชื่อ
                </label>
                <input
                  id="name"
                  defaultValue={user?.name ?? ""}
                  placeholder="ยังไม่ได้ระบุชื่อ"
                  className="mt-3 w-full border-0 border-b border-[#E2DED2] bg-transparent pb-2 text-base text-[#12201A] outline-none transition focus:border-[#0B3D2E]"
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#6B7A72]"
                >
                  อีเมล
                </label>
                <input
                  id="email"
                  defaultValue={user?.email ?? ""}
                  readOnly
                  className="mt-3 w-full cursor-not-allowed border-0 border-b border-[#E2DED2] bg-transparent pb-2 text-base text-[#9AA39C] outline-none"
                />
              </div>
            </div>

            <div className="mt-9 flex justify-end">
              <button
                type="button"
                className="rounded-full px-6 py-2.5 text-sm font-medium text-white transition hover:bg-[#0E4A38]"
                style={{ background: "#0B3D2E" }}
              >
                บันทึกการเปลี่ยนแปลง
              </button>
            </div>
          </div>

          {/* ---------- Perforated divider ---------- */}
          <div className="relative my-8 flex items-center">
            <div className="absolute left-1/2 h-7 w-7 -translate-x-1/2 rounded-full bg-[#F6F3EC]" />
            <div className="h-px w-full border-t border-dashed border-[#D8D2C2]" />
          </div>

          {/* ---------- Shipping address stub ---------- */}
          <Link
            href="/profile/address"
            className="group flex items-center justify-between rounded-[28px] bg-white px-8 py-7 transition hover:bg-[#FBFAF6] md:px-10"
            style={{ boxShadow: "0 1px 2px rgba(18,32,26,0.04), 0 12px 32px -16px rgba(18,32,26,0.18)" }}
          >
            <div className="flex items-center gap-5">
              <div
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full"
                style={{ background: "#EFE9D8", color: "#B8934A" }}
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                >
                  <path d="M3 11.5 12 4l9 7.5" />
                  <path d="M5 10v9a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1v-9" />
                </svg>
              </div>
              <div>
                <p
                  className="text-lg text-[#12201A]"
                  style={{ fontFamily: "var(--font-display)", fontWeight: 500 }}
                >
                  ที่อยู่จัดส่ง
                </p>
                <p className="mt-0.5 text-sm text-[#6B7A72]">
                  เพิ่มหรือแก้ไขที่อยู่สำหรับการจัดส่งสินค้า
                </p>
              </div>
            </div>

            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#0B3D2E"
              strokeWidth="1.8"
              className="shrink-0 transition group-hover:translate-x-1"
            >
              <path d="M9 6l6 6-6 6" />
            </svg>
          </Link>
        </div>
      </div>
    </>
  );
}