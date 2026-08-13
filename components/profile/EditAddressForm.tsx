"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  Phone,
  MapPin,
  Landmark,
  StickyNote,
  Star,
  Loader2,
} from "lucide-react";

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

interface Props {
  address: {
    id: string;
    fullName: string;
    phone: string;
    address: string;
    province: string;
    district: string;
    subDistrict: string;
    postalCode: string;
    note: string | null;
    isDefault: boolean;
  };
}

export default function EditAddressForm({ address }: Props) {
  const router = useRouter();

  const [form, setForm] = useState(address);
  const [loading, setLoading] = useState(false);

  const [addressData, setAddressData] = useState<Province[]>([]);
  const [loadingAddressData, setLoadingAddressData] = useState(true);

  const [selectedProvinceId, setSelectedProvinceId] = useState<number | "">("");
  const [selectedDistrictId, setSelectedDistrictId] = useState<number | "">("");
  const [selectedSubDistrictId, setSelectedSubDistrictId] = useState<number | "">("");

  useEffect(() => {
    let cancelled = false;

    fetch(THAI_ADDRESS_DATA_URL)
      .then((res) => {
        if (!res.ok) throw new Error(`โหลดข้อมูลไม่สำเร็จ (status ${res.status})`);
        return res.json();
      })
      .then((data: Province[]) => {
        if (cancelled) return;

        setAddressData(data);

        const province = data.find((p) => p.name_th === address.province);
        const district = province?.districts.find(
          (d) => d.name_th === address.district
        );
        const subDistrict = district?.sub_districts.find(
          (s) => s.name_th === address.subDistrict
        );

        if (province) setSelectedProvinceId(province.id);
        if (district) setSelectedDistrictId(district.id);
        if (subDistrict) setSelectedSubDistrictId(subDistrict.id);
      })
      .catch((err) => {
        if (!cancelled) {
          console.error(err);
          alert("โหลดข้อมูลจังหวัด/อำเภอ/ตำบลไม่สำเร็จ");
        }
      })
      .finally(() => {
        if (!cancelled) setLoadingAddressData(false);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const districts = useMemo(() => {
    const province = addressData.find((p) => p.id === selectedProvinceId);
    return province?.districts ?? [];
  }, [addressData, selectedProvinceId]);

  const subDistricts = useMemo(() => {
    const district = districts.find((d) => d.id === selectedDistrictId);
    return district?.sub_districts ?? [];
  }, [districts, selectedDistrictId]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setLoading(true);

    const res = await fetch(`/api/address/${address.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(form),
    });

    setLoading(false);

    if (!res.ok) {
      alert("อัปเดตไม่สำเร็จ");
      return;
    }

    router.push("/profile/address");
    router.refresh();
  }

  function handleCancel() {
    router.push("/profile/address");
  }

  function update(key: string, value: string | boolean) {
    setForm({
      ...form,
      [key]: value,
    });
  }

  function handleProvinceChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const id = e.target.value ? Number(e.target.value) : "";
    const province = addressData.find((p) => p.id === id);

    setSelectedProvinceId(id);
    setSelectedDistrictId("");
    setSelectedSubDistrictId("");

    setForm({
      ...form,
      province: province?.name_th ?? "",
      district: "",
      subDistrict: "",
      postalCode: "",
    });
  }

  function handleDistrictChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const id = e.target.value ? Number(e.target.value) : "";
    const district = districts.find((d) => d.id === id);

    setSelectedDistrictId(id);
    setSelectedSubDistrictId("");

    setForm({
      ...form,
      district: district?.name_th ?? "",
      subDistrict: "",
      postalCode: "",
    });
  }

  function handleSubDistrictChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const id = e.target.value ? Number(e.target.value) : "";
    const subDistrict = subDistricts.find((s) => s.id === id);

    setSelectedSubDistrictId(id);

    setForm({
      ...form,
      subDistrict: subDistrict?.name_th ?? "",
      postalCode: subDistrict ? String(subDistrict.zip_code) : "",
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-8 rounded-3xl border border-gray-100 bg-white p-5 shadow-sm sm:p-8"
    >
      {/* ผู้รับ */}
      <div>
        <h2 className="mb-4 flex items-center gap-2 text-sm font-bold text-gray-900">
          <User size={16} className="text-[#0B3D2E]" />
          ข้อมูลผู้รับ
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-gray-500">
              ชื่อผู้รับ
            </label>
            <input
              value={form.fullName}
              onChange={(e) => update("fullName", e.target.value)}
              className="w-full rounded-xl border border-gray-200 p-3 text-sm outline-none transition focus:border-[#0B3D2E] focus:ring-2 focus:ring-[#0B3D2E]/10"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-gray-500">
              เบอร์โทรศัพท์
            </label>
            <div className="relative">
              <Phone
                size={16}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                value={form.phone}
                onChange={(e) => update("phone", e.target.value)}
                className="w-full rounded-xl border border-gray-200 p-3 pl-9 text-sm outline-none transition focus:border-[#0B3D2E] focus:ring-2 focus:ring-[#0B3D2E]/10"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-100" />

      {/* ที่อยู่ */}
      <div>
        <h2 className="mb-4 flex items-center gap-2 text-sm font-bold text-gray-900">
          <Landmark size={16} className="text-[#0B3D2E]" />
          ที่ตั้ง
        </h2>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-gray-500">
              จังหวัด
            </label>
            <select
              value={selectedProvinceId}
              onChange={handleProvinceChange}
              className="w-full rounded-xl border border-gray-200 bg-white p-3 text-sm outline-none transition focus:border-[#0B3D2E] focus:ring-2 focus:ring-[#0B3D2E]/10 disabled:bg-gray-50 disabled:text-gray-400"
              disabled={loadingAddressData}
            >
              <option value="">
                {loadingAddressData ? "กำลังโหลดจังหวัด..." : "เลือกจังหวัด"}
              </option>
              {addressData.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name_th}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-gray-500">
              อำเภอ/เขต
            </label>
            <select
              value={selectedDistrictId}
              onChange={handleDistrictChange}
              className="w-full rounded-xl border border-gray-200 bg-white p-3 text-sm outline-none transition focus:border-[#0B3D2E] focus:ring-2 focus:ring-[#0B3D2E]/10 disabled:bg-gray-50 disabled:text-gray-400"
              disabled={!selectedProvinceId}
            >
              <option value="">
                {selectedProvinceId ? "เลือกอำเภอ/เขต" : "กรุณาเลือกจังหวัดก่อน"}
              </option>
              {districts.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name_th}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-gray-500">
              ตำบล/แขวง
            </label>
            <select
              value={selectedSubDistrictId}
              onChange={handleSubDistrictChange}
              className="w-full rounded-xl border border-gray-200 bg-white p-3 text-sm outline-none transition focus:border-[#0B3D2E] focus:ring-2 focus:ring-[#0B3D2E]/10 disabled:bg-gray-50 disabled:text-gray-400"
              disabled={!selectedDistrictId}
            >
              <option value="">
                {selectedDistrictId ? "เลือกตำบล/แขวง" : "กรุณาเลือกอำเภอก่อน"}
              </option>
              {subDistricts.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name_th}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-gray-500">
              รหัสไปรษณีย์
            </label>
            <input
              value={form.postalCode}
              readOnly
              className="w-full rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm text-gray-500 outline-none"
            />
          </div>
        </div>

        <div className="mt-4">
          <label className="mb-1.5 block text-xs font-medium text-gray-500">
            บ้านเลขที่ / ถนน / ซอย
          </label>
          <div className="relative">
            <MapPin
              size={16}
              className="pointer-events-none absolute left-3 top-3.5 text-gray-400"
            />
            <textarea
              rows={3}
              value={form.address}
              onChange={(e) => update("address", e.target.value)}
              className="w-full resize-none rounded-xl border border-gray-200 p-3 pl-9 text-sm outline-none transition focus:border-[#0B3D2E] focus:ring-2 focus:ring-[#0B3D2E]/10"
            />
          </div>
        </div>
      </div>

      <div className="border-t border-gray-100" />

      {/* เพิ่มเติม */}
      <div>
        <h2 className="mb-4 flex items-center gap-2 text-sm font-bold text-gray-900">
          <StickyNote size={16} className="text-[#0B3D2E]" />
          ข้อมูลเพิ่มเติม
        </h2>

        <textarea
          rows={2}
          value={form.note ?? ""}
          onChange={(e) => update("note", e.target.value)}
          placeholder="หมายเหตุ (ถ้ามี) เช่น จุดสังเกต, ฝากไว้ที่ป้อมยาม"
          className="w-full resize-none rounded-xl border border-gray-200 p-3 text-sm outline-none transition focus:border-[#0B3D2E] focus:ring-2 focus:ring-[#0B3D2E]/10"
        />

        <label className="mt-4 flex cursor-pointer items-center gap-3 rounded-xl border border-gray-200 p-3.5 transition hover:border-[#0B3D2E]/30 hover:bg-[#0B3D2E]/5">
          <input
            type="checkbox"
            checked={form.isDefault}
            onChange={(e) => update("isDefault", e.target.checked)}
            className="h-4 w-4 accent-[#0B3D2E]"
          />
          <span className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
            <Star size={14} className="text-[#0B3D2E]" />
            ตั้งเป็นที่อยู่เริ่มต้น
          </span>
        </label>
      </div>

      {/* ปุ่มดำเนินการ */}
      <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={handleCancel}
          disabled={loading}
          className="rounded-xl border border-gray-200 px-6 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-60 sm:px-8"
        >
          ยกเลิก
        </button>

        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0B3D2E] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-[#0B3D2E]/20 transition hover:bg-[#0f4c38] disabled:opacity-60 sm:px-8"
        >
          {loading && <Loader2 size={16} className="animate-spin" />}
          {loading ? "กำลังบันทึก..." : "บันทึกการแก้ไข"}
        </button>
      </div>
    </form>
  );
}