import Link from "next/link";
import { 
  LayoutDashboard, 
  Package, 
  Tags, 
  ShoppingCart, 
  Users, 
  ArrowLeft 
} from "lucide-react";

export default function AdminSidebar() {
  const menuItems = [
    { name: "แดชบอร์ด", href: "/admin/dashboard", icon: <LayoutDashboard size={20} /> },
    { name: "สินค้า", href: "/admin/products", icon: <Package size={20} /> },
    { name: "หมวดหมู่", href: "/admin/categories", icon: <Tags size={20} /> },
    { name: "รายการสั่งซื้อ", href: "/admin/orders", icon: <ShoppingCart size={20} /> },
    { name: "ผู้ใช้งาน", href: "/admin/users", icon: <Users size={20} /> },
  ];

  return (
    <aside className="w-64 min-h-screen border-r bg-[#0B3D2E] text-white">
      <div className="p-6">
        <h2 className="text-xl font-bold tracking-wider">เมนูจัดการ</h2>
      </div>

      <nav className="space-y-1 px-3">
        {menuItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center gap-3 rounded-lg px-4 py-3 hover:bg-white/10 transition-colors"
          >
            {item.icon}
            <span className="font-medium">{item.name}</span>
          </Link>
        ))}

        <div className="pt-6 mt-6 border-t border-white/10">
          <Link
            href="/"
            className="flex items-center gap-3 rounded-lg px-4 py-3 text-white/70 hover:text-white hover:bg-white/10 transition-colors"
          >
            <ArrowLeft size={20} />
            <span className="font-medium">กลับหน้าเว็บไซต์</span>
          </Link>
        </div>
      </nav>
    </aside>
  );
}