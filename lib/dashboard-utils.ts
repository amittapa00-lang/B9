export type Period = "day" | "week" | "month" | "year";

const THAI_MONTHS_SHORT = [
  "ม.ค.",
  "ก.พ.",
  "มี.ค.",
  "เม.ย.",
  "พ.ค.",
  "มิ.ย.",
  "ก.ค.",
  "ส.ค.",
  "ก.ย.",
  "ต.ค.",
  "พ.ย.",
  "ธ.ค.",
];

function startOfDay(date: Date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function endOfDay(date: Date) {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

function startOfWeek(date: Date) {
  const d = startOfDay(date);
  const day = d.getDay(); // 0 = อาทิตย์
  const diff = day === 0 ? -6 : 1 - day; // ให้สัปดาห์เริ่มวันจันทร์
  d.setDate(d.getDate() + diff);
  return d;
}

function endOfWeek(date: Date) {
  const s = startOfWeek(date);
  const e = new Date(s);
  e.setDate(e.getDate() + 6);
  return endOfDay(e);
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1, 0, 0, 0, 0);
}

function endOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
}

function startOfYear(date: Date) {
  return new Date(date.getFullYear(), 0, 1, 0, 0, 0, 0);
}

function endOfYear(date: Date) {
  return new Date(date.getFullYear(), 11, 31, 23, 59, 59, 999);
}

// =========================
// ช่วงวันที่ตามตัวกรองที่เลือก
// =========================

export function getDateRange(period: Period, refDate: Date) {
  switch (period) {
    case "day":
      return { start: startOfDay(refDate), end: endOfDay(refDate) };
    case "week":
      return { start: startOfWeek(refDate), end: endOfWeek(refDate) };
    case "year":
      return { start: startOfYear(refDate), end: endOfYear(refDate) };
    case "month":
    default:
      return { start: startOfMonth(refDate), end: endOfMonth(refDate) };
  }
}

// =========================
// ช่วงก่อนหน้า (ความยาวเท่ากัน) ไว้เทียบเปอร์เซ็นต์การเปลี่ยนแปลง
// =========================

export function getPreviousRange(start: Date, end: Date) {
  const duration = end.getTime() - start.getTime();
  const prevEnd = new Date(start.getTime() - 1);
  const prevStart = new Date(prevEnd.getTime() - duration);
  return { start: prevStart, end: prevEnd };
}

// =========================
// แบ่งช่วงเวลาย่อยสำหรับกราฟแนวโน้ม
// day  -> รายชั่วโมง (24 แท่ง)
// week/month -> รายวัน
// year -> รายเดือน
// =========================

export function getBuckets(period: Period, start: Date, end: Date) {
  const buckets: { label: string; start: Date; end: Date }[] = [];

  if (period === "day") {
    for (let h = 0; h < 24; h++) {
      const s = new Date(start);
      s.setHours(h, 0, 0, 0);
      const e = new Date(start);
      e.setHours(h, 59, 59, 999);
      buckets.push({ label: `${h}:00`, start: s, end: e });
    }
    return buckets;
  }

  if (period === "year") {
    const year = start.getFullYear();
    for (let m = 0; m < 12; m++) {
      const s = new Date(year, m, 1, 0, 0, 0, 0);
      const e = new Date(year, m + 1, 0, 23, 59, 59, 999);
      buckets.push({ label: THAI_MONTHS_SHORT[m], start: s, end: e });
    }
    return buckets;
  }

  const cursor = startOfDay(start);
  while (cursor <= end) {
    const s = startOfDay(cursor);
    const e = endOfDay(cursor);
    buckets.push({
      label: `${cursor.getDate()}/${cursor.getMonth() + 1}`,
      start: s,
      end: e,
    });
    cursor.setDate(cursor.getDate() + 1);
  }
  return buckets;
}

export function pctChange(current: number, previous: number) {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}

export function formatDateInput(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}