import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import CancelOrderButton from "@/components/CancelOrderButton";

interface Props {
  params: Promise<{
    id: string;
  }>;
}

// ค่าจัดส่งคงที่
const SHIPPING_FEE = 50;

// ตัวเลือกบริษัทขนส่ง (ต้องตรงกับฝั่งแอดมิน)
const carrierOptions = [
  {
    value: "KERRY",
    label: "Kerry Express",
  },
  {
    value: "THAILAND_POST",
    label: "ไปรษณีย์ไทย",
  },
  {
    value: "FLASH",
    label: "Flash Express",
  },
];

function getCarrierLabel(carrier: string) {
  const found = carrierOptions.find(
    (item) =>
      item.value === carrier
  );

  return (
    found?.label || carrier
  );
}

function getStatusText(status: string) {
  switch (status) {
    case "PENDING":
      return "รอตรวจสอบการชำระเงิน";

    case "PAID":
      return "ชำระเงินสำเร็จ";

    case "PROCESSING":
      return "เตรียมสินค้า";

    case "SHIPPED":
      return "สินค้าจัดส่ง";

    case "DELIVERED":
      return "จัดส่งสำเร็จ";

    case "CANCELLED":
      return "ยกเลิกคำสั่งซื้อ";

    default:
      return status;
  }
}

function getStatusStyle(status: string) {
  switch (status) {
    case "PENDING":
      return "bg-yellow-100 text-yellow-700";

    case "PAID":
      return "bg-blue-100 text-blue-700";

    case "PROCESSING":
      return "bg-purple-100 text-purple-700";

    case "SHIPPED":
      return "bg-indigo-100 text-indigo-700";

    case "DELIVERED":
      return "bg-green-100 text-green-700";

    case "CANCELLED":
      return "bg-red-100 text-red-700";

    default:
      return "bg-gray-100 text-gray-700";
  }
}

function getStatusIcon(status: string) {
  switch (status) {
    case "PENDING":
      return "⏳";

    case "PAID":
      return "✓";

    case "PROCESSING":
      return "📦";

    case "SHIPPED":
      return "🚚";

    case "DELIVERED":
      return "✓";

    case "CANCELLED":
      return "✕";

    default:
      return "•";
  }
}

export default async function OrderSuccessPage({
  params,
}: Props) {
  // =========================
  // ตรวจสอบ Login
  // =========================

  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  // =========================
  // รับ Order ID
  // =========================

  const { id } = await params;

  // =========================
  // ดึง Order
  // =========================

  const order = await prisma.order.findFirst({
    where: {
      id: id,
      userId: session.user.id,
    },

    include: {
      address: true,

      items: {
        include: {
          product: true,
        },
      },
    },
  });

  // =========================
  // ไม่พบ Order
  // =========================

  if (!order) {
    return (
      <main className="min-h-screen bg-gray-50 px-6 py-16">
        <div className="mx-auto max-w-3xl">
          <div className="rounded-2xl bg-white p-12 text-center shadow-sm">

            <div className="text-6xl">
              🔍
            </div>

            <h1 className="mt-6 text-3xl font-bold">
              ไม่พบคำสั่งซื้อ
            </h1>

            <p className="mt-3 text-gray-500">
              ไม่พบคำสั่งซื้อ หรือคำสั่งซื้อนี้ไม่ใช่ของบัญชีของคุณ
            </p>

            <Link
              href="/orders"
              className="mt-8 inline-block rounded-xl bg-green-700 px-6 py-3 font-semibold text-white transition hover:bg-green-800"
            >
              กลับไปหน้าคำสั่งซื้อของฉัน
            </Link>

          </div>
        </div>
      </main>
    );
  }

  // =========================
  // จำนวนสินค้ารวม
  // =========================

  const totalQuantity = order.items.reduce(
    (sum, item) =>
      sum + item.quantity,
    0
  );

  // =========================
  // คำนวณยอดสินค้า (subtotal) จากรายการสินค้าจริง
  // แล้วบวกค่าจัดส่งเพื่อได้ยอดรวม (total)
  // ไม่ใช้ order.total ลบค่าส่งย้อนกลับ เพราะถ้า order.total
  // ไม่ได้บวกค่าส่งไว้ตั้งแต่ตอนสร้าง order จะทำให้ตัวเลขคลาดเคลื่อน
  // =========================

  const shippingFee = SHIPPING_FEE;

  const subtotal = order.items.reduce(
    (sum, item) =>
      sum + item.price * item.quantity,
    0
  );

  const total = subtotal + shippingFee;

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-12">
      <div className="mx-auto max-w-5xl">

        {/* ========================= */}
        {/* Header */}
        {/* ========================= */}

        <div className="mb-8">

          <Link
            href="/orders"
            className="text-green-700 hover:underline"
          >
            ← กลับไปหน้าคำสั่งซื้อของฉัน
          </Link>

        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm sm:p-10">

          {/* ========================= */}
          {/* Order Header */}
          {/* ========================= */}

          <div className="border-b pb-8">

            <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">

              <div>

                <p className="text-sm text-gray-500">
                  หมายเลขคำสั่งซื้อ
                </p>

                <h1 className="mt-2 break-all text-2xl font-bold text-gray-900">
                  #{order.id}
                </h1>

                <p className="mt-3 text-sm text-gray-500">
                  สั่งซื้อเมื่อ{" "}
                  {order.createdAt.toLocaleDateString(
                    "th-TH",
                    {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    }
                  )}
                </p>

              </div>

              <div
                className={`inline-flex w-fit items-center gap-2 rounded-full px-5 py-3 font-bold ${getStatusStyle(
                  order.status
                )}`}
              >

                <span>
                  {getStatusIcon(
                    order.status
                  )}
                </span>

                <span>
                  {getStatusText(
                    order.status
                  )}
                </span>

              </div>

            </div>

          </div>

          {/* ========================= */}
          {/* Order Status */}
          {/* ========================= */}

          <div className="mt-8">

            <h2 className="text-xl font-bold">
              สถานะคำสั่งซื้อ
            </h2>

            <div className="mt-6 overflow-x-auto">

              <div className="flex min-w-700px items-start">

                {/* PENDING */}
                <div className="flex flex-1 flex-col items-center text-center">

                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-full ${
                      [
                        "PENDING",
                        "PAID",
                        "PROCESSING",
                        "SHIPPED",
                        "DELIVERED",
                      ].includes(order.status)
                        ? "bg-green-700 text-white"
                        : "bg-gray-200 text-gray-500"
                    }`}
                  >
                    ⏳
                  </div>

                  <p className="mt-3 text-sm font-semibold">
                    รอตรวจสอบ
                  </p>

                </div>

                <div className="mt-6 h-1 flex-1 bg-gray-200" />

                {/* PAID */}
                <div className="flex flex-1 flex-col items-center text-center">

                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-full ${
                      [
                        "PAID",
                        "PROCESSING",
                        "SHIPPED",
                        "DELIVERED",
                      ].includes(order.status)
                        ? "bg-green-700 text-white"
                        : "bg-gray-200 text-gray-500"
                    }`}
                  >
                    ✓
                  </div>

                  <p className="mt-3 text-sm font-semibold">
                    ชำระเงินสำเร็จ
                  </p>

                </div>

                <div className="mt-6 h-1 flex-1 bg-gray-200" />

                {/* PROCESSING */}
                <div className="flex flex-1 flex-col items-center text-center">

                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-full ${
                      [
                        "PROCESSING",
                        "SHIPPED",
                        "DELIVERED",
                      ].includes(order.status)
                        ? "bg-green-700 text-white"
                        : "bg-gray-200 text-gray-500"
                    }`}
                  >
                    📦
                  </div>

                  <p className="mt-3 text-sm font-semibold">
                    เตรียมสินค้า
                  </p>

                </div>

                <div className="mt-6 h-1 flex-1 bg-gray-200" />

                {/* SHIPPED */}
                <div className="flex flex-1 flex-col items-center text-center">

                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-full ${
                      [
                        "SHIPPED",
                        "DELIVERED",
                      ].includes(order.status)
                        ? "bg-green-700 text-white"
                        : "bg-gray-200 text-gray-500"
                    }`}
                  >
                    🚚
                  </div>

                  <p className="mt-3 text-sm font-semibold">
                    สินค้าจัดส่ง
                  </p>

                </div>

                <div className="mt-6 h-1 flex-1 bg-gray-200" />

                {/* DELIVERED */}
                <div className="flex flex-1 flex-col items-center text-center">

                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-full ${
                      order.status ===
                      "DELIVERED"
                        ? "bg-green-700 text-white"
                        : "bg-gray-200 text-gray-500"
                    }`}
                  >
                    ✓
                  </div>

                  <p className="mt-3 text-sm font-semibold">
                    จัดส่งสำเร็จ
                  </p>

                </div>

              </div>

            </div>

          </div>

          {/* ========================= */}
          {/* Tracking Number */}
          {/* ========================= */}

          {order.trackingNumber && (
            <div className="mt-8 rounded-2xl border border-green-200 bg-green-50 p-6">

              <h2 className="text-xl font-bold text-green-800">
                📦 ข้อมูลการจัดส่ง
              </h2>

              <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                <div>
                  <p className="text-sm text-gray-500">
                    บริษัทขนส่ง
                  </p>

                  <p className="font-semibold text-gray-900">
                    {getCarrierLabel(
                      order.carrier || ""
                    )}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">
                    เลขติดตามพัสดุ
                  </p>

                  <p className="break-all font-mono text-lg font-bold text-green-700">
                    {order.trackingNumber}
                  </p>
                </div>

              </div>

            </div>
          )}

          {/* ========================= */}
          {/* Shipping Address */}
          {/* ========================= */}

          <div className="mt-10 rounded-2xl border p-6">

            <h2 className="text-xl font-bold">
              ที่อยู่จัดส่ง
            </h2>

            <div className="mt-4 text-gray-600">

              <p className="font-semibold text-gray-900">
                {order.address.fullName}
              </p>

              <p className="mt-1">
                โทร {order.address.phone}
              </p>

              <p className="mt-3">
                {order.address.address}
              </p>

              <p>
                ตำบล {order.address.subDistrict}
              </p>

              <p>
                อำเภอ {order.address.district}
              </p>

              <p>
                จังหวัด {order.address.province}
              </p>

              <p>
                รหัสไปรษณีย์{" "}
                {order.address.postalCode}
              </p>

              {order.address.note && (
                <p className="mt-3 text-sm text-gray-500">
                  หมายเหตุ:{" "}
                  {order.address.note}
                </p>
              )}

            </div>

          </div>

          {/* ========================= */}
          {/* Order Items */}
          {/* ========================= */}

          <div className="mt-10">

            <div className="flex items-center justify-between">

              <h2 className="text-xl font-bold">
                รายการสินค้า
              </h2>

              <p className="text-sm text-gray-500">
                {totalQuantity} ชิ้น
              </p>

            </div>

            <div className="mt-5 divide-y rounded-2xl border">

              {order.items.map(
                (item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between gap-4 p-5"
                  >

                    <div className="min-w-0">

                      <p className="font-semibold text-gray-900">
                        {item.product.name}
                      </p>

                      <p className="mt-1 text-sm text-gray-500">
                        รหัสสินค้า:{" "}
                        {item.product.sku}
                      </p>

                      <p className="mt-1 text-sm text-gray-500">
                        จำนวน{" "}
                        {item.quantity}
                      </p>

                    </div>

                    <div className="shrink-0 text-right">

                      <p className="text-sm text-gray-500">
                        ฿
                        {item.price.toLocaleString()}
                        {" / ชิ้น"}
                      </p>

                      <p className="mt-1 font-bold text-green-700">
                        ฿
                        {(
                          item.price *
                          item.quantity
                        ).toLocaleString()}
                      </p>

                    </div>

                  </div>
                )
              )}

            </div>

          </div>

          {/* ========================= */}
          {/* Total */}
          {/* ========================= */}

          <div className="mt-8 space-y-3 border-t pt-6">

            <div className="flex items-center justify-between text-gray-600">
              <span>ยอดสินค้า</span>
              <span>
                ฿{subtotal.toLocaleString()}
              </span>
            </div>

            <div className="flex items-center justify-between text-gray-600">
              <span>ค่าจัดส่ง</span>
              <span>
                ฿{shippingFee.toLocaleString()}
              </span>
            </div>

            <div className="flex items-center justify-between pt-2">

              <span className="text-xl font-bold">
                ยอดรวมทั้งหมด
              </span>

              <span className="text-3xl font-bold text-green-700">
                ฿
                {total.toLocaleString()}
              </span>

            </div>

          </div>

          {/* ========================= */}
          {/* Policy: ยกเลิก / คืน-เปลี่ยนสินค้า */}
          {/* ========================= */}

          <div className="mt-8 rounded-2xl border border-gray-200 bg-gray-50 p-6 text-sm text-gray-600">

            <h3 className="font-bold text-gray-900">
              นโยบายการยกเลิก และการคืน/เปลี่ยนสินค้า
            </h3>

            <ul className="mt-3 list-disc space-y-2 pl-5">

              <li>
                <span className="font-semibold text-red-600">
                  การยกเลิกคำสั่งซื้อ:
                </span>{" "}
                เมื่อกดยกเลิกคำสั่งซื้อแล้ว ระบบจะไม่คืนเงินที่ชำระมาให้ไม่ว่ากรณีใดก็ตาม
                กรุณาตรวจสอบรายการสินค้าให้ถูกต้องก่อนทำการสั่งซื้อ
              </li>

              <li>
                <span className="font-semibold text-blue-600">
                  คืนสินค้า / เปลี่ยนสินค้า / แจ้งปัญหา:
                </span>{" "}
                หากได้รับสินค้าแล้วพบปัญหา เช่น สินค้าชำรุด ไม่ตรงตามที่สั่ง
                หรือต้องการเปลี่ยน/คืนสินค้า กรุณาติดต่อทางร้านผ่าน LINE Official
                Account พร้อมแจ้งหมายเลขคำสั่งซื้อ{" "}
                <span className="font-semibold text-gray-900">#{order.id}</span>{" "}
                เพื่อให้เจ้าหน้าที่ดำเนินการให้
              </li>

            </ul>

          </div>

          {/* ========================= */}
          {/* Buttons */}
          {/* ========================= */}

          <div className="mt-6 flex flex-col gap-4 sm:flex-row">

            <Link
              href="/orders"
              className="flex-1 rounded-xl border border-green-700 px-6 py-4 text-center font-semibold text-green-700 transition hover:bg-green-50"
            >
              ← คำสั่งซื้อของฉัน
            </Link>

            <Link
              href="/product"
              className="flex-1 rounded-xl border border-green-700 px-6 py-4 text-center font-semibold text-green-700 transition hover:bg-green-50"
            >
              เลือกซื้อสินค้าต่อ
            </Link>

            {order.status !== "CANCELLED" && (
              <CancelOrderButton orderId={order.id} />
            )}

            <a
              href="https://line.me/R/ti/p/@yourlineoa"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 rounded-xl border border-blue-600 px-6 py-4 text-center font-semibold text-blue-600 transition hover:bg-blue-50"
            >
              คืน/เปลี่ยนสินค้า • แจ้งปัญหา
            </a>

          </div>

        </div>

      </div>
    </main>
  );
}