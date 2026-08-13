import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import CheckoutClient from "@/components/checkout/CheckoutClient";

export default async function CheckoutPage() {
  // ตรวจสอบ Login
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  // ดึง Cart ของ User
  const cart = await prisma.cart.findUnique({
    where: {
      userId: session.user.id,
    },
    include: {
      items: {
        include: {
          product: {
            include: {
              images: {
                orderBy: {
                  sortOrder: "asc",
                },
              },
            },
          },
        },
      },
    },
  });

  // ถ้าไม่มี Cart หรือไม่มีสินค้า
  if (!cart || cart.items.length === 0) {
    return (
      <main className="min-h-screen bg-gray-50 px-6 py-16">
        <div className="mx-auto max-w-5xl">
          <div className="rounded-2xl bg-white p-16 text-center shadow-sm">
            <h1 className="text-3xl font-bold text-gray-900">
              ตะกร้าสินค้าว่างเปล่า
            </h1>

            <p className="mt-3 text-gray-500">
              ไม่มีสินค้าในตะกร้าของคุณ
            </p>

            <Link
              href="/product"
              className="mt-8 inline-block rounded-xl bg-green-700 px-8 py-4 font-semibold text-white transition hover:bg-green-800"
            >
              เลือกซื้อสินค้า
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <CheckoutClient
      items={cart.items}
    />
  );
}