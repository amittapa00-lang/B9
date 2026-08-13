import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import EditAddressForm from "@/components/profile/EditAddressForm";
import Navbar from "@/components/layout/Navbar";
import { ArrowLeft, MapPin } from "lucide-react";
import Link from "next/link";

interface Props {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditAddressPage({ params }: Props) {
  const session = await auth();

  if (!session?.user) {
    return notFound();
  }

  const { id } = await params;

  const address = await prisma.address.findFirst({
    where: {
      id,
      userId: session.user.id,
    },
  });

  if (!address) {
    return notFound();
  }

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-linear-to-b from-gray-50 to-white">
        <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
          {/* Header */}
          <Link
            href="/profile/address"
            className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 transition hover:text-[#0B3D2E]"
          >
            <ArrowLeft size={16} />
            กลับ
          </Link>

          <div className="mb-6 sm:mb-8">
            <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-[#0B3D2E]/10 px-3 py-1 text-xs font-semibold text-[#0B3D2E]">
              <MapPin size={14} />
              ที่อยู่จัดส่ง
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-gray-900 sm:text-3xl">
              แก้ไขที่อยู่
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              ปรับปรุงรายละเอียดที่อยู่จัดส่งของคุณ
            </p>
          </div>

          <EditAddressForm address={address} />
        </div>
      </div>
    </>
  );
}