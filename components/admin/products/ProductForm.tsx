"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import ImageUploader from "./ImageUploader";

interface Category {
  id: string;
  name: string;
  parentId: string | null;
  parent?: {
    id: string;
    name: string;
  } | null;
}

interface Product {
  id: string;
  name: string;
  sku: string;
  description: string;
  price: number;
  stock: number;
  categoryId: string;
  images: {
    imageUrl: string;
  }[];
}

interface Props {
  categories: Category[];
  product?: Product;
}

export default function ProductForm({ categories, product }: Props) {
  const router = useRouter();

  const isEdit = !!product;

  const [loading, setLoading] = useState(false);

  const [name, setName] = useState(product?.name ?? "");
  const [sku, setSku] = useState(product?.sku ?? "");
  const [description, setDescription] = useState(product?.description ?? "");
  const [categoryId, setCategoryId] = useState(product?.categoryId ?? "");
  const [price, setPrice] = useState(product?.price.toString() ?? "");
  const [stock, setStock] = useState(product?.stock.toString() ?? "");

  const [files, setFiles] = useState<File[]>([]);
  const [oldImages, setOldImages] = useState<string[]>(
    product?.images.map((i) => i.imageUrl) ?? []
  );

  // แยกหมวดหมู่หลัก (ไม่มี parent) ออกมาก่อน เพื่อจัดกลุ่มแสดงผล
  const mainCategories = categories.filter((c) => !c.parentId);

  // หมวดหมู่ที่เลือกอยู่ตอนนี้ ใช้แสดง badge สถานะด้านล่าง select
  const selectedCategory = categories.find((c) => c.id === categoryId);

  function getCategoryStatusLabel(category?: Category) {
    if (!category) {
      return { text: "ยังไม่ได้เลือกหมวดหมู่", color: "text-gray-400" };
    }
    if (!category.parentId) {
      return {
        text: `${category.name} — เป็นหมวดหมู่หลัก`,
        color: "text-green-600",
      };
    }
    const parentName = category.parent?.name ?? "ไม่ทราบหมวดหลัก";
    return {
      text: `${category.name} — เป็นหมวดหมู่ย่อยของ "${parentName}"`,
      color: "text-blue-600",
    };
  }

  const categoryStatus = getCategoryStatusLabel(selectedCategory);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!categoryId) {
      alert("กรุณาเลือกหมวดหมู่สินค้า");
      return;
    }

    setLoading(true);

    try {
      const imageUrls = [...oldImages];

      for (const file of files) {
        const formData = new FormData();
        formData.append("file", file);

        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!uploadRes.ok) {
          throw new Error("Upload failed");
        }

        const uploadData = await uploadRes.json();
        imageUrls.push(uploadData.url);
      }

      const url = isEdit
        ? `/api/admin/products/${product!.id}`
        : "/api/admin/products";

      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          sku,
          description,
          categoryId,
          price: Number(price),
          stock: Number(stock),
          images: imageUrls,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message ?? "เกิดข้อผิดพลาด");
        return;
      }

      router.push("/admin/products");
      router.refresh();
    } catch (error) {
      console.error(error);
      alert("บันทึกสินค้าไม่สำเร็จ กรุณาลองใหม่อีกครั้ง");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-8 rounded-2xl bg-white p-8 shadow"
    >
      {/* ส่วนหัว */}
      <div className="border-b pb-4">
        <h2 className="text-xl font-bold text-gray-900">
          {isEdit ? "แก้ไขข้อมูลสินค้า" : "เพิ่มสินค้าใหม่"}
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          กรอกข้อมูลสินค้าให้ครบถ้วน แล้วกดบันทึกด้านล่าง
        </p>
      </div>

      {/* ข้อมูลพื้นฐาน */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div>
          <label className="text-sm font-medium text-gray-700">
            ชื่อสินค้า <span className="text-red-500">*</span>
          </label>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="เช่น เสื้อยืดคอกลม สีดำ"
            className="mt-2 w-full rounded-xl border p-3 outline-none focus:border-green-600 focus:ring-1 focus:ring-green-600"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700">
            รหัสสินค้า (SKU) <span className="text-red-500">*</span>
          </label>
          <input
            required
            value={sku}
            onChange={(e) => setSku(e.target.value)}
            placeholder="เช่น TS-BLK-001"
            className="mt-2 w-full rounded-xl border p-3 outline-none focus:border-green-600 focus:ring-1 focus:ring-green-600"
          />
        </div>
      </div>

      {/* หมวดหมู่ */}
      <div>
        <label className="text-sm font-medium text-gray-700">
          หมวดหมู่สินค้า <span className="text-red-500">*</span>
        </label>

        <select
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          className="mt-2 w-full rounded-xl border p-3 outline-none focus:border-green-600 focus:ring-1 focus:ring-green-600"
        >
          <option value="">— เลือกหมวดหมู่ —</option>

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

        {/* บอกสถานะหมวดหมู่ที่เลือกอยู่ */}
        <p className={`mt-2 text-xs font-medium ${categoryStatus.color}`}>
          {categoryStatus.text}
        </p>
      </div>

      {/* ราคา / สต็อก */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div>
          <label className="text-sm font-medium text-gray-700">
            ราคา (บาท) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            min={0}
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="0.00"
            className="mt-2 w-full rounded-xl border p-3 outline-none focus:border-green-600 focus:ring-1 focus:ring-green-600"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700">
            จำนวนสต็อก <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            min={0}
            value={stock}
            onChange={(e) => setStock(e.target.value)}
            placeholder="0"
            className="mt-2 w-full rounded-xl border p-3 outline-none focus:border-green-600 focus:ring-1 focus:ring-green-600"
          />
        </div>
      </div>

      {/* รายละเอียดสินค้า */}
      <div>
        <label className="text-sm font-medium text-gray-700">
          รายละเอียดสินค้า
        </label>
        <textarea
          rows={8}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="อธิบายรายละเอียด วัสดุ ขนาด วิธีใช้งาน ฯลฯ"
          className="mt-2 w-full rounded-xl border p-3 outline-none focus:border-green-600 focus:ring-1 focus:ring-green-600"
        />
      </div>

      {/* รูปภาพเดิม */}
      {oldImages.length > 0 && (
        <div>
          <label className="mb-3 block text-sm font-medium text-gray-700">
            รูปภาพปัจจุบัน
          </label>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {oldImages.map((url) => (
              <div
                key={url}
                className="group relative aspect-square overflow-hidden rounded-xl border"
              >
                <Image
                  src={url}
                  alt="รูปสินค้า"
                  fill
                  className="object-cover"
                />
                <button
                  type="button"
                  onClick={() =>
                    setOldImages(oldImages.filter((img) => img !== url))
                  }
                  className="absolute right-2 top-2 z-10 rounded-full bg-red-600 px-2 py-1 text-xs font-medium text-white shadow hover:bg-red-700"
                >
                  ลบ ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* อัปโหลดรูปเพิ่ม */}
      <div>
        <label className="text-sm font-medium text-gray-700">
          เพิ่มรูปภาพใหม่
        </label>
        <div className="mt-2">
          <ImageUploader files={files} setFiles={setFiles} />
        </div>
      </div>

      {/* ปุ่มบันทึก */}
      <div className="flex items-center gap-4 border-t pt-6">
        <button
          type="submit"
          disabled={loading}
          className="rounded-xl bg-green-700 px-8 py-3 font-semibold text-white transition hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading
            ? "กำลังบันทึก..."
            : isEdit
            ? "บันทึกการแก้ไข"
            : "บันทึกสินค้า"}
        </button>

        <button
          type="button"
          onClick={() => router.push("/admin/products")}
          className="rounded-xl border px-8 py-3 font-semibold text-gray-600 transition hover:bg-gray-50"
        >
          ยกเลิก
        </button>
      </div>
    </form>
  );
}