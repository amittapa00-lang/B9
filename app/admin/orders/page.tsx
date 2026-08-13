"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

interface OrderUser {
  id: string;
  name: string;
  email: string;
}

interface OrderAddress {
  id: string;
  fullName: string;
  phone: string;
  address: string;
  subDistrict: string;
  district: string;
  province: string;
  postalCode: string;
}

interface OrderProduct {
  id: string;
  name: string;
  sku: string;
}

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  product: OrderProduct;
}

interface Order {
  id: string;
  total: number;
  shippingFee?: number;
  status: string;
  slipUrl?: string | null;
  createdAt: string;
  user: OrderUser;
  address: OrderAddress;
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

function getStatusLabel(status: string) {
  const item = statusOptions.find(
    (option) => option.value === status
  );

  return item?.label || status;
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
async function fetchOrdersData(): Promise<Order[]> {
  const res = await fetch("/api/admin/orders", {
    cache: "no-store",
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(
      data.message || "ไม่สามารถโหลดคำสั่งซื้อได้"
    );
  }

  return data;
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);

  const [loading, setLoading] = useState(true);

  const [updatingId, setUpdatingId] =
    useState<string | null>(null);

  const [statusFilter, setStatusFilter] =
    useState("all");

  useEffect(() => {
    let ignore = false;

    fetchOrdersData()
      .then((data) => {
        if (!ignore) {
          setOrders(data);
        }
      })
      .catch((error) => {
        console.error(error);

        if (!ignore) {
          alert(
            error instanceof Error
              ? error.message
              : "เกิดข้อผิดพลาดในการโหลดคำสั่งซื้อ"
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
  }, []);

  function handleRefresh() {
    setLoading(true);

    fetchOrdersData()
      .then((data) => {
        setOrders(data);
      })
      .catch((error) => {
        console.error(error);

        alert(
          error instanceof Error
            ? error.message
            : "เกิดข้อผิดพลาดในการโหลดคำสั่งซื้อ"
        );
      })
      .finally(() => {
        setLoading(false);
      });
  }

  async function updateStatus(
    orderId: string,
    status: string
  ) {
    try {
      setUpdatingId(orderId);

      const res = await fetch(
        `/api/admin/orders/${orderId}`,
        {
          method: "PATCH",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            status,
          }),
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

      setOrders((currentOrders) =>
        currentOrders.map((order) =>
          order.id === orderId
            ? { ...order, status }
            : order
        )
      );
    } catch (error) {
      console.error(error);

      alert("เกิดข้อผิดพลาด กรุณาลองใหม่");
    } finally {
      setUpdatingId(null);
    }
  }

  function getOrderTotal(order: Order) {
    const shippingFee =
      order.shippingFee ?? SHIPPING_FEE;

    const subtotal = order.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    return subtotal + shippingFee;
  }

  const filteredOrders = useMemo(() => {
    if (statusFilter === "all") {
      return orders;
    }

    return orders.filter(
      (order) => order.status === statusFilter
    );
  }, [orders, statusFilter]);

  const pendingCount = orders.filter(
    (order) => order.status === "PENDING"
  ).length;

  const processingCount = orders.filter(
    (order) => order.status === "PROCESSING"
  ).length;

  const deliveredCount = orders.filter(
    (order) => order.status === "DELIVERED"
  ).length;

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Orders
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              จัดการคำสั่งซื้อและตรวจสอบการชำระเงิน
            </p>
          </div>

          <button
            type="button"
            onClick={handleRefresh}
            className="rounded-xl border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-100"
          >
            รีเฟรช
          </button>
        </div>

        {/* Summary */}
        <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-gray-500">
              คำสั่งซื้อทั้งหมด
            </p>
            <p className="mt-2 text-2xl font-bold text-gray-900">
              {orders.length.toLocaleString("th-TH")}
            </p>
          </div>

          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-gray-500">
              รอตรวจสอบ
            </p>
            <p className="mt-2 text-2xl font-bold text-yellow-600">
              {pendingCount.toLocaleString("th-TH")}
            </p>
          </div>

          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-gray-500">
              กำลังจัดเตรียม
            </p>
            <p className="mt-2 text-2xl font-bold text-purple-600">
              {processingCount.toLocaleString("th-TH")}
            </p>
          </div>

          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-gray-500">
              จัดส่งสำเร็จ
            </p>
            <p className="mt-2 text-2xl font-bold text-green-600">
              {deliveredCount.toLocaleString("th-TH")}
            </p>
          </div>
        </div>

        {/* Filter แถวเดียว ง่ายๆ */}
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setStatusFilter("all")}
            className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${
              statusFilter === "all"
                ? "bg-gray-900 text-white"
                : "bg-white text-gray-600 border hover:bg-gray-100"
            }`}
          >
            ทั้งหมด
          </button>

          {statusOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() =>
                setStatusFilter(option.value)
              }
              className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${
                statusFilter === option.value
                  ? "bg-gray-900 text-white"
                  : "bg-white text-gray-600 border hover:bg-gray-100"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
          {loading ? (
            <div className="p-16 text-center text-gray-500">
              กำลังโหลดคำสั่งซื้อ...
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="p-16 text-center">
              <h2 className="text-xl font-bold text-gray-900">
                ไม่พบคำสั่งซื้อ
              </h2>
              <p className="mt-2 text-sm text-gray-500">
                {statusFilter === "all"
                  ? "เมื่อมีลูกค้าสั่งซื้อ รายการจะแสดงที่นี่"
                  : "ไม่มีคำสั่งซื้อในสถานะนี้"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-5 py-3 text-left text-sm font-semibold text-gray-600">
                      Order
                    </th>
                    <th className="px-5 py-3 text-left text-sm font-semibold text-gray-600">
                      ลูกค้า
                    </th>
                    <th className="px-5 py-3 text-left text-sm font-semibold text-gray-600">
                      สินค้า
                    </th>
                    <th className="px-5 py-3 text-left text-sm font-semibold text-gray-600">
                      ยอดรวม
                    </th>
                    <th className="px-5 py-3 text-left text-sm font-semibold text-gray-600">
                      สถานะ
                    </th>
                    <th className="px-5 py-3 text-center text-sm font-semibold text-gray-600">
                      จัดการ
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredOrders.map((order) => (
                    <tr
                      key={order.id}
                      className="border-t hover:bg-gray-50"
                    >
                      {/* Order ID + วันที่ */}
                      <td className="px-5 py-4">
                        <p className="max-w-40 truncate font-mono text-sm font-medium text-gray-900">
                          {order.id}
                        </p>
                        <p className="mt-1 text-xs text-gray-400">
                          {new Date(
                            order.createdAt
                          ).toLocaleString("th-TH", {
                            dateStyle: "medium",
                            timeStyle: "short",
                          })}
                        </p>
                      </td>

                      {/* ลูกค้า */}
                      <td className="px-5 py-4">
                        <p className="font-medium text-gray-900">
                          {order.user.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {order.user.email}
                        </p>
                      </td>

                      {/* สินค้า */}
                      <td className="px-5 py-4 text-sm text-gray-600">
                        {order.items.length} รายการ
                        {order.slipUrl ? null : (
                          <p className="mt-1 text-xs text-red-500">
                            ยังไม่มีสลิป
                          </p>
                        )}
                      </td>

                      {/* ยอดรวม */}
                      <td className="px-5 py-4 font-semibold text-green-700">
                        ฿
                        {getOrderTotal(
                          order
                        ).toLocaleString("th-TH")}
                      </td>

                      {/* สถานะ (badge + dropdown เปลี่ยนสถานะในตัว) */}
                      <td className="px-5 py-4">
                        <select
                          value={order.status}
                          disabled={
                            updatingId === order.id
                          }
                          onChange={(event) =>
                            updateStatus(
                              order.id,
                              event.target.value
                            )
                          }
                          className={`rounded-full border-0 px-3 py-1.5 text-xs font-semibold outline-none focus:ring-2 focus:ring-green-600 disabled:opacity-50 ${getStatusClass(
                            order.status
                          )}`}
                        >
                          {statusOptions.map(
                            (option) => (
                              <option
                                key={option.value}
                                value={option.value}
                              >
                                {getStatusLabel(
                                  option.value
                                )}
                              </option>
                            )
                          )}
                        </select>
                      </td>

                      {/* จัดการ */}
                      <td className="px-5 py-4 text-center">
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="inline-block rounded-lg bg-green-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-green-800"
                        >
                          ดูรายละเอียด
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}