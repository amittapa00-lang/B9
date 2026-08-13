import Link from "next/link";
import { auth, signOut } from "@/auth";
import { LogOut, UserCircle } from "lucide-react";

export default async function AdminNavbar() {
  const session = await auth();

  return (
    <header className="sticky top-0 z-50 flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6 shadow-sm">
      <Link href="/admin/dashboard">
        <h1 className="text-xl font-bold text-[#0B3D2E]">B-Long Admin</h1>
      </Link>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="font-semibold text-sm text-gray-900">{session?.user?.name}</p>
            <p className="text-xs text-gray-500">
              {session?.user?.role === "ADMIN" ? "ผู้ดูแลระบบ" : "ผู้ใช้งาน"}
            </p>
          </div>
          <UserCircle size={32} className="text-gray-400" />
        </div>

        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/login" });
          }}
        >
          <button 
            type="submit"
            className="flex items-center gap-2 text-sm font-medium text-red-600 hover:text-red-700 transition-colors"
          >
            <LogOut size={18} />
            <span>ออกจากระบบ</span>
          </button>
        </form>
      </div>
    </header>
  );
}