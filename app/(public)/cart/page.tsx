import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import CartItem, { CartSummary } from "@/components/cart/CartItem";
import { ShoppingBag, ArrowRight, Lock } from "lucide-react";

export default async function CartPage() {
  const session = await auth();

  // กรณีที่ยังไม่ได้เข้าสู่ระบบ
  if (!session?.user?.id) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-xl shadow-gray-100/55">
          <div className="p-8 sm:p-12 text-center">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
              <Lock className="h-8 w-8" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900">
              กรุณาเข้าสู่ระบบ
            </h1>
            <p className="mt-2 text-sm sm:text-base text-gray-500">
              คุณต้องเข้าสู่ระบบก่อนจึงจะสามารถดูและจัดการสินค้าในตะกร้าของคุณได้
            </p>
            <div className="mt-8">
              <Link
                href="/login"
                className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-8 py-4 text-base font-semibold text-white shadow-lg shadow-emerald-600/25 transition-all hover:bg-emerald-700 active:scale-[0.98]"
              >
                เข้าสู่ระบบ
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

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

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      {/* ส่วนหัวข้อหน้า */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-gray-900">
            ตะกร้าสินค้า
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            ตรวจสอบรายการสินค้าและดำเนินการชำระเงินของคุณ
          </p>
        </div>
      </div>

      {!cart || cart.items.length === 0 ? (
        /* กรณีตะกร้าว่างเปล่า */
        <div className="rounded-3xl border border-dashed border-gray-300 bg-gray-50/50 p-12 sm:p-20 text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
            <ShoppingBag className="h-10 w-10" />
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-gray-900">
            ตะกร้าสินค้าของคุณว่างเปล่า
          </h3>
          <p className="mt-2 text-sm text-gray-500 max-w-sm mx-auto">
            ดูเหมือนว่าคุณยังไม่ได้เพิ่มสินค้าใดๆ ลงในตะกร้า เริ่มช้อปปิ้งกันเลย!
          </p>
          <div className="mt-8">
            <Link
              href="/product"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-8 py-4 text-base font-semibold text-white shadow-lg shadow-emerald-600/25 transition-all hover:bg-emerald-700 active:scale-[0.98]"
            >
              เลือกซื้อสินค้าต่อ
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      ) : (
        /* กรณีมีสินค้าในตะกร้า (สลับให้สรุปยอดอยู่ก่อน) */
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 items-start">
          {/* สรุปยอดคำสั่งซื้อ (อยู่ก่อน: 4 คอลัมน์บนจอใหญ่) */}
          <div className="lg:col-span-4 lg:sticky lg:top-24 order-1 lg:order-1">
            <CartSummary
              items={cart.items.map((item) => ({
                id: item.id,
                quantity: item.quantity,
                price: item.product.price,
              }))}
            />
          </div>

          {/* รายการสินค้า (อยู่หลัง: 8 คอลัมน์บนจอใหญ่) */}
          <div className="space-y-4 lg:col-span-8 order-2 lg:order-2">
            {cart.items.map((item) => (
              <CartItem key={item.id} item={item} />
            ))}
          </div>
        </div>
      )}
    </main>
  );
}