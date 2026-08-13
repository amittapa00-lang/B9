"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";

const PERIODS = [
  { value: "day", label: "รายวัน" },
  { value: "week", label: "รายสัปดาห์" },
  { value: "month", label: "รายเดือน" },
  { value: "year", label: "รายปี" },
];

export default function DashboardFilter({
  currentPeriod,
  currentDate,
}: {
  currentPeriod: string;
  currentDate: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function updateParams(next: { period?: string; date?: string }) {
    const params = new URLSearchParams(searchParams.toString());
    if (next.period) params.set("period", next.period);
    if (next.date) params.set("date", next.date);
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-wrap gap-2">
        {PERIODS.map((p) => (
          <button
            key={p.value}
            type="button"
            onClick={() => updateParams({ period: p.value })}
            className={`rounded-lg border px-4 py-2 text-sm font-semibold transition ${
              currentPeriod === p.value
                ? "border-blue-600 bg-blue-50 text-blue-600"
                : "border-gray-200 text-gray-500 hover:border-gray-300"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <label className="text-sm font-medium text-gray-500">
          เลือกวันที่อ้างอิง
        </label>
        <input
          type="date"
          defaultValue={currentDate}
          onChange={(e) => updateParams({ date: e.target.value })}
          className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 focus:border-blue-400 focus:outline-none"
        />
      </div>
    </div>
  );
}