"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

interface User {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
}

interface Address {
  id: string;
  fullName: string;
  phone: string;
  address: string;
  subDistrict: string;
  district: string;
  province: string;
  postalCode: string;
  note?: string | null;
}

interface ProductImage {
  id: string;
  imageUrl: string;
  sortOrder: number;
}

interface Product {
  id: string;
  name: string;
  sku: string;
  images: ProductImage[];
}

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  product: Product;
}

interface Order {
  id: string;
  total: number;
  shippingFee?: number;
  status: string;
  slipUrl?: string | null;
  trackingNumber?: string | null;
  carrier?: string | null;
  createdAt: string;
  updatedAt: string;
  user: User;
  address: Address;
  items: OrderItem[];
}

// ค่าจัดส่งคงที่
const SHIPPING_FEE = 50;

const statusOptions = [
  {
    value: "PENDING",
    label: "รอตรวจสอบการชำระเงิน",
  },
  {
    value: "PAID",
    label: "ชำระเงินสำเร็จ",
  },
  {
    value: "PROCESSING",
    label: "เตรียมสินค้า",
  },
  {
    value: "SHIPPED",
    label: "สินค้าจัดส่ง",
  },
  {
    value: "DELIVERED",
    label: "จัดส่งสำเร็จ",
  },
  {
    value: "CANCELLED",
    label: "ยกเลิก",
  },
];

// ตัวเลือกบริษัทขนส่ง
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

function getStatusLabel(status: string) {
  const found = statusOptions.find(
    (item) =>
      item.value === status
  );

  return (
    found?.label || status
  );
}

function getCarrierLabel(carrier: string) {
  const found = carrierOptions.find(
    (item) =>
      item.value === carrier
  );

  return (
    found?.label || carrier
  );
}

function getStatusClass(status: string) {
  switch (status) {
    case "PENDING":
      return "bg-yellow-100 text-yellow-700";

    case "PAID":
      return "bg-blue-100 text-blue-700";

    case "PROCESSING":
      return "bg-purple-100 text-purple-700";

    case "SHIPPED":
      return "bg-orange-100 text-orange-700";

    case "DELIVERED":
      return "bg-green-100 text-green-700";

    case "CANCELLED":
      return "bg-red-100 text-red-700";

    default:
      return "bg-gray-100 text-gray-700";
  }
}

// Pure fetch helper — no setState calls inside, so calling it from an
// effect can never trip react-hooks/set-state-in-effect. The component
// handles all state updates itself, inside .then/.catch/.finally.
async function fetchOrderData(
  id: string
): Promise<Order> {
  const res = await fetch(
    `/api/admin/orders/${id}`,
    {
      cache: "no-store",
    }
  );

  const data = await res.json();

  if (!res.ok) {
    throw new Error(
      data.message ||
        "ไม่สามารถโหลดข้อมูล Order ได้"
    );
  }

  return data;
}

export default function AdminOrderDetailPage() {
  const params = useParams();

  const orderId =
    params.id as string;

  const [order, setOrder] =
    useState<Order | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [updating, setUpdating] =
    useState(false);

  const [selectedStatus, setSelectedStatus] =
    useState("");

  const [trackingNumber, setTrackingNumber] =
    useState("");

  const [carrier, setCarrier] =
    useState("");

  // loading เริ่มต้นเป็น true อยู่แล้ว (useState(true))
  // effect นี้เรียก fetchOrderData ซึ่งเป็นฟังก์ชัน "บริสุทธิ์"
  // (ไม่มี setState อยู่ข้างในเลย) แล้วค่อย setOrder/setSelectedStatus/
  // setLoading ใน .then/.catch/.finally ที่เขียนตรงในเนื้อ effect เอง
  // ตาม pattern ที่ react-hooks/set-state-in-effect ยอมรับ
  useEffect(() => {
    if (!orderId) {
      return;
    }

    let ignore = false;

    fetchOrderData(orderId)
      .then((data) => {
        if (ignore) {
          return;
        }

        setOrder(data);

        setSelectedStatus(
          data.status
        );

        setTrackingNumber(
          data.trackingNumber || ""
        );

        setCarrier(
          data.carrier || ""
        );
      })
      .catch((error) => {
        console.error(error);

        if (!ignore) {
          alert(
            error instanceof Error
              ? error.message
              : "เกิดข้อผิดพลาดในการโหลดข้อมูล"
          );
        }
      })
      .finally(() => {
        if (!ignore) {
          setLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, [orderId]);

  async function updateStatus() {
    if (!selectedStatus) {
      return;
    }

    // เมื่อเปลี่ยนสถานะเป็น "สินค้าจัดส่ง" ต้องกรอกบริษัทขนส่ง
    // และเลขติดตามพัสดุก่อนบันทึกเสมอ
    if (
      selectedStatus === "SHIPPED" &&
      (!carrier || !trackingNumber.trim())
    ) {
      alert(
        "กรุณาเลือกบริษัทขนส่ง และกรอกเลขติดตามพัสดุ"
      );

      return;
    }

    try {
      setUpdating(true);

      const body: Record<string, string> = {
        status: selectedStatus,
      };

      if (selectedStatus === "SHIPPED") {
        body.carrier = carrier;
        body.trackingNumber =
          trackingNumber.trim();
      }

      const res = await fetch(
        `/api/admin/orders/${orderId}`,
        {
          method: "PATCH",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify(body),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        alert(
          data.message ||
            "ไม่สามารถเปลี่ยนสถานะได้"
        );

        return;
      }

      setOrder((current) =>
        current
          ? {
              ...current,
              status:
                selectedStatus,
              ...(selectedStatus ===
              "SHIPPED"
                ? {
                    carrier,
                    trackingNumber:
                      trackingNumber.trim(),
                  }
                : {}),
              updatedAt:
                new Date().toISOString(),
            }
          : null
      );

      alert(
        "อัปเดตสถานะสำเร็จ"
      );
    } catch (error) {
      console.error(error);

      alert(
        "เกิดข้อผิดพลาด กรุณาลองใหม่"
      );
    } finally {
      setUpdating(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 px-6 py-16">
        <div className="mx-auto max-w-6xl">

          <div className="rounded-2xl bg-white p-16 text-center shadow-sm">

            <p className="text-gray-500">
              กำลังโหลดรายละเอียด Order...
            </p>

          </div>

        </div>
      </main>
    );
  }

  if (!order) {
    return (
      <main className="min-h-screen bg-gray-50 px-6 py-16">
        <div className="mx-auto max-w-4xl">

          <div className="rounded-2xl bg-white p-16 text-center shadow-sm">

            <h1 className="text-3xl font-bold">
              Order Not Found
            </h1>

            <p className="mt-3 text-gray-500">
              ไม่พบคำสั่งซื้อ
            </p>

            <Link
              href="/admin/orders"
              className="mt-8 inline-block rounded-xl bg-green-700 px-6 py-3 font-semibold text-white"
            >
              กลับไป Orders
            </Link>

          </div>

        </div>
      </main>
    );
  }

  // คำนวณยอดสินค้า (subtotal) จากรายการสินค้าจริง
  // แล้วบวกค่าจัดส่งเพื่อได้ยอดรวม (total)
  // ไม่ใช้ order.total ลบค่าส่งย้อนกลับ และไม่ fallback
  // shippingFee เป็น 0 เพราะค่าส่งจริงคือ 50 บาทเสมอ
  const shippingFee =
    order.shippingFee ?? SHIPPING_FEE;

  const subtotal = order.items.reduce(
    (sum, item) =>
      sum + item.price * item.quantity,
    0
  );

  const total = subtotal + shippingFee;

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-10">

      <div className="mx-auto max-w-6xl">

        {/* Back */}
        <Link
          href="/admin/orders"
          className="mb-6 inline-block text-sm font-semibold text-green-700 hover:underline"
        >
          ← กลับไปจัดการ Orders
        </Link>

        {/* Header */}
        <div className="mb-8 rounded-2xl bg-white p-6 shadow-sm">

          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

            <div>

              <p className="text-sm text-gray-500">
                Order ID
              </p>

              <h1 className="mt-1 break-all text-2xl font-bold">
                {order.id}
              </h1>

              <p className="mt-2 text-sm text-gray-500">
                สั่งซื้อเมื่อ{" "}
                {new Date(
                  order.createdAt
                ).toLocaleString(
                  "th-TH"
                )}
              </p>

            </div>

            <span
              className={`w-fit rounded-full px-5 py-3 text-sm font-bold ${getStatusClass(
                order.status
              )}`}
            >
              {getStatusLabel(
                order.status
              )}
            </span>

          </div>

        </div>

        {/* Status Timeline */}
        <div className="mb-8 rounded-2xl bg-white p-6 shadow-sm">

          <h2 className="text-xl font-bold">
            สถานะการจัดส่ง
          </h2>

          <div className="mt-8 overflow-x-auto">

            <div className="flex min-w-175 items-start">

              {statusOptions
                .filter(
                  (item) =>
                    item.value !==
                    "CANCELLED"
                )
                .map(
                  (status, index) => {

                    const currentIndex =
                      statusOptions
                        .filter(
                          (item) =>
                            item.value !==
                            "CANCELLED"
                        )
                        .findIndex(
                          (item) =>
                            item.value ===
                            order.status
                        );

                    const completed =
                      index <=
                      currentIndex;

                    return (
                      <div
                        key={
                          status.value
                        }
                        className="flex flex-1 items-start"
                      >

                        <div className="flex flex-col items-center">

                          <div
                            className={`flex h-10 w-10 items-center justify-center rounded-full font-bold ${
                              completed
                                ? "bg-green-700 text-white"
                                : "bg-gray-200 text-gray-500"
                            }`}
                          >
                            {completed
                              ? "✓"
                              : index + 1}
                          </div>

                          <p
                            className={`mt-3 w-32 text-center text-xs font-semibold ${
                              completed
                                ? "text-green-700"
                                : "text-gray-500"
                            }`}
                          >
                            {
                              status.label
                            }
                          </p>

                        </div>

                        {index <
                          statusOptions.filter(
                            (item) =>
                              item.value !==
                              "CANCELLED"
                          ).length -
                            1 && (
                          <div
                            className={`mt-5 h-1 flex-1 ${
                              index <
                              currentIndex
                                ? "bg-green-700"
                                : "bg-gray-200"
                            }`}
                          />
                        )}

                      </div>
                    );
                  }
                )}

            </div>

          </div>

        </div>

        <div className="grid gap-8 lg:grid-cols-3">

          {/* Left */}
          <div className="space-y-8 lg:col-span-2">

            {/* Customer */}
            <div className="rounded-2xl bg-white p-6 shadow-sm">

              <h2 className="text-xl font-bold">
                ข้อมูลลูกค้า
              </h2>

              <div className="mt-5 space-y-3 text-gray-600">

                <div>
                  <p className="text-sm text-gray-500">
                    ชื่อ
                  </p>

                  <p className="font-semibold text-gray-900">
                    {order.user.name}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">
                    Email
                  </p>

                  <p className="font-semibold text-gray-900">
                    {order.user.email}
                  </p>
                </div>

                {order.user.phone && (
                  <div>
                    <p className="text-sm text-gray-500">
                      เบอร์โทรศัพท์
                    </p>

                    <p className="font-semibold text-gray-900">
                      {order.user.phone}
                    </p>
                  </div>
                )}

              </div>

            </div>

            {/* Address */}
            <div className="rounded-2xl bg-white p-6 shadow-sm">

              <h2 className="text-xl font-bold">
                ที่อยู่จัดส่ง
              </h2>

              <div className="mt-5 leading-7 text-gray-600">

                <p className="font-bold text-gray-900">
                  {order.address.fullName}
                </p>

                <p>
                  โทร{" "}
                  {order.address.phone}
                </p>

                <p className="mt-3">
                  {order.address.address}
                </p>

                <p>
                  ตำบล{" "}
                  {
                    order.address
                      .subDistrict
                  }
                </p>

                <p>
                  อำเภอ{" "}
                  {
                    order.address
                      .district
                  }
                </p>

                <p>
                  จังหวัด{" "}
                  {
                    order.address
                      .province
                  }
                </p>

                <p>
                  รหัสไปรษณีย์{" "}
                  {
                    order.address
                      .postalCode
                  }
                </p>

                {order.address.note && (
                  <p className="mt-3 rounded-xl bg-gray-50 p-4 text-sm">
                    หมายเหตุ:{" "}
                    {order.address.note}
                  </p>
                )}

              </div>

            </div>

            {/* Order Items */}
            <div className="rounded-2xl bg-white p-6 shadow-sm">

              <h2 className="text-xl font-bold">
                รายการสินค้า
              </h2>

              <div className="mt-6 divide-y">

                {order.items.map(
                  (item) => {

                    const image =
                      item.product
                        .images[0]
                        ?.imageUrl;

                    const itemTotal =
                      item.price *
                      item.quantity;

                    return (
                      <div
                        key={item.id}
                        className="flex gap-5 py-5 first:pt-0 last:pb-0"
                      >

                        <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-gray-100">

                          {image ? (
                            <Image
                              src={image}
                              alt={
                                item.product
                                  .name
                              }
                              fill
                              sizes="96px"
                              className="object-cover"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center text-xs text-gray-400">
                              No Image
                            </div>
                          )}

                        </div>

                        <div className="flex flex-1 flex-col justify-between">

                          <div>

                            <h3 className="font-bold">
                              {
                                item.product
                                  .name
                              }
                            </h3>

                            <p className="mt-1 text-sm text-gray-500">
                              SKU:{" "}
                              {
                                item.product
                                  .sku
                              }
                            </p>

                          </div>

                          <div className="mt-3 flex justify-between">

                            <span className="text-sm text-gray-500">
                              จำนวน{" "}
                              {
                                item.quantity
                              }
                            </span>

                            <span className="font-bold text-green-700">
                              ฿
                              {itemTotal.toLocaleString()}
                            </span>

                          </div>

                        </div>

                      </div>
                    );
                  }
                )}

              </div>

            </div>

          </div>

          {/* Right */}
          <div className="space-y-8">

            {/* Payment */}
            <div className="rounded-2xl bg-white p-6 shadow-sm">

              <h2 className="text-xl font-bold">
                การชำระเงิน
              </h2>

              <div className="mt-5 space-y-2 text-sm text-gray-600">

                <div className="flex justify-between">
                  <span>ยอดสินค้า</span>
                  <span>
                    ฿{subtotal.toLocaleString()}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span>ค่าจัดส่ง</span>
                  <span>
                    ฿{shippingFee.toLocaleString()}
                  </span>
                </div>

              </div>

              <div className="mt-4 border-t pt-4">

                <p className="text-sm text-gray-500">
                  ยอดชำระทั้งหมด
                </p>

                <p className="mt-2 text-3xl font-bold text-green-700">
                  ฿
                  {total.toLocaleString()}
                </p>

              </div>

              {/* Slip */}
              <div className="mt-6 border-t pt-6">

                <h3 className="font-bold">
                  สลิปการโอนเงิน
                </h3>

                {order.slipUrl ? (
                  <div className="mt-4">

                    <a
                      href={
                        order.slipUrl
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <div className="relative aspect-3/4 overflow-hidden rounded-xl border bg-gray-100">

                        <Image
                          src={
                            order.slipUrl
                          }
                          alt="Payment Slip"
                          fill
                          sizes="400px"
                          className="object-contain"
                        />

                      </div>
                    </a>

                    <a
                      href={
                        order.slipUrl
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-4 block rounded-xl bg-green-700 px-5 py-3 text-center font-semibold text-white transition hover:bg-green-800"
                    >
                      เปิดดูสลิปขนาดเต็ม
                    </a>

                  </div>
                ) : (
                  <div className="mt-4 rounded-xl bg-red-50 p-5 text-center text-sm text-red-600">
                    ยังไม่มีการอัปโหลดสลิป
                  </div>
                )}

              </div>

            </div>

            {/* Shipping / Tracking */}
            {order.trackingNumber && (
              <div className="rounded-2xl bg-white p-6 shadow-sm">

                <h2 className="text-xl font-bold">
                  ข้อมูลการจัดส่ง
                </h2>

                <div className="mt-5 space-y-3">

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

            {/* Update Status */}
            <div className="rounded-2xl bg-white p-6 shadow-sm">

              <h2 className="text-xl font-bold">
                อัปเดตสถานะ
              </h2>

              <p className="mt-2 text-sm text-gray-500">
                เปลี่ยนสถานะคำสั่งซื้อ
              </p>

              <select
                value={
                  selectedStatus
                }
                onChange={(event) =>
                  setSelectedStatus(
                    event.target.value
                  )
                }
                disabled={updating}
                className="mt-5 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none focus:border-green-700"
              >
                {statusOptions.map(
                  (status) => (
                    <option
                      key={
                        status.value
                      }
                      value={
                        status.value
                      }
                    >
                      {status.label}
                    </option>
                  )
                )}
              </select>

              {/* แสดงเฉพาะตอนเลือกสถานะเป็น "สินค้าจัดส่ง" */}
              {selectedStatus === "SHIPPED" && (
                <div className="mt-4 space-y-4 rounded-xl bg-gray-50 p-4">

                  <div>
                    <label className="text-sm font-semibold text-gray-700">
                      บริษัทขนส่ง
                    </label>

                    <select
                      value={carrier}
                      onChange={(event) =>
                        setCarrier(
                          event.target.value
                        )
                      }
                      disabled={updating}
                      className="mt-2 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none focus:border-green-700"
                    >
                      <option value="">
                        -- เลือกบริษัทขนส่ง --
                      </option>

                      {carrierOptions.map(
                        (item) => (
                          <option
                            key={item.value}
                            value={item.value}
                          >
                            {item.label}
                          </option>
                        )
                      )}
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-gray-700">
                      เลขติดตามพัสดุ
                    </label>

                    <input
                      type="text"
                      value={trackingNumber}
                      onChange={(event) =>
                        setTrackingNumber(
                          event.target.value
                        )
                      }
                      disabled={updating}
                      placeholder="กรอกเลขติดตามพัสดุ"
                      className="mt-2 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none focus:border-green-700"
                    />
                  </div>

                </div>
              )}

              <button
                type="button"
                onClick={
                  updateStatus
                }
                disabled={
                  updating ||
                  (selectedStatus ===
                    order.status &&
                    selectedStatus !==
                      "SHIPPED")
                }
                className="mt-4 w-full rounded-xl bg-green-700 px-5 py-3 font-semibold text-white transition hover:bg-green-800 disabled:cursor-not-allowed disabled:bg-gray-300"
              >
                {updating
                  ? "กำลังบันทึก..."
                  : "บันทึกสถานะ"}
              </button>

            </div>

            {/* Total */}
            <div className="rounded-2xl bg-white p-6 shadow-sm">

              <h2 className="text-xl font-bold">
                สรุปคำสั่งซื้อ
              </h2>

              <div className="mt-5 space-y-2 border-t pt-5 text-sm text-gray-600">

                <div className="flex justify-between">
                  <span>ยอดสินค้า</span>
                  <span>
                    ฿{subtotal.toLocaleString()}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span>ค่าจัดส่ง</span>
                  <span>
                    ฿{shippingFee.toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="font-semibold text-gray-900">
                    Total
                  </span>

                  <span className="text-2xl font-bold text-green-700">
                    ฿
                    {total.toLocaleString()}
                  </span>
                </div>

              </div>

            </div>

          </div>

        </div>

      </div>

    </main>
  );
}