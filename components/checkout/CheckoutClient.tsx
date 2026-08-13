"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

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
  isDefault: boolean;
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
  price: number;
  images: ProductImage[];
}

interface CartItem {
  id: string;
  quantity: number;
  product: Product;
}

interface Props {
  items: CartItem[];
}

const emptyAddressForm = {
  fullName: "",
  phone: "",
  address: "",
  subDistrict: "",
  district: "",
  province: "",
  postalCode: "",
  note: "",
  isDefault: false,
};

// =========================
// Thai Address (province -> district -> sub_district)
// =========================

interface SubDistrict {
  id: number;
  zip_code: number;
  name_th: string;
  name_en: string;
  district_id: number;
}

interface District {
  id: number;
  name_th: string;
  name_en: string;
  province_id: number;
  sub_districts: SubDistrict[];
}

interface Province {
  id: number;
  name_th: string;
  name_en: string;
  geography_id: number;
  districts: District[];
}

const THAI_ADDRESS_DATA_URL =
  "https://raw.githubusercontent.com/kongvut/thai-province-data/refs/heads/master/api/latest/province_with_district_and_sub_district.json";

export default function CheckoutClient({
  items,
}: Props) {
  const router = useRouter();

  // =========================
  // Address
  // =========================

  const [addresses, setAddresses] =
    useState<Address[]>([]);

  const [selectedAddressId, setSelectedAddressId] =
    useState("");

  const [loadingAddress, setLoadingAddress] =
    useState(true);

  // =========================
  // Add New Address (inline form)
  // =========================

  const [showAddressForm, setShowAddressForm] =
    useState(false);

  const [addressForm, setAddressForm] =
    useState(emptyAddressForm);

  const [savingAddress, setSavingAddress] =
    useState(false);

  // ข้อมูล จังหวัด/อำเภอ/ตำบล/รหัสไปรษณีย์ ของประเทศไทย
  // เลือกจังหวัด -> อำเภอ -> ตำบล แล้วรหัสไปรษณีย์จะเติมให้อัตโนมัติ
  const [addressData, setAddressData] =
    useState<Province[]>([]);

  const [addressDataError, setAddressDataError] =
    useState(false);

  // กันไม่ให้ยิง fetch ซ้ำเมื่อเปิดฟอร์มหลายครั้ง (ไม่ใช้ state
  // เพื่อเลี่ยงการเรียก setState แบบ synchronous ใน effect)
  const hasFetchedAddressDataRef = useRef(false);

  const [selectedProvinceId, setSelectedProvinceId] =
    useState<number | "">("");

  const [selectedDistrictId, setSelectedDistrictId] =
    useState<number | "">("");

  const [selectedSubDistrictId, setSelectedSubDistrictId] =
    useState<number | "">("");

  // กำลังโหลดอยู่ ก็ต่อเมื่อเปิดฟอร์มแล้ว ยังไม่มีข้อมูล และยังไม่ error
  const loadingAddressData =
    showAddressForm &&
    addressData.length === 0 &&
    !addressDataError;

  useEffect(() => {
    if (
      !showAddressForm ||
      hasFetchedAddressDataRef.current
    ) {
      return;
    }

    hasFetchedAddressDataRef.current = true;

    let cancelled = false;

    fetch(THAI_ADDRESS_DATA_URL)
      .then((res) => {
        if (!res.ok) {
          throw new Error(
            `โหลดข้อมูลไม่สำเร็จ (status ${res.status})`
          );
        }

        return res.json();
      })
      .then((data: Province[]) => {
        if (!cancelled) {
          setAddressData(data);
        }
      })
      .catch((error) => {
        if (!cancelled) {
          console.error(error);

          setAddressDataError(true);

          alert(
            "โหลดข้อมูลจังหวัด/อำเภอ/ตำบลไม่สำเร็จ"
          );
        }
      });

    return () => {
      cancelled = true;
    };
  }, [showAddressForm]);

  const districts = useMemo(() => {
    const province = addressData.find(
      (p) => p.id === selectedProvinceId
    );

    return province?.districts ?? [];
  }, [addressData, selectedProvinceId]);

  const subDistricts = useMemo(() => {
    const district = districts.find(
      (d) => d.id === selectedDistrictId
    );

    return district?.sub_districts ?? [];
  }, [districts, selectedDistrictId]);

  // =========================
  // Slip
  // =========================

  const [slipFile, setSlipFile] =
    useState<File | null>(null);

  const [slipUrl, setSlipUrl] =
    useState("");

  const [uploadingSlip, setUploadingSlip] =
    useState(false);

  // =========================
  // Order
  // =========================

  const [placingOrder, setPlacingOrder] =
    useState(false);

  // =========================
  // Load Address
  // =========================

  async function loadAddresses() {
    try {
      const res = await fetch(
        "/api/addresses"
      );

      if (!res.ok) {
        throw new Error(
          "Failed to load addresses"
        );
      }

      const data =
        await res.json();

      setAddresses(data);

      return data as Address[];
    } catch (error) {
      console.error(error);

      alert(
        "ไม่สามารถโหลดที่อยู่จัดส่งได้"
      );

      return [];
    } finally {
      setLoadingAddress(false);
    }
  }

  useEffect(() => {
    async function init() {
      const data = await loadAddresses();

      // เลือก Default Address อัตโนมัติ
      const defaultAddress =
        data.find(
          (address: Address) =>
            address.isDefault
        );

      if (defaultAddress) {
        setSelectedAddressId(
          defaultAddress.id
        );
      }
    }

    init();
  }, []);

  // =========================
  // Total
  // =========================

  const total = items.reduce(
    (sum, item) =>
      sum +
      item.product.price *
        item.quantity,
    0
  );

  // ค่าจัดส่ง
  const shippingFee = 50;

  // ยอดรวมทั้งหมด (สินค้า + ค่าจัดส่ง)
  const grandTotal = total + shippingFee;

  // =========================
  // Add New Address Handlers
  // =========================

  function handleAddressFormChange(
    field: keyof typeof emptyAddressForm,
    value: string | boolean
  ) {
    setAddressForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  function handleCancelAddressForm() {
    setShowAddressForm(false);
    setAddressForm(emptyAddressForm);
    setSelectedProvinceId("");
    setSelectedDistrictId("");
    setSelectedSubDistrictId("");
  }

  function handleProvinceChange(
    e: React.ChangeEvent<HTMLSelectElement>
  ) {
    const id = e.target.value
      ? Number(e.target.value)
      : "";

    const province = addressData.find(
      (p) => p.id === id
    );

    setSelectedProvinceId(id);
    setSelectedDistrictId("");
    setSelectedSubDistrictId("");

    setAddressForm((prev) => ({
      ...prev,
      province: province?.name_th ?? "",
      district: "",
      subDistrict: "",
      postalCode: "",
    }));
  }

  function handleDistrictChange(
    e: React.ChangeEvent<HTMLSelectElement>
  ) {
    const id = e.target.value
      ? Number(e.target.value)
      : "";

    const district = districts.find(
      (d) => d.id === id
    );

    setSelectedDistrictId(id);
    setSelectedSubDistrictId("");

    setAddressForm((prev) => ({
      ...prev,
      district: district?.name_th ?? "",
      subDistrict: "",
      postalCode: "",
    }));
  }

  function handleSubDistrictChange(
    e: React.ChangeEvent<HTMLSelectElement>
  ) {
    const id = e.target.value
      ? Number(e.target.value)
      : "";

    const subDistrict = subDistricts.find(
      (s) => s.id === id
    );

    setSelectedSubDistrictId(id);

    setAddressForm((prev) => ({
      ...prev,
      subDistrict: subDistrict?.name_th ?? "",
      postalCode: subDistrict
        ? String(subDistrict.zip_code)
        : "",
    }));
  }

  async function handleSaveNewAddress() {
    const {
      fullName,
      phone,
      address,
      subDistrict,
      district,
      province,
      postalCode,
    } = addressForm;

    if (
      !fullName.trim() ||
      !phone.trim() ||
      !address.trim() ||
      !subDistrict.trim() ||
      !district.trim() ||
      !province.trim() ||
      !postalCode.trim()
    ) {
      alert(
        "กรุณากรอกข้อมูลที่อยู่ให้ครบถ้วน"
      );

      return;
    }

    setSavingAddress(true);

    try {
      const res = await fetch(
        "/api/addresses",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify(
            addressForm
          ),
        }
      );

      const data =
        await res.json();

      if (!res.ok) {
        alert(
          data.message ||
            "ไม่สามารถบันทึกที่อยู่ได้"
        );

        return;
      }

      const updatedList =
        await loadAddresses();

      const newAddress =
        data.address || data;

      if (newAddress?.id) {
        setSelectedAddressId(
          newAddress.id
        );
      } else if (
        updatedList.length > 0
      ) {
        setSelectedAddressId(
          updatedList[
            updatedList.length - 1
          ].id
        );
      }

      alert(
        "เพิ่มที่อยู่จัดส่งเรียบร้อยแล้ว"
      );

      handleCancelAddressForm();
    } catch (error) {
      console.error(
        "Save Address Error:",
        error
      );

      alert(
        "เกิดข้อผิดพลาดในการบันทึกที่อยู่"
      );
    } finally {
      setSavingAddress(false);
    }
  }

  // =========================
  // Upload Slip
  // =========================

  async function handleUploadSlip() {
    if (!slipFile) {
      alert(
        "กรุณาเลือกรูปสลิปก่อน"
      );

      return;
    }

    // ตรวจสอบประเภทไฟล์
    if (
      !slipFile.type.startsWith("image/")
    ) {
      alert(
        "กรุณาเลือกไฟล์รูปภาพเท่านั้น"
      );

      setSlipFile(null);
      return;
    }

    // จำกัดขนาด 5MB
    if (
      slipFile.size >
      5 * 1024 * 1024
    ) {
      alert(
        "ไฟล์สลิปต้องมีขนาดไม่เกิน 5MB"
      );

      setSlipFile(null);
      return;
    }

    setUploadingSlip(true);

    try {
      const formData =
        new FormData();

      formData.append(
        "file",
        slipFile
      );

      const res = await fetch(
        "/api/upload/slip",
        {
          method: "POST",
          body: formData,
        }
      );

      const data =
        await res.json();

      if (!res.ok) {
        alert(
          data.message ||
            "ไม่สามารถอัปโหลดสลิปได้"
        );

        setSlipFile(null);
        return;
      }

      setSlipUrl(
        data.slipUrl || data.url
      );

      alert(
        "อัปโหลดสลิปสำเร็จ"
      );
    } catch (error) {
      console.error(
        "Upload Slip Error:",
        error
      );

      setSlipFile(null);

      setSlipUrl("");

      alert(
        "เกิดข้อผิดพลาดในการอัปโหลดสลิป"
      );
    } finally {
      setUploadingSlip(false);
    }
  }

  function handleSlipChange(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    const file =
      e.target.files?.[0];

    if (!file) {
      return;
    }

    setSlipFile(file);
    setSlipUrl("");
  }

  // =========================
  // Place Order
  // =========================

  async function handlePlaceOrder() {
    // =========================
    // ตรวจสอบ Address
    // =========================

    if (!selectedAddressId) {
      alert(
        "กรุณาเลือกที่อยู่จัดส่งก่อนสั่งซื้อ"
      );

      return;
    }

    // =========================
    // ตรวจสอบ Slip
    // =========================

    if (!slipUrl) {
      alert(
        "กรุณาอัปโหลดสลิปการโอนเงินก่อนสั่งซื้อ"
      );

      return;
    }

    setPlacingOrder(true);

    try {
      const res = await fetch(
        "/api/orders",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            addressId:
              selectedAddressId,

            slipUrl,

            shippingFee,

            totalAmount: grandTotal,
          }),
        }
      );

      const data =
        await res.json();

      if (!res.ok) {
        alert(
          data.message ||
            "ไม่สามารถสร้างคำสั่งซื้อได้"
        );

        return;
      }

      alert(
        "สั่งซื้อสินค้าเรียบร้อยแล้ว"
      );

      // ไปหน้า Order Success
      router.push(
        `/order/success/${data.order.id}`
      );

      router.refresh();
    } catch (error) {
      console.error(
        "Place Order Error:",
        error
      );

      alert(
        "เกิดข้อผิดพลาด กรุณาลองใหม่"
      );
    } finally {
      setPlacingOrder(false);
    }
  }

  // =========================
  // Button Disabled
  // =========================

  const canPlaceOrder =
    Boolean(
      selectedAddressId &&
      slipUrl &&
      !uploadingSlip &&
      !placingOrder
    );

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">
            เช็คเอาท์
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            ตรวจสอบสินค้า เลือกที่อยู่ และชำระเงิน
          </p>
        </div>

        {/* ========================= */}
        {/* 3 Columns: Address | Payment | Items + Summary */}
        {/* ========================= */}

        <div className="grid gap-6 lg:grid-cols-3">

          {/* ========================= */}
          {/* COLUMN 1 — Shipping Address */}
          {/* ========================= */}

          <div className="rounded-2xl bg-white p-5 shadow-sm">

            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">
                ที่อยู่จัดส่ง
              </h2>

              <div className="flex items-center gap-3">

                <button
                  type="button"
                  onClick={() =>
                    setShowAddressForm(
                      (prev) => !prev
                    )
                  }
                  className="text-xs font-semibold text-green-700 hover:underline"
                >
                  {showAddressForm
                    ? "ยกเลิก"
                    : "+ เพิ่มที่อยู่ใหม่"}
                </button>

                <Link
                  href="profile/address"
                  className="text-xs font-semibold text-green-700 hover:underline"
                >
                  จัดการที่อยู่
                </Link>

              </div>

            </div>

            {/* ========================= */}
            {/* Add New Address Form */}
            {/* ========================= */}

            {showAddressForm && (
              <div className="mt-4 rounded-xl border border-green-200 bg-green-50/40 p-4">

                <h3 className="mb-3 text-sm font-bold text-gray-900">
                  กรอกที่อยู่จัดส่งใหม่
                </h3>

                <div className="grid gap-3">

                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-700">
                      ชื่อ-นามสกุล
                    </label>
                    <input
                      type="text"
                      value={addressForm.fullName}
                      onChange={(e) =>
                        handleAddressFormChange(
                          "fullName",
                          e.target.value
                        )
                      }
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-green-600 focus:outline-none"
                      placeholder="ชื่อ-นามสกุลผู้รับ"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-700">
                      เบอร์โทรศัพท์
                    </label>
                    <input
                      type="tel"
                      value={addressForm.phone}
                      onChange={(e) =>
                        handleAddressFormChange(
                          "phone",
                          e.target.value
                        )
                      }
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-green-600 focus:outline-none"
                      placeholder="08XXXXXXXX"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-700">
                      ที่อยู่ (บ้านเลขที่ / หมู่บ้าน / ถนน)
                    </label>
                    <input
                      type="text"
                      value={addressForm.address}
                      onChange={(e) =>
                        handleAddressFormChange(
                          "address",
                          e.target.value
                        )
                      }
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-green-600 focus:outline-none"
                      placeholder="บ้านเลขที่ ถนน หมู่บ้าน"
                    />
                  </div>

                  {/* ========================= */}
                  {/* จังหวัด -> อำเภอ -> ตำบล -> รหัสไปรษณีย์ (เชื่อมกัน) */}
                  {/* ========================= */}

                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-700">
                      จังหวัด
                    </label>
                    <select
                      value={selectedProvinceId}
                      onChange={handleProvinceChange}
                      disabled={loadingAddressData}
                      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-green-600 focus:outline-none disabled:bg-gray-50 disabled:text-gray-400"
                    >
                      <option value="">
                        {loadingAddressData
                          ? "กำลังโหลดจังหวัด..."
                          : "เลือกจังหวัด"}
                      </option>
                      {addressData.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name_th}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-700">
                      อำเภอ/เขต
                    </label>
                    <select
                      value={selectedDistrictId}
                      onChange={handleDistrictChange}
                      disabled={!selectedProvinceId}
                      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-green-600 focus:outline-none disabled:bg-gray-50 disabled:text-gray-400"
                    >
                      <option value="">
                        {selectedProvinceId
                          ? "เลือกอำเภอ/เขต"
                          : "กรุณาเลือกจังหวัดก่อน"}
                      </option>
                      {districts.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name_th}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-700">
                      ตำบล/แขวง
                    </label>
                    <select
                      value={selectedSubDistrictId}
                      onChange={handleSubDistrictChange}
                      disabled={!selectedDistrictId}
                      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-green-600 focus:outline-none disabled:bg-gray-50 disabled:text-gray-400"
                    >
                      <option value="">
                        {selectedDistrictId
                          ? "เลือกตำบล/แขวง"
                          : "กรุณาเลือกอำเภอก่อน"}
                      </option>
                      {subDistricts.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name_th}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-700">
                      รหัสไปรษณีย์
                    </label>
                    <input
                      type="text"
                      value={addressForm.postalCode}
                      readOnly
                      placeholder="เติมอัตโนมัติจากตำบล"
                      className="w-full rounded-lg border border-gray-200 bg-gray-100 px-3 py-2 text-sm text-gray-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-700">
                      หมายเหตุ (ถ้ามี)
                    </label>
                    <input
                      type="text"
                      value={addressForm.note}
                      onChange={(e) =>
                        handleAddressFormChange(
                          "note",
                          e.target.value
                        )
                      }
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-green-600 focus:outline-none"
                      placeholder="เช่น ฝากไว้กับยาม"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      id="isDefault"
                      type="checkbox"
                      checked={addressForm.isDefault}
                      onChange={(e) =>
                        handleAddressFormChange(
                          "isDefault",
                          e.target.checked
                        )
                      }
                      className="h-4 w-4 accent-green-700"
                    />
                    <label
                      htmlFor="isDefault"
                      className="text-xs text-gray-700"
                    >
                      ตั้งเป็นที่อยู่เริ่มต้น
                    </label>
                  </div>

                </div>

                <div className="mt-4 flex gap-2">

                  <button
                    type="button"
                    onClick={handleSaveNewAddress}
                    disabled={savingAddress}
                    className="rounded-xl bg-green-700 px-4 py-2 text-xs font-semibold text-white transition hover:bg-green-800 disabled:cursor-not-allowed disabled:bg-gray-300"
                  >
                    {savingAddress
                      ? "กำลังบันทึก..."
                      : "บันทึกที่อยู่"}
                  </button>

                  <button
                    type="button"
                    onClick={handleCancelAddressForm}
                    disabled={savingAddress}
                    className="rounded-xl border border-gray-300 px-4 py-2 text-xs font-semibold text-gray-600 transition hover:bg-gray-50"
                  >
                    ยกเลิก
                  </button>

                </div>

              </div>
            )}

            {loadingAddress ? (
              <div className="mt-4 rounded-xl bg-gray-50 p-5 text-center text-sm text-gray-500">
                กำลังโหลดที่อยู่...
              </div>
            ) : addresses.length === 0 ? (
              !showAddressForm && (
                <div className="mt-4 rounded-xl border border-dashed p-6 text-center">

                  <p className="text-sm text-gray-500">
                    ยังไม่มีที่อยู่จัดส่ง
                  </p>

                  <button
                    type="button"
                    onClick={() =>
                      setShowAddressForm(true)
                    }
                    className="mt-3 inline-block rounded-xl bg-green-700 px-5 py-2.5 text-sm font-semibold text-white"
                  >
                    เพิ่มที่อยู่
                  </button>

                </div>
              )
            ) : (
              <div className="mt-4 space-y-3">

                {addresses.map(
                  (address) => (
                    <label
                      key={address.id}
                      className={`block cursor-pointer rounded-xl border p-4 text-sm transition ${
                        selectedAddressId ===
                        address.id
                          ? "border-green-700 bg-green-50 ring-2 ring-green-700"
                          : "border-gray-200 hover:border-green-500"
                      }`}
                    >

                      <div className="flex gap-3">

                        <input
                          type="radio"
                          name="shippingAddress"
                          value={
                            address.id
                          }
                          checked={
                            selectedAddressId ===
                            address.id
                          }
                          onChange={() =>
                            setSelectedAddressId(
                              address.id
                            )
                          }
                          className="mt-1 h-4 w-4 accent-green-700"
                        />

                        <div className="flex-1">

                          <div className="flex flex-wrap items-center gap-2">

                            <h3 className="font-bold">
                              {
                                address.fullName
                              }
                            </h3>

                            {address.isDefault && (
                              <span className="rounded-full bg-green-100 px-2 py-0.5 text-[11px] font-semibold text-green-700">
                                ที่อยู่เริ่มต้น
                              </span>
                            )}

                          </div>

                          <p className="mt-1 text-xs text-gray-600">
                            โทร{" "}
                            {
                              address.phone
                            }
                          </p>

                          <p className="mt-1 leading-6 text-xs text-gray-600">
                            {
                              address.address
                            }{" "}
                            ต.
                            {
                              address.subDistrict
                            }{" "}
                            อ.
                            {
                              address.district
                            }{" "}
                            จ.
                            {
                              address.province
                            }{" "}
                            {
                              address.postalCode
                            }
                          </p>

                          {address.note && (
                            <p className="mt-1 text-xs text-gray-500">
                              หมายเหตุ:{" "}
                              {
                                address.note
                              }
                            </p>
                          )}

                        </div>

                      </div>

                    </label>
                  )
                )}

              </div>
            )}

          </div>

          {/* ========================= */}
          {/* COLUMN 2 — Payment */}
          {/* ========================= */}

          <div className="rounded-2xl bg-white p-5 shadow-sm">

            <h2 className="text-lg font-bold">
              การชำระเงิน
            </h2>

            <p className="mt-1 text-xs text-gray-500">
              กรุณาโอนเงินตามข้อมูลด้านล่าง
            </p>

            {/* Bank Account */}
            <div className="mt-4 rounded-xl border bg-gray-50 p-4">

              <h3 className="text-sm font-bold">
                โอนเงินเข้าบัญชี
              </h3>

              <div className="mt-3 space-y-1.5 text-sm">

                <p>
                  <span className="font-semibold">
                    ธนาคาร:
                  </span>{" "}
                  กสิกรไทย
                </p>

                <p>
                  <span className="font-semibold">
                    ชื่อบัญชี:
                  </span>{" "}
                  บริษัท บี-ลอง เทรดดิ้ง จำกัด
                </p>

                <p>
                  <span className="font-semibold">
                    เลขบัญชี:
                  </span>{" "}
                  123-4-56789-0
                </p>

                <p>
                  <span className="font-semibold">
                    ยอดสินค้า:
                  </span>{" "}
                  ฿{total.toLocaleString()}
                </p>

                <p>
                  <span className="font-semibold">
                    ค่าจัดส่ง:
                  </span>{" "}
                  ฿{shippingFee.toLocaleString()}
                </p>

                <p>
                  <span className="font-semibold">
                    ยอดชำระ:
                  </span>{" "}
                  <span className="font-bold text-green-700">
                    ฿
                    {grandTotal.toLocaleString()}
                  </span>
                </p>

              </div>

            </div>

            {/* QR Code */}
            <div className="mt-4">

              <h3 className="mb-3 text-sm font-bold">
                สแกน QR Code เพื่อชำระเงิน
              </h3>

              <div className="flex justify-center rounded-xl border bg-white p-4">

                <Image
                  src="/payment/qr-code.jpeg"
                  alt="QR Code สำหรับชำระเงิน"
                  width={220}
                  height={220}
                  className="h-auto w-full max-w-56"
                />

              </div>

            </div>

            {/* Upload Slip */}
            <div className="mt-6">

              <h3 className="text-sm font-bold">
                อัปโหลดสลิปการโอนเงิน
              </h3>

              <p className="mt-1 text-xs text-gray-500">
                กรุณาอัปโหลดรูปสลิปหลังจากโอนเงินเรียบร้อยแล้ว
              </p>

              <div className="mt-3 rounded-xl border-2 border-dashed border-gray-300 p-4">

                <input
                  type="file"
                  accept="image/*"
                  onChange={
                    handleSlipChange
                  }
                  className="block w-full text-xs text-gray-600"
                />

                {slipFile && (
                  <div className="mt-3 rounded-lg bg-gray-50 p-3">

                    <p className="text-xs font-semibold">
                      ไฟล์ที่เลือก:
                    </p>

                    <p className="mt-1 break-all text-xs text-gray-500">
                      {slipFile.name}
                    </p>

                  </div>
                )}

                <button
                  type="button"
                  onClick={
                    handleUploadSlip
                  }
                  disabled={
                    !slipFile ||
                    uploadingSlip
                  }
                  className="mt-4 w-full rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300"
                >
                  {uploadingSlip
                    ? "กำลังอัปโหลดสลิป..."
                    : slipUrl
                    ? "อัปโหลดสลิปใหม่"
                    : "อัปโหลดสลิป"}
                </button>

                {/* Upload Success */}
                {slipUrl && (
                  <div className="mt-4 rounded-lg border border-green-300 bg-green-50 p-3">

                    <p className="text-sm font-semibold text-green-700">
                      ✓ อัปโหลดสลิปเรียบร้อยแล้ว
                    </p>

                    <p className="mt-1 text-xs text-green-600">
                      สามารถกดสั่งซื้อได้
                    </p>

                  </div>
                )}

              </div>

            </div>

          </div>

          {/* ========================= */}
          {/* COLUMN 3 — Order Items + Order Summary */}
          {/* ========================= */}

          <div className="space-y-6">

            {/* Order Items */}
            <div className="rounded-2xl bg-white p-5 shadow-sm">

              <h2 className="mb-4 text-lg font-bold">
                รายการสินค้า
              </h2>

              <div className="max-h-80 space-y-4 overflow-y-auto pr-1">

                {items.map((item) => {

                  const image =
                    item.product.images[0]
                      ?.imageUrl;

                  const itemTotal =
                    item.product.price *
                    item.quantity;

                  return (
                    <div
                      key={item.id}
                      className="flex gap-3 border-b pb-4 last:border-b-0 last:pb-0"
                    >

                      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-gray-100">

                        {image ? (
                          <Image
                            src={image}
                            alt={
                              item.product.name
                            }
                            fill
                            sizes="64px"
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-[10px] text-gray-400">
                            ไม่มีรูปภาพ
                          </div>
                        )}

                      </div>

                      <div className="flex flex-1 flex-col justify-between">

                        <div>

                          <h3 className="text-sm font-semibold text-gray-900">
                            {
                              item.product.name
                            }
                          </h3>

                          <p className="mt-0.5 text-xs text-gray-500">
                            รหัสสินค้า:{" "}
                            {
                              item.product.sku
                            }
                          </p>

                        </div>

                        <div className="mt-2 flex items-center justify-between">

                          <p className="text-xs text-gray-500">
                            จำนวน{" "}
                            {
                              item.quantity
                            }
                          </p>

                          <p className="text-sm font-bold text-green-700">
                            ฿
                            {itemTotal.toLocaleString()}
                          </p>

                        </div>

                      </div>

                    </div>
                  );
                })}

              </div>

            </div>

            {/* Order Summary */}
            <div className="rounded-2xl bg-white p-5 shadow-sm">

              <h2 className="text-lg font-bold">
                สรุปคำสั่งซื้อ
              </h2>

              <div className="mt-4 space-y-2.5 text-sm">

                <div className="flex justify-between text-gray-600">

                  <span>
                    สินค้า
                  </span>

                  <span>
                    {items.length} รายการ
                  </span>

                </div>

                <div className="flex justify-between text-gray-600">

                  <span>
                    ยอดสินค้ารวม
                  </span>

                  <span>
                    ฿{total.toLocaleString()}
                  </span>

                </div>

                <div className="flex justify-between text-gray-600">

                  <span>
                    ค่าจัดส่ง
                  </span>

                  <span>
                    ฿{shippingFee.toLocaleString()}
                  </span>

                </div>

                <div className="border-t pt-3">

                  <div className="flex items-center justify-between">

                    <span className="font-semibold">
                      ยอดรวมทั้งหมด
                    </span>

                    <span className="text-xl font-bold text-green-700">
                      ฿
                      {grandTotal.toLocaleString()}
                    </span>

                  </div>

                </div>

              </div>

              {/* Place Order */}
              <button
                type="button"
                onClick={
                  handlePlaceOrder
                }
                disabled={
                  !canPlaceOrder
                }
                className="mt-6 w-full rounded-xl bg-green-700 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-green-800 disabled:cursor-not-allowed disabled:bg-gray-300"
              >
                {placingOrder
                  ? "กำลังสร้างคำสั่งซื้อ..."
                  : "สั่งซื้อสินค้า"}
              </button>

              {/* Status */}
              {!selectedAddressId && (
                <p className="mt-3 text-center text-xs text-red-500">
                  กรุณาเลือกที่อยู่จัดส่งก่อน
                </p>
              )}

              {selectedAddressId &&
                !slipUrl && (
                  <p className="mt-3 text-center text-xs text-red-500">
                    กรุณาอัปโหลดสลิปการโอนเงินก่อน
                  </p>
                )}

              {uploadingSlip && (
                <p className="mt-3 text-center text-xs text-blue-600">
                  กำลังอัปโหลดสลิป กรุณารอสักครู่...
                </p>
              )}

              {selectedAddressId &&
                slipUrl &&
                !placingOrder && (
                  <p className="mt-3 text-center text-xs text-green-600">
                    ✓ พร้อมสั่งซื้อ
                  </p>
                )}

              <Link
                href="/cart"
                className="mt-4 block text-center text-sm text-green-700 hover:underline"
              >
                แก้ไขตะกร้าสินค้า
              </Link>

            </div>

            {/* ========================= */}
            {/* Policy: ยกเลิก / คืน-เปลี่ยนสินค้า */}
            {/* ========================= */}

            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5 text-xs text-gray-600">

              <h3 className="text-sm font-bold text-gray-900">
                นโยบายการยกเลิก และการคืน/เปลี่ยนสินค้า
              </h3>

              <ul className="mt-3 list-disc space-y-2 pl-4 leading-5">

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
                  Account พร้อมแจ้งหมายเลขคำสั่งซื้อ เพื่อให้เจ้าหน้าที่ดำเนินการให้
                </li>

              </ul>

            </div>

          </div>

        </div>

        <Link
          href="/cart"
          className="mt-6 inline-block text-sm text-green-700 hover:underline"
        >
          ← กลับไปที่ตะกร้า
        </Link>

      </div>
    </main>
  );
}