import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

interface Props {
  searchParams: Promise<{
    status?: string;
  }>;
}

// ค่าจัดส่งคงที่
const SHIPPING_FEE = 50;

const STATUS_MAP: Record<
  string,
  { label: string; badge: string; icon: string }
> = {
  PENDING: {
    label: "รอตรวจสอบ",
    badge: "bg-yellow-100 text-yellow-700",
    icon: "⏳",
  },
  CONFIRMED: {
    label: "ชำระเงินสำเร็จ",
    badge: "bg-blue-100 text-blue-700",
    icon: "✓",
  },
  PROCESSING: {
    label: "เตรียมสินค้า",
    badge: "bg-purple-100 text-purple-700",
    icon: "📦",
  },
  SHIPPED: {
    label: "กำลังจัดส่ง",
    badge: "bg-indigo-100 text-indigo-700",
    icon: "🚚",
  },
  COMPLETED: {
    label: "จัดส่งสำเร็จ",
    badge: "bg-green-100 text-green-700",
    icon: "✓",
  },
  CANCELLED: {
    label: "ยกเลิก",
    badge: "bg-red-100 text-red-700",
    icon: "✕",
  },
};

function getStatus(status: string) {
  return (
    STATUS_MAP[status] ?? {
      label: status,
      badge: "bg-gray-100 text-gray-700",
      icon: "•",
    }
  );
}

const FILTERS = [
  { value: "ALL", label: "ทั้งหมด", active: "bg-green-700 text-white" },
  { value: "PENDING", label: "รอตรวจสอบ", active: "bg-yellow-500 text-white" },
  { value: "CONFIRMED", label: "ชำระเงินสำเร็จ", active: "bg-blue-600 text-white" },
  { value: "PROCESSING", label: "เตรียมสินค้า", active: "bg-purple-600 text-white" },
  { value: "SHIPPED", label: "กำลังจัดส่ง", active: "bg-indigo-600 text-white" },
  { value: "COMPLETED", label: "จัดส่งสำเร็จ", active: "bg-green-600 text-white" },
];

export default async function MyOrdersPage({ searchParams }: Props) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const params = await searchParams;
  const activeStatus = params.status ?? "ALL";

  const orders = await prisma.order.findMany({
    where: { userId: session.user.id },
    include: {
      address: true,
      items: { include: { product: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const filteredOrders =
    activeStatus !== "ALL"
      ? orders.filter((order) => order.status === activeStatus)
      : orders;

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              รายการสั่งซื้อของฉัน
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              {filteredOrders.length} คำสั่งซื้อ
            </p>
          </div>
        </div>

        {/* Status Filter */}
        <div className="mb-6 flex gap-2 overflow-x-auto pb-1">
          {FILTERS.map((f) => (
            <Link
              key={f.value}
              href={f.value === "ALL" ? "/orders" : `/orders?status=${f.value}`}
              className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition ${
                activeStatus === f.value
                  ? f.active
                  : "bg-white text-gray-600 hover:bg-gray-100"
              }`}
            >
              {f.label}
            </Link>
          ))}
        </div>

        {/* Empty */}
        {filteredOrders.length === 0 ? (
          <div className="rounded-2xl bg-white p-12 text-center shadow-sm">
            <div className="text-5xl">🛒</div>
            <h2 className="mt-4 text-xl font-bold text-gray-900">
              ยังไม่มีคำสั่งซื้อ
            </h2>
            <p className="mt-2 text-sm text-gray-500">
              คุณยังไม่มีรายการคำสั่งซื้อในขณะนี้
            </p>
            <Link
              href="/product"
              className="mt-6 inline-block rounded-xl bg-green-700 px-6 py-3 text-sm font-semibold text-white transition hover:bg-green-800"
            >
              เริ่มช้อปปิ้ง
            </Link>
          </div>
        ) : (
          /* Order List — compact rows */
          <div className="space-y-3">
            {filteredOrders.map((order) => {
              const status = getStatus(order.status);

              const totalQuantity = order.items.reduce(
                (sum, item) => sum + item.quantity,
                0
              );

              const subtotal = order.items.reduce(
                (sum, item) => sum + item.price * item.quantity,
                0
              );

              const total = subtotal + SHIPPING_FEE;

              // แสดงชื่อสินค้าแค่ 2 รายการแรก ที่เหลือย่อเป็น "+N รายการ"
              const previewItems = order.items.slice(0, 2);
              const extraCount = order.items.length - previewItems.length;

              return (
                <Link
                  key={order.id}
                  href={`/order/success/${order.id}`}
                  className="block rounded-2xl bg-white p-4 shadow-sm transition hover:shadow-md sm:p-5"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    {/* Left: order info */}
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                        <p className="truncate text-sm font-bold text-gray-900">
                          #{order.id.slice(0, 8)}
                        </p>
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold ${status.badge}`}
                        >
                          <span>{status.icon}</span>
                          <span>{status.label}</span>
                        </span>
                      </div>

                      <p className="mt-1 truncate text-sm text-gray-500">
                        {previewItems
                          .map((item) => item.product.name)
                          .join(", ")}
                        {extraCount > 0 && ` +${extraCount} รายการ`}
                        {" · "}
                        {totalQuantity} ชิ้น
                      </p>

                      <p className="mt-1 text-xs text-gray-400">
                        {order.createdAt.toLocaleDateString("th-TH", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                    </div>

                    {/* Right: total */}
                    <div className="flex shrink-0 items-center justify-between gap-4 sm:flex-col sm:items-end sm:justify-center">
                      <p className="text-lg font-bold text-green-700">
                        ฿{total.toLocaleString()}
                      </p>
                      <span className="text-sm font-medium text-gray-400">
                        ดูรายละเอียด →
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}