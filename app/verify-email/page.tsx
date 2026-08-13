import Link from "next/link";

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;

  const content = {
    success: {
      title: "ยืนยันอีเมลสำเร็จ 🎉",
      desc: "บัญชีของคุณพร้อมใช้งานแล้ว สามารถเข้าสู่ระบบได้เลย",
    },
    expired: {
      title: "ลิงก์หมดอายุ",
      desc: "ลิงก์ยืนยันอีเมลหมดอายุแล้ว กรุณาสมัครสมาชิกใหม่ หรือขอลิงก์ยืนยันอีกครั้ง",
    },
    invalid: {
      title: "ลิงก์ไม่ถูกต้อง",
      desc: "ไม่พบข้อมูลการยืนยันนี้ในระบบ",
    },
    missing: {
      title: "ไม่พบ Token",
      desc: "ลิงก์นี้ไม่สมบูรณ์",
    },
  }[status ?? "invalid"] ?? {
    title: "เกิดข้อผิดพลาด",
    desc: "ไม่สามารถยืนยันอีเมลได้",
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md rounded-3xl bg-white shadow-xl p-8 text-center">
        <h1 className="text-2xl font-bold text-[#0B3D2E]">
          {content.title}
        </h1>

        <p className="mt-3 text-gray-500">{content.desc}</p>

        <Link
          href="/login"
          className="mt-6 inline-block rounded-xl bg-[#0B3D2E] px-6 py-3 text-white font-semibold"
        >
          ไปหน้าเข้าสู่ระบบ
        </Link>
      </div>
    </div>
  );
}