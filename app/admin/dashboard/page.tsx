import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { OrderStatus } from "@prisma/client";
import {
  Users,
  ShieldCheck,
  LayoutDashboard,
  Eye,
  Wallet,
  TrendingUp,
  TrendingDown,
  PackageCheck,
  PackageX,
} from "lucide-react";
import DashboardFilter from "@/components/DashboardFilter";
import {
  Period,
  getDateRange,
  getPreviousRange,
  getBuckets,
  pctChange,
  formatDateInput,
} from "@/lib/dashboard-utils";

interface Props {
  searchParams: Promise<{ period?: string; date?: string }>;
}

// =========================
// การ์ดแสดงเปอร์เซ็นต์การเปลี่ยนแปลง
// =========================

function ChangeBadge({ value }: { value: number }) {
  const isUp = value >= 0;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold ${
        isUp ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
      }`}
    >
      {isUp ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
      {Math.abs(value).toFixed(1)}%
    </span>
  );
}

// =========================
// กราฟแท่งอย่างง่าย (ไม่ต้องพึ่งไลบรารีเพิ่ม)
// =========================

function BarChart({
  data,
  max,
  barColor,
}: {
  data: { label: string; value: number }[];
  max: number;
  barColor: string;
}) {
  return (
    <div className="flex h-40 items-end gap-1 overflow-x-auto">
      {data.map((d, i) => (
        <div
          key={i}
          className="flex min-w-[20px] flex-1 flex-col items-center gap-1"
          title={`${d.label}: ${d.value.toLocaleString()}`}
        >
          <div className="flex h-32 w-full items-end">
            <div
              className={`w-full rounded-t-sm ${barColor}`}
              style={{
                height: `${Math.max(2, (d.value / max) * 100)}%`,
              }}
            />
          </div>
          <span className="whitespace-nowrap text-[10px] text-gray-400">
            {d.label}
          </span>
        </div>
      ))}
    </div>
  );
}

const periodLabel: Record<Period, string> = {
  day: "วันนี้",
  week: "สัปดาห์นี้",
  month: "เดือนนี้",
  year: "ปีนี้",
};

export default async function AdminDashboard({ searchParams }: Props) {
  const session = await auth();
  const sp = await searchParams;

  const period = (
    ["day", "week", "month", "year"].includes(sp.period ?? "")
      ? sp.period
      : "month"
  ) as Period;

  const refDate = sp.date ? new Date(sp.date) : new Date();

  const { start, end } = getDateRange(period, refDate);
  const { start: prevStart, end: prevEnd } = getPreviousRange(start, end);

  const orderWhere = { status: { not: OrderStatus.CANCELLED } };

  // =========================
  // สมาชิก / ผู้ดูแลระบบ
  // =========================

  const [membersCount, adminsCount] = await Promise.all([
    prisma.user.count({ where: { role: "USER" } }),
    prisma.user.count({ where: { role: "ADMIN" } }),
  ]);

  // =========================
  // ผู้เข้าชมเว็บไซต์
  // =========================

  const [visitsCurrentCount, visitsPreviousCount, visitRows] =
    await Promise.all([
      prisma.pageVisit.count({ where: { createdAt: { gte: start, lte: end } } }),
      prisma.pageVisit.count({
        where: { createdAt: { gte: prevStart, lte: prevEnd } },
      }),
      prisma.pageVisit.findMany({
        where: { createdAt: { gte: start, lte: end } },
        select: { createdAt: true, visitorId: true },
      }),
    ]);

  const uniqueVisitors = new Set(
    visitRows.map((v) => v.visitorId).filter(Boolean)
  ).size;

  const visitsChange = pctChange(visitsCurrentCount, visitsPreviousCount);

  const visitBuckets = getBuckets(period, start, end).map((b) => ({
    label: b.label,
    value: visitRows.filter((v) => v.createdAt >= b.start && v.createdAt <= b.end)
      .length,
  }));

  const maxVisitBucket = Math.max(1, ...visitBuckets.map((b) => b.value));

  // =========================
  // ยอดขาย
  // =========================

  const [ordersCurrent, ordersPreviousTotal] = await Promise.all([
    prisma.order.findMany({
      where: { ...orderWhere, createdAt: { gte: start, lte: end } },
      select: { total: true, createdAt: true },
    }),
    prisma.order.aggregate({
      where: { ...orderWhere, createdAt: { gte: prevStart, lte: prevEnd } },
      _sum: { total: true },
    }),
  ]);

  const salesCurrent = ordersCurrent.reduce((sum, o) => sum + o.total, 0);
  const salesPrevious = ordersPreviousTotal._sum.total ?? 0;
  const salesChange = pctChange(salesCurrent, salesPrevious);

  const salesBuckets = getBuckets(period, start, end).map((b) => ({
    label: b.label,
    value: ordersCurrent
      .filter((o) => o.createdAt >= b.start && o.createdAt <= b.end)
      .reduce((sum, o) => sum + o.total, 0),
  }));

  const maxSalesBucket = Math.max(1, ...salesBuckets.map((b) => b.value));

  // =========================
  // สินค้าขายดี / สินค้าขายไม่ได้ (ในช่วงที่เลือก)
  // =========================

  const orderItemsInRange = await prisma.orderItem.findMany({
    where: { order: { ...orderWhere, createdAt: { gte: start, lte: end } } },
    select: {
      productId: true,
      quantity: true,
      price: true,
      product: { select: { name: true, sku: true } },
    },
  });

  const salesByProduct = new Map<
    string,
    { name: string; sku: string; quantity: number; revenue: number }
  >();

  for (const item of orderItemsInRange) {
    const entry = salesByProduct.get(item.productId) ?? {
      name: item.product.name,
      sku: item.product.sku,
      quantity: 0,
      revenue: 0,
    };
    entry.quantity += item.quantity;
    entry.revenue += item.quantity * item.price;
    salesByProduct.set(item.productId, entry);
  }

  const topSold = [...salesByProduct.values()]
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5);

  const soldProductIds = new Set(orderItemsInRange.map((i) => i.productId));

  const activeProducts = await prisma.product.findMany({
    where: { isActive: true },
    select: { id: true, name: true, sku: true, stock: true },
    orderBy: { createdAt: "desc" },
  });

  const nonSellingProducts = activeProducts
    .filter((p) => !soldProductIds.has(p.id))
    .slice(0, 10);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {/* ส่วนหัว */}
      <header className="mb-8">
        <div className="flex items-center gap-2 text-gray-800">
          <LayoutDashboard size={28} />
          <h1 className="text-3xl font-bold">แดชบอร์ดผู้ดูแลระบบ</h1>
        </div>
        <p className="mt-2 text-gray-600">
          ยินดีต้อนรับกลับมา,{" "}
          <span className="font-semibold text-blue-600">
            {session?.user?.name}
          </span>
        </p>
      </header>

      {/* สมาชิก / ผู้ดูแลระบบ */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
          <div className="flex items-center gap-4">
            <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
              <Users size={24} />
            </div>
            <div>
              <p className="text-sm font-medium uppercase tracking-wider text-gray-500">
                จำนวนสมาชิกทั่วไป
              </p>
              <h2 className="mt-1 text-4xl font-extrabold text-gray-900">
                {membersCount.toLocaleString()}
              </h2>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
          <div className="flex items-center gap-4">
            <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600">
              <ShieldCheck size={24} />
            </div>
            <div>
              <p className="text-sm font-medium uppercase tracking-wider text-gray-500">
                ผู้ดูแลระบบ
              </p>
              <h2 className="mt-1 text-4xl font-extrabold text-gray-900">
                {adminsCount.toLocaleString()}
              </h2>
            </div>
          </div>
        </div>
      </div>

      {/* ตัวกรองช่วงเวลา */}
      <div className="mt-8">
        <DashboardFilter
          currentPeriod={period}
          currentDate={formatDateInput(refDate)}
        />
      </div>

      {/* ผู้เข้าชมเว็บไซต์ / ยอดขาย */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* ผู้เข้าชมเว็บไซต์ */}
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-indigo-50 p-3 text-indigo-600">
                <Eye size={22} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">
                  ผู้เข้าชมเว็บไซต์ ({periodLabel[period]})
                </p>
                <h2 className="mt-1 text-3xl font-extrabold text-gray-900">
                  {visitsCurrentCount.toLocaleString()}
                </h2>
                <p className="mt-1 text-xs text-gray-400">
                  ผู้เข้าชมไม่ซ้ำ {uniqueVisitors.toLocaleString()} คน
                </p>
              </div>
            </div>
            <ChangeBadge value={visitsChange} />
          </div>

          <div className="mt-6">
            <BarChart
              data={visitBuckets}
              max={maxVisitBucket}
              barColor="bg-indigo-500"
            />
          </div>
        </div>

        {/* ยอดขาย */}
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-amber-50 p-3 text-amber-600">
                <Wallet size={22} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">
                  ยอดขาย ({periodLabel[period]})
                </p>
                <h2 className="mt-1 text-3xl font-extrabold text-gray-900">
                  ฿{salesCurrent.toLocaleString()}
                </h2>
                <p className="mt-1 text-xs text-gray-400">
                  จำนวน {ordersCurrent.length.toLocaleString()} คำสั่งซื้อ
                </p>
              </div>
            </div>
            <ChangeBadge value={salesChange} />
          </div>

          <div className="mt-6">
            <BarChart
              data={salesBuckets}
              max={maxSalesBucket}
              barColor="bg-amber-500"
            />
          </div>
        </div>
      </div>

      {/* สินค้าขายดี / สินค้าขายไม่ได้ */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* สินค้าขายดี */}
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-green-50 p-3 text-green-600">
              <PackageCheck size={22} />
            </div>
            <h2 className="text-lg font-bold text-gray-900">
              สินค้าขายดี ({periodLabel[period]})
            </h2>
          </div>

          {topSold.length === 0 ? (
            <p className="mt-6 text-sm text-gray-400">
              ยังไม่มีคำสั่งซื้อในช่วงเวลานี้
            </p>
          ) : (
            <div className="mt-5 divide-y">
              {topSold.map((p, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between gap-4 py-3"
                >
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-gray-900">
                      {p.name}
                    </p>
                    <p className="text-xs text-gray-400">SKU: {p.sku}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="font-bold text-green-700">
                      {p.quantity.toLocaleString()} ชิ้น
                    </p>
                    <p className="text-xs text-gray-400">
                      ฿{p.revenue.toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* สินค้าขายไม่ได้ */}
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-red-50 p-3 text-red-600">
              <PackageX size={22} />
            </div>
            <h2 className="text-lg font-bold text-gray-900">
              สินค้าที่ยังไม่มีคนซื้อ ({periodLabel[period]})
            </h2>
          </div>

          {nonSellingProducts.length === 0 ? (
            <p className="mt-6 text-sm text-gray-400">
              สินค้าทุกรายการมียอดขายในช่วงเวลานี้แล้ว
            </p>
          ) : (
            <div className="mt-5 divide-y">
              {nonSellingProducts.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between gap-4 py-3"
                >
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-gray-900">
                      {p.name}
                    </p>
                    <p className="text-xs text-gray-400">SKU: {p.sku}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-sm text-gray-500">
                      คงเหลือ {p.stock.toLocaleString()} ชิ้น
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}