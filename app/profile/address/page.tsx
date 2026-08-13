import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Address } from "@prisma/client";
import Navbar from "@/components/layout/Navbar";
import DeleteAddressButton from "@/components/profile/DeleteAddressButton";
import { MapPin, Phone, Plus, Pencil, Star, PackageOpen } from "lucide-react";

export default async function AddressPage() {
  const session = await auth();

  if (!session?.user) return null;

  const addresses: Address[] = await prisma.address.findMany({
    where: {
      userId: session.user.id,
    },
    orderBy: [
      { isDefault: "desc" },
      { createdAt: "desc" },
    ],
  });

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-linear-to-b from-gray-50 to-white">
        <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
          {/* Header */}
          <div className="mb-8 flex flex-col gap-4 sm:mb-10 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-[#0B3D2E]/10 px-3 py-1 text-xs font-semibold text-[#0B3D2E]">
                <MapPin size={14} />
                จัดการที่อยู่
              </div>
              <h1 className="text-2xl font-extrabold tracking-tight text-gray-900 sm:text-3xl">
                ที่อยู่จัดส่งของฉัน
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                เลือกหรือแก้ไขที่อยู่ที่ใช้สำหรับจัดส่งสินค้า
              </p>
            </div>

           <Link
  href="/profile/address/new"
  className="group inline-flex items-center justify-center gap-2 rounded-2xl bg-[#0B3D2E] px-5 py-3.5 font-semibold shadow-lg shadow-[#0B3D2E]/20 transition-all hover:bg-[#0f4c38] hover:shadow-xl hover:shadow-[#0B3D2E]/30 active:scale-[0.97]"
>
  {/* บังคับให้ไอคอนเป็นสีขาวด้วย stroke-white */}
  <Plus
    size={18}
    className="transition-transform group-hover:rotate-90 stroke-white"
  />
  
  {/* บังคับให้ข้อความเป็นสีขาวด้วย text-white */}
  <span className="text-white">เพิ่มที่อยู่ใหม่</span>
</Link>
          </div>

          {/* รายการที่อยู่ */}
          {addresses.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-gray-300 bg-white/60 p-12 text-center sm:p-20">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#0B3D2E]/10">
                <PackageOpen size={28} className="text-[#0B3D2E]" />
              </div>
              <p className="font-medium text-gray-700">ยังไม่มีที่อยู่จัดส่ง</p>
              <p className="mt-1 text-sm text-gray-400">
                เพิ่มที่อยู่เพื่อความสะดวกในการสั่งซื้อครั้งถัดไป
              </p>
              <Link
                href="/profile/address/new"
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#0B3D2E] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0f4c38]"
              >
                <Plus size={16} />
                เพิ่มที่อยู่แรกของคุณ
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:gap-5 lg:grid-cols-2">
              {addresses.map((address) => (
                <div
                  key={address.id}
                  className={`group relative overflow-hidden rounded-3xl border bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg sm:p-6 ${
                    address.isDefault
                      ? "border-[#0B3D2E]/30 ring-1 ring-[#0B3D2E]/10"
                      : "border-gray-200"
                  }`}
                >
                  {/* แถบสีด้านบนสำหรับที่อยู่หลัก */}
                  {address.isDefault && (
                    <div className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-[#0B3D2E] to-[#1a6b4f]" />
                  )}

                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="truncate text-base font-bold text-gray-900 sm:text-lg">
                          {address.fullName}
                        </h2>
                        {address.isDefault && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-[#0B3D2E] px-2.5 py-1 text-[11px] font-semibold text-white">
                            <Star size={10} fill="white" />
                            ค่าเริ่มต้น
                          </span>
                        )}
                      </div>

                      <div className="mt-1.5 flex items-center gap-1.5 text-sm text-gray-500">
                        <Phone size={13} />
                        {address.phone}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex gap-2.5 rounded-2xl bg-gray-50 p-3.5 text-sm leading-relaxed text-gray-600 sm:text-[15px]">
                    <MapPin size={16} className="mt-0.5 shrink-0 text-gray-400" />
                    <p>
                      {address.address} ต.{address.subDistrict} อ.
                      {address.district} {address.province}{" "}
                      {address.postalCode}
                    </p>
                  </div>

                  <div className="mt-4 flex gap-2 border-t border-gray-100 pt-4">
                    <Link
                      href={`/profile/address/${address.id}`}
                      className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:border-[#0B3D2E]/30 hover:bg-[#0B3D2E]/5 hover:text-[#0B3D2E]"
                    >
                      <Pencil size={14} />
                      แก้ไข
                    </Link>
                    <DeleteAddressButton id={address.id} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}