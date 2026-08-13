import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Plus, Edit2, Folder, Tag, ChevronRight } from "lucide-react";
import DeleteCategoryButton from "@/components/admin/categories/DeleteCategoryButton";

export default async function CategoriesPage() {
  const allCategories = await prisma.category.findMany({
    orderBy: { sortOrder: "asc" },
  });

  const parents = allCategories.filter((c) => !c.parentId);
  const children = allCategories.filter((c) => c.parentId);

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">
      {/* ส่วนหัวหน้าเพจ */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">จัดการหมวดหมู่สินค้า</h1>
          <p className="text-gray-500 mt-1">จัดระเบียบโครงสร้างสินค้าของคุณให้เป็นระบบ</p>
        </div>
        <Link
          href="/admin/categories/new"
          className="flex items-center gap-2 bg-[#0B3D2E] text-white px-6 py-3 rounded-xl font-medium hover:bg-[#082a20] transition-all shadow-lg shadow-[#0B3D2E]/20"
        >
          <Plus size={20} className="text-white" /> 
          <span className="text-white">เพิ่มหมวดหมู่</span>
        </Link>
      </div>

      {/* Grid แสดงหมวดหมู่ */}
      <div className="grid gap-6">
        {parents.map((parent) => (
          <div 
            key={parent.id} 
            className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
          >
            {/* หัวข้อหมวดหมู่หลัก */}
            <div className="bg-gray-50/50 px-6 py-5 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#0B3D2E]/10 text-[#0B3D2E] rounded-lg">
                  <Folder size={20} />
                </div>
                <h2 className="font-bold text-lg text-gray-800">{parent.name}</h2>
              </div>
              
              <div className="flex items-center gap-2">
                <Link 
                  href={`/admin/categories/${parent.id}`}
                  className="text-gray-400 hover:text-[#0B3D2E] transition-colors p-2"
                >
                  <Edit2 size={18} />
                </Link>
                
                <DeleteCategoryButton id={parent.id} />
              </div>
            </div>

            {/* รายการหมวดหมู่ย่อย */}
            <div className="divide-y divide-gray-50">
              {children.filter((child) => child.parentId === parent.id).length > 0 ? (
                children
                  .filter((child) => child.parentId === parent.id)
                  .map((child) => (
                    <div 
                      key={child.id} 
                      className="px-6 py-4 flex items-center justify-between hover:bg-gray-50/80 transition-colors"
                    >
                      <div className="flex items-center gap-3 text-gray-600">
                        <ChevronRight size={16} className="text-gray-300" />
                        <Tag size={16} />
                        <span className="font-medium">{child.name}</span>
                      </div>
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link href={`/admin/categories/${child.id}`} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg">
                          <Edit2 size={16} />
                        </Link>
                        
                        <DeleteCategoryButton id={child.id} />
                      </div>
                    </div>
                  ))
              ) : (
                <div className="px-6 py-6 text-sm text-gray-400 italic">
                  ยังไม่มีหมวดหมู่ย่อยในหมวดหมู่นี้
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}