// app/help/page.tsx
import { RotateCcw, PackageX, Truck, ExternalLink } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const COLOR = {
  onLight: "#14210F",
  onLightSoft: "#3F4A38",
};

// ลิงก์เช็คสถานะพัสดุของแต่ละบริษัทขนส่ง
const trackingLinks = [
  {
    name: "Kerry Express",
    url: "https://th.kerryexpress.com/th/track/",
  },
  {
    name: "ไปรษณีย์ไทย",
    url: "https://track.thailandpost.co.th/",
  },
  {
    name: "Flash Express",
    url: "https://www.flashexpress.co.th/tracking/",
  },
];

const sections = [
  {
    id: "cancellation",
    icon: PackageX,
    title: "นโยบายการยกเลิก",
    body: (
      <p className="text-sm leading-relaxed md:text-base" style={{ color: COLOR.onLightSoft }}>
        เมื่อกดยกเลิกคำสั่งซื้อแล้ว ระบบจะไม่คืนเงินที่ชำระมาให้ไม่ว่ากรณีใดก็ตาม
        กรุณาตรวจสอบรายการสินค้าให้ถูกต้องก่อนทำการสั่งซื้อ
      </p>
    ),
  },
  {
    id: "return-exchange",
    icon: RotateCcw,
    title: "การคืน/เปลี่ยนสินค้า",
    body: (
      <p className="text-sm leading-relaxed md:text-base" style={{ color: COLOR.onLightSoft }}>
        หากได้รับสินค้าแล้วพบปัญหา เช่น สินค้าชำรุด ไม่ตรงตามที่สั่ง หรือต้องการเปลี่ยน/คืนสินค้า
        กรุณาติดต่อทางร้านผ่าน LINE Official Account พร้อมแจ้งหมายเลขคำสั่งซื้อ
        เพื่อให้เจ้าหน้าที่ดำเนินการให้
      </p>
    ),
  },
  {
    id: "tracking",
    icon: Truck,
    title: "ติดตามพัสดุ",
    body: (
      <>
        <p className="text-sm leading-relaxed md:text-base" style={{ color: COLOR.onLightSoft }}>
          เมื่อคำสั่งซื้อของคุณถูกจัดส่งแล้ว ระบบจะแสดงหมายเลขพัสดุให้ทางหน้าเว็บไซต์
          ในหน้ารายละเอียดคำสั่งซื้อของคุณ สามารถนำหมายเลขไปตรวจสอบสถานะได้ที่เว็บไซต์ของบริษัทขนส่งที่ใช้บริการ
          ตามลิงก์ด้านล่าง
        </p>

        <ul className="mt-4 space-y-2">
          {trackingLinks.map((link) => (
            <li key={link.name}>
              <a
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm font-medium underline-offset-4 hover:underline md:text-base"
                style={{ color: "#5F7850" }}
              >
                {link.name}
                <ExternalLink className="h-3.5 w-3.5" strokeWidth={1.5} />
              </a>
            </li>
          ))}
        </ul>
      </>
    ),
  },
];

export default function HelpPage() {
  return (
    <>
      <Navbar />

      <section style={{ backgroundColor: "#FAF7F0" }}>
        <div className="mx-auto max-w-4xl px-4 py-16 md:px-8 md:py-24">
          <div className="text-center">
            <span
              className="inline-block rounded-full px-3.5 py-1.5 font-mono text-[11px] font-semibold uppercase tracking-[0.2em]"
              style={{ backgroundColor: "#F1EDE1", color: COLOR.onLightSoft }}
            >
              ศูนย์ช่วยเหลือ
            </span>
            <h1
              className="mt-4 font-serif text-3xl font-medium md:text-4xl"
              style={{ color: COLOR.onLight }}
            >
              ช่วยเหลือ
            </h1>
          </div>

          <div className="mt-12 space-y-6">
            {sections.map((section) => (
              <div
                key={section.id}
                id={section.id}
                className="scroll-mt-24 rounded-3xl bg-white p-8 shadow-[0_1px_3px_rgba(28,42,23,0.08)] ring-1 md:p-10"
                style={{ borderColor: "#E2DCCB" }}
              >
                <div className="flex items-center gap-3">
                  <span
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
                    style={{ backgroundColor: "#F1EDE1" }}
                  >
                    <section.icon className="h-5 w-5" style={{ color: "#5F7850" }} strokeWidth={1.5} />
                  </span>
                  <h2
                    className="font-serif text-xl font-medium md:text-2xl"
                    style={{ color: COLOR.onLight }}
                  >
                    {section.title}
                  </h2>
                </div>
                <div className="mt-4">{section.body}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}