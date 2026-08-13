import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import DeleteProductButton from "@/components/admin/products/DeleteProductButton";

const LOW_STOCK_THRESHOLD = 10;

interface SearchParams {
  q?: string;
  categoryId?: string;
  stock?: string; // all | in | low | out
}

interface Props {
  searchParams: Promise<SearchParams> | SearchParams;
}

export default async function ProductsPage({ searchParams }: Props) {
  const params = await searchParams;

  const q = params.q?.trim() ?? "";
  const categoryId = params.categoryId ?? "";
  const stock = params.stock ?? "all";

  // ดึงหมวดหมู่ทั้งหมด (สำหรับ dropdown filter แบบจัดกลุ่มหลัก/ย่อย)
  const categories = await prisma.category.findMany({
    orderBy: { sortOrder: "asc" },
  });

  const mainCategories = categories.filter((c) => !c.parentId);

  // สถิติภาพรวม คำนวณจากสินค้าทั้งหมด (ไม่ขึ้นกับตัวกรอง)
  const allProducts = await prisma.product.findMany({
    select: { stock: true },
  });

  const totalProducts = allProducts.length;
  const outOfStockCount = allProducts.filter((p) => p.stock === 0).length;
  const lowStockCount = allProducts.filter(
    (p) => p.stock > 0 && p.stock <= LOW_STOCK_THRESHOLD
  ).length;
  const totalStockQuantity = allProducts.reduce(
    (sum, p) => sum + p.stock,
    0
  );

  // สร้างเงื่อนไข where ตามตัวกรอง
  const where: Prisma.ProductWhereInput = {};

  if (q) {
    where.OR = [
      { name: { contains: q } },
      { sku: { contains: q } },
    ];
  }

  if (categoryId) {
    where.categoryId = categoryId;
  }

  if (stock === "out") {
    where.stock = 0;
  } else if (stock === "low") {
    where.stock = { gt: 0, lte: LOW_STOCK_THRESHOLD };
  } else if (stock === "in") {
    where.stock = { gt: LOW_STOCK_THRESHOLD };
  }

  const products = await prisma.product.findMany({
    where,
    include: {
      category: {
        include: {
          parent: true, // ใช้เช็คว่าเป็นหมวดย่อยของหมวดไหน
        },
      },
      images: {
        orderBy: { sortOrder: "asc" },
        take: 1,
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const hasActiveFilters = !!(q || categoryId || (stock && stock !== "all"));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            จัดการสินค้า
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            {hasActiveFilters
              ? `พบ ${products.length} รายการ จากทั้งหมด ${totalProducts} รายการ`
              : `รายการสินค้าทั้งหมด ${totalProducts} รายการ`}
          </p>
        </div>

        <Link
          href="/admin/products/new"
          className="rounded-xl bg-green-700 px-5 py-3 font-semibold text-white shadow-sm transition hover:bg-green-800"
        >
          + เพิ่มสินค้า
        </Link>
      </div>

      {/* การ์ดสรุปสถิติสินค้า */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-gray-500">
            สินค้าทั้งหมด
          </p>
          <p className="mt-2 text-2xl font-bold text-gray-900">
            {totalProducts.toLocaleString("th-TH")}{" "}
            <span className="text-sm font-normal text-gray-400">
              รายการ
            </span>
          </p>
        </div>

        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-gray-500">
            สต็อกคงเหลือรวม
          </p>
          <p className="mt-2 text-2xl font-bold text-blue-600">
            {totalStockQuantity.toLocaleString("th-TH")}{" "}
            <span className="text-sm font-normal text-gray-400">
              ชิ้น
            </span>
          </p>
        </div>

        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-gray-500">
            สินค้าใกล้หมด (≤ {LOW_STOCK_THRESHOLD} ชิ้น)
          </p>
          <p className="mt-2 text-2xl font-bold text-yellow-600">
            {lowStockCount.toLocaleString("th-TH")}{" "}
            <span className="text-sm font-normal text-gray-400">
              รายการ
            </span>
          </p>
        </div>

        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-gray-500">
            สินค้าหมด
          </p>
          <p className="mt-2 text-2xl font-bold text-red-600">
            {outOfStockCount.toLocaleString("th-TH")}{" "}
            <span className="text-sm font-normal text-gray-400">
              รายการ
            </span>
          </p>
        </div>
      </div>

      {/* แถบค้นหา + ตัวกรอง */}
      <form
        method="GET"
        className="flex flex-col gap-3 rounded-xl border bg-white p-4 shadow-sm sm:flex-row sm:items-center"
      >
        {/* ช่องค้นหา */}
        <div className="relative flex-1">
          <svg
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z"
            />
          </svg>
          <input
            type="text"
            name="q"
            defaultValue={q}
            placeholder="ค้นหาชื่อสินค้า หรือ SKU..."
            className="w-full rounded-xl border py-2.5 pl-10 pr-3 text-sm outline-none focus:border-green-600 focus:ring-1 focus:ring-green-600"
          />
        </div>

        {/* ตัวกรองหมวดหมู่ */}
        <select
          name="categoryId"
          defaultValue={categoryId}
          className="rounded-xl border px-3 py-2.5 text-sm outline-none focus:border-green-600 focus:ring-1 focus:ring-green-600 sm:w-56"
        >
          <option value="">ทุกหมวดหมู่</option>
          {mainCategories.map((main) => {
            const children = categories.filter(
              (c) => c.parentId === main.id
            );
            return (
              <optgroup key={main.id} label={main.name}>
                <option value={main.id}>{main.name} (หมวดหมู่หลัก)</option>
                {children.map((child) => (
                  <option key={child.id} value={child.id}>
                    ↳ {child.name}
                  </option>
                ))}
              </optgroup>
            );
          })}
        </select>

        {/* ตัวกรองสถานะสต็อก */}
        <select
          name="stock"
          defaultValue={stock}
          className="rounded-xl border px-3 py-2.5 text-sm outline-none focus:border-green-600 focus:ring-1 focus:ring-green-600 sm:w-48"
        >
          <option value="all">สถานะสต็อกทั้งหมด</option>
          <option value="in">มีสินค้า (มากกว่า {LOW_STOCK_THRESHOLD})</option>
          <option value="low">ใกล้หมด (1-{LOW_STOCK_THRESHOLD})</option>
          <option value="out">หมดสต็อก</option>
        </select>

        <div className="flex gap-2">
          <button
            type="submit"
            className="rounded-xl bg-green-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-green-800"
          >
            ค้นหา
          </button>

          {hasActiveFilters && (
            <Link
              href="/admin/products"
              className="rounded-xl border px-5 py-2.5 text-sm font-semibold text-gray-600 transition hover:bg-gray-50"
            >
              ล้างตัวกรอง
            </Link>
          )}
        </div>
      </form>

      <div className="overflow-hidden rounded-xl border bg-white shadow">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-5 py-4 text-left text-sm font-semibold text-gray-600">
                สินค้า
              </th>

              <th className="px-5 py-4 text-left text-sm font-semibold text-gray-600">
                รหัสสินค้า (SKU)
              </th>

              <th className="px-5 py-4 text-left text-sm font-semibold text-gray-600">
                หมวดหมู่
              </th>

              <th className="px-5 py-4 text-left text-sm font-semibold text-gray-600">
                ราคา
              </th>

              <th className="px-5 py-4 text-left text-sm font-semibold text-gray-600">
                สต็อก
              </th>

              <th className="px-5 py-4 text-center text-sm font-semibold text-gray-600">
                จัดการ
              </th>
            </tr>
          </thead>

          <tbody>
            {products.map((product) => {
              const image = product.images[0];
              const category = product.category;

              return (
                <tr
                  key={product.id}
                  className="border-t hover:bg-gray-50"
                >
                  {/* สินค้า + รูปย่อ */}
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border bg-gray-100">
                        {image ? (
                          <Image
                            src={image.imageUrl}
                            alt={product.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-xs text-gray-400">
                            ไม่มีรูป
                          </div>
                        )}
                      </div>
                      <span className="font-medium text-gray-900">
                        {product.name}
                      </span>
                    </div>
                  </td>

                  {/* SKU */}
                  <td className="px-5 py-4 text-gray-600">
                    {product.sku}
                  </td>

                  {/* หมวดหมู่ */}
                  <td className="px-5 py-4">
                    {!category ? (
                      <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-500">
                        ไม่มีหมวดหมู่
                      </span>
                    ) : category.parent ? (
                      <div className="flex flex-col gap-1">
                        <span className="inline-flex w-fit items-center rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
                          {category.name}
                        </span>
                        <span className="text-xs text-gray-400">
                          หมวดหมู่ย่อยของ{" "}
                          <span className="font-medium text-gray-500">
                            {category.parent.name}
                          </span>
                        </span>
                      </div>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                        {category.name} (หมวดหมู่หลัก)
                      </span>
                    )}
                  </td>

                  {/* ราคา */}
                  <td className="px-5 py-4 font-medium text-gray-900">
                    ฿{product.price.toLocaleString("th-TH")}
                  </td>

                  {/* สต็อก */}
                  <td className="px-5 py-4">
                    <span
                      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                        product.stock === 0
                          ? "bg-red-100 text-red-700"
                          : product.stock <= LOW_STOCK_THRESHOLD
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {product.stock === 0
                        ? "หมดสต็อก"
                        : `${product.stock} ชิ้น`}
                    </span>
                  </td>

                  {/* จัดการ */}
                  <td className="px-5 py-4">
                    <div className="flex justify-center gap-3">
                      <Link
                        href={`/admin/products/${product.id}`}
                        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
                      >
                        แก้ไข
                      </Link>

                      <DeleteProductButton id={product.id} />
                    </div>
                  </td>
                </tr>
              );
            })}

            {products.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="py-10 text-center text-gray-500"
                >
                  {hasActiveFilters
                    ? "ไม่พบสินค้าที่ตรงกับเงื่อนไขที่เลือก"
                    : "ไม่พบสินค้าในระบบ"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}