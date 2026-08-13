"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSyncExternalStore } from "react";

interface Props {
  item: {
    id: string;
    quantity: number;
    product: {
      id: string;
      name: string;
      sku: string;
      price: number;
      stock: number;
      images: {
        imageUrl: string;
      }[];
    };
  };
}

const SELECTED_ITEMS_KEY = "cart-selected-items";

// stable empty array reference — ป้องกัน infinite loop จาก useSyncExternalStore
const EMPTY_SELECTED: string[] = [];

// cache ผลลัพธ์ล่าสุด เพื่อคืน reference เดิมถ้าข้อมูลใน localStorage ไม่เปลี่ยน
let cachedRaw: string | null = null;
let cachedIds: string[] = EMPTY_SELECTED;

function getSelectedIds(): string[] {
  try {
    const raw = window.localStorage.getItem(SELECTED_ITEMS_KEY);

    if (raw === cachedRaw) {
      return cachedIds;
    }

    cachedRaw = raw;
    cachedIds = raw ? (JSON.parse(raw) as string[]) : EMPTY_SELECTED;
    return cachedIds;
  } catch {
    return EMPTY_SELECTED;
  }
}

function setSelectedIds(ids: string[]) {
  window.localStorage.setItem(SELECTED_ITEMS_KEY, JSON.stringify(ids));
  window.dispatchEvent(new Event("cart-selection-updated"));
}

function subscribe(callback: () => void) {
  window.addEventListener("cart-selection-updated", callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener("cart-selection-updated", callback);
    window.removeEventListener("storage", callback);
  };
}

export default function CartItem({ item }: Props) {
  const router = useRouter();

  const checked = useSyncExternalStore(
    subscribe,
    () => getSelectedIds().includes(item.id),
    () => false
  );

  const stock = item.product.stock;
  const outOfStock = stock <= 0;
  const atMaxStock = item.quantity >= stock;

  function toggleChecked(value: boolean) {
    const current = new Set(getSelectedIds());
    if (value) {
      current.add(item.id);
    } else {
      current.delete(item.id);
    }
    setSelectedIds(Array.from(current));
  }

  async function updateQuantity(quantity: number) {
    if (quantity <= 0) {
      deleteItem();
      return;
    }

    // กันไม่ให้เพิ่มจำนวนเกินสต๊อกที่มีอยู่จริง (เช็คฝั่ง client
    // เพื่อ UX ที่ไว — เซิร์ฟเวอร์จะเช็คซ้ำอีกครั้งเสมอ)
    if (quantity > stock) {
      alert(`สินค้านี้เหลือในสต๊อกเพียง ${stock} ชิ้น`);
      return;
    }

    const res = await fetch(`/api/cart/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quantity }),
    });

    if (res.ok) {
      window.dispatchEvent(new Event("cart-updated"));
      router.refresh();
      return;
    }

    // เซิร์ฟเวอร์ปฏิเสธ (เช่น สต๊อกไม่พอ) -> แจ้งเตือนผู้ใช้
    const data = await res.json().catch(() => null);
    alert(data?.message || "ไม่สามารถอัปเดตจำนวนสินค้าได้");
  }

  async function deleteItem() {
    const res = await fetch(`/api/cart/${item.id}`, {
      method: "DELETE",
    });

    if (res.ok) {
      const current = new Set(getSelectedIds());
      current.delete(item.id);
      setSelectedIds(Array.from(current));

      window.dispatchEvent(new Event("cart-updated"));
      router.refresh();
    }
  }

  return (
    <div
      className={`flex gap-3 rounded-2xl border bg-white p-3 transition-colors sm:gap-5 sm:p-5 ${
        checked ? "border-green-500 ring-1 ring-green-500" : "border-gray-200"
      }`}
    >
      {/* Checkbox */}
      <div className="flex items-start pt-1">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => toggleChecked(e.target.checked)}
          className="h-5 w-5 cursor-pointer accent-green-600"
          aria-label={`เลือกสินค้า ${item.product.name}`}
        />
      </div>

      {/* รูปสินค้า: เล็กลงบนมือถือ ใหญ่ขึ้นบนจอกว้าง */}
      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-gray-100 sm:h-28 sm:w-28">
        {item.product.images[0] && (
          <Image
            src={item.product.images[0].imageUrl}
            alt={item.product.name}
            fill
            sizes="(max-width: 640px) 80px, 112px"
            className="object-cover"
          />
        )}
      </div>

      {/* เนื้อหา: บนมือถือเรียงเป็นคอลัมน์เดียว ปุ่มลบย้ายไปบนขวา */}
      <div className="flex min-w-0 flex-1 flex-col justify-between">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h2 className="truncate text-sm font-semibold sm:text-lg">
              {item.product.name}
            </h2>
            <p className="mt-1 truncate text-xs text-gray-500 sm:text-base">
              รหัสสินค้า : {item.product.sku}
            </p>
            <p className="mt-1 font-bold text-green-700 sm:mt-2">
              ฿{item.product.price.toLocaleString()}
            </p>

            {/* จำนวนสต๊อกคงเหลือ */}
            <p
              className={`mt-1 text-xs sm:text-sm ${
                outOfStock
                  ? "text-red-600"
                  : atMaxStock
                  ? "text-orange-600"
                  : "text-gray-400"
              }`}
            >
              {outOfStock
                ? "สินค้าหมดสต๊อก"
                : `คงเหลือในสต๊อก ${stock} ชิ้น`}
            </p>
          </div>

          {/* ปุ่มลบ: ย้ายขึ้นมามุมขวาบนบนมือถือ เพื่อไม่ให้แถวล่างแน่นเกินไป */}
          <button
            onClick={deleteItem}
            className="shrink-0 text-lg text-red-600 hover:text-red-700 sm:hidden"
            aria-label="ลบสินค้า"
          >
            🗑️
          </button>
        </div>

        <div className="mt-3 flex items-center justify-between sm:mt-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => updateQuantity(item.quantity - 1)}
              className="flex h-8 w-8 items-center justify-center rounded-lg border hover:bg-gray-50 sm:h-10 sm:w-10"
              aria-label="ลดจำนวน"
            >
              −
            </button>

            <span className="w-6 text-center text-sm font-bold sm:w-8 sm:text-base">
              {item.quantity}
            </span>

            <button
              onClick={() => updateQuantity(item.quantity + 1)}
              disabled={atMaxStock}
              className="flex h-8 w-8 items-center justify-center rounded-lg border hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-white sm:h-10 sm:w-10"
              aria-label="เพิ่มจำนวน"
              title={
                atMaxStock
                  ? `เพิ่มได้สูงสุด ${stock} ชิ้นตามสต๊อก`
                  : undefined
              }
            >
              +
            </button>
          </div>

          <div className="flex items-center gap-3 sm:gap-5">
            <span className="text-sm font-bold sm:text-base">
              ฿{(item.product.price * item.quantity).toLocaleString()}
            </span>

            {/* ปุ่มลบสำหรับจอ sm ขึ้นไป (ซ่อนอันที่มุมบนบนมือถือ) */}
            <button
              onClick={deleteItem}
              className="hidden text-xl text-red-600 hover:text-red-700 sm:inline-block"
              aria-label="ลบสินค้า"
            >
              🗑️
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ===================================================
// CartSummary — อยู่ในไฟล์เดียวกับ CartItem เพื่อ share
// logic การอ่าน selected ids จาก localStorage
// ===================================================

interface SummaryProps {
  items: {
    id: string;
    quantity: number;
    price: number;
  }[];
}

export function CartSummary({ items }: SummaryProps) {
  const selectedIds = useSyncExternalStore(
    subscribe,
    getSelectedIds,
    () => EMPTY_SELECTED
  );

  const selectedItems = items.filter((item) => selectedIds.includes(item.id));

  const total = selectedItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <div className="h-fit rounded-2xl border bg-white p-4 sm:p-6">
      <h2 className="text-xl font-bold sm:text-2xl">สรุปคำสั่งซื้อ</h2>

      <p className="mt-2 text-sm text-gray-500">
        เลือกแล้ว {selectedItems.length} จาก {items.length} รายการ
      </p>

      <div className="mt-4 flex justify-between sm:mt-6">
        <span className="text-sm sm:text-base">ยอดรวม</span>
        <span className="text-xl font-bold text-green-700 sm:text-2xl">
          ฿{total.toLocaleString()}
        </span>
      </div>

      <Link
        href="/checkout"
        className={`mt-4 block w-full rounded-xl px-6 py-3 text-center text-sm font-semibold text-white transition sm:mt-6 sm:py-4 sm:text-base ${
          selectedItems.length === 0
            ? "pointer-events-none bg-gray-300"
            : "bg-green-700 hover:bg-green-800"
        }`}
      >
        ดำเนินการชำระเงิน
      </Link>

      <Link
        href="/product"
        className="mt-4 block text-center text-sm text-green-700 sm:text-base"
      >
        เลือกซื้อสินค้าต่อ
      </Link>
    </div>
  );
}