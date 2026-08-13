"use client";

import { useEffect, useState } from "react";

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

interface Props {
  onSelect: (
    address: Address | null
  ) => void;
}

export default function AddressSelector({
  onSelect,
}: Props) {
  const [addresses, setAddresses] =
    useState<Address[]>([]);

  const [selectedId, setSelectedId] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    async function fetchAddresses() {
      try {
        const res = await fetch(
          "/api/addresses"
        );

        if (!res.ok) {
          return;
        }

        const data =
          await res.json();

        setAddresses(data);

        // เลือก Default Address
        const defaultAddress =
          data.find(
            (item: Address) =>
              item.isDefault
          );

        if (defaultAddress) {
          setSelectedId(
            defaultAddress.id
          );

          onSelect(defaultAddress);
        } else if (data.length > 0) {
          setSelectedId(
            data[0].id
          );

          onSelect(data[0]);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    fetchAddresses();
  }, [onSelect]);

  function handleSelect(
    address: Address
  ) {
    setSelectedId(address.id);

    onSelect(address);
  }

  if (loading) {
    return (
      <div className="rounded-xl border p-6">
        Loading addresses...
      </div>
    );
  }

  if (addresses.length === 0) {
    return (
      <div className="rounded-xl border border-dashed p-6">
        <p className="text-gray-500">
          ยังไม่มีที่อยู่จัดส่ง
        </p>

        <button
          type="button"
          className="mt-4 rounded-xl bg-green-700 px-5 py-3 text-white"
        >
          + เพิ่มที่อยู่
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {addresses.map((address) => (
        <button
          key={address.id}
          type="button"
          onClick={() =>
            handleSelect(address)
          }
          className={`w-full rounded-xl border p-5 text-left transition ${
            selectedId === address.id
              ? "border-green-700 bg-green-50 ring-2 ring-green-700"
              : "hover:border-gray-400"
          }`}
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="font-semibold">
                {address.fullName}
              </p>

              <p className="mt-1 text-sm text-gray-600">
                {address.phone}
              </p>
            </div>

            {address.isDefault && (
              <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                Default
              </span>
            )}
          </div>

          <p className="mt-3 text-sm leading-6 text-gray-600">
            {address.address}
            <br />

            ตำบล
            {address.subDistrict}{" "}
            อำเภอ
            {address.district}
            <br />

            {address.province}{" "}
            {address.postalCode}
          </p>

          {selectedId ===
            address.id && (
            <p className="mt-3 font-semibold text-green-700">
              ✓ Selected
            </p>
          )}
        </button>
      ))}

      <button
        type="button"
        className="rounded-xl border border-green-700 px-5 py-3 font-medium text-green-700 hover:bg-green-50"
      >
        + เพิ่มที่อยู่ใหม่
      </button>
    </div>
  );
}