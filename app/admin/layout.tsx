import AdminNavbar from "@/components/admin/AdminNavbar";
import AdminSidebar from "@/components/admin/AdminSidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-100">

      <AdminNavbar />

      <div className="flex">

        <AdminSidebar />

        <main className="flex-1 p-8">
          {children}
        </main>

      </div>

    </div>
  );
}