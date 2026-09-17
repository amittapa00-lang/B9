// app/contact/page.tsx
import { Phone, Mail, MapPin, Clock, MessageCircle, ArrowUpRight } from "lucide-react";

const COLOR = {
  onDark: "#FFFFFF",
  onDarkSoft: "#E8C9A8",
  onLight: "#14210F",
  onLightSoft: "#3F4A38",
  accent: "#B5713F",
};

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <path
        d="M14 9h2V6h-2c-1.66 0-3 1.34-3 3v2H9v3h2v6h3v-6h2.2l.8-3H14v-2c0-.55.45-1 1-1z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <rect x="4" y="4" width="16" height="16" rx="4" stroke="currentColor" strokeWidth="1.75" />
      <circle cx="12" cy="12" r="3.2" stroke="currentColor" strokeWidth="1.75" />
      <circle cx="16.2" cy="7.8" r="0.6" fill="currentColor" />
    </svg>
  );
}

const contactMethods = [
  {
    icon: Phone,
    label: "โทรศัพท์",
    value: "02-123-4567",
    href: "tel:0212345678",
    external: false,
  },
  {
    icon: Mail,
    label: "อีเมล",
    value: "b.nine9trading@gmail.com",
    href: "mailto:b.nine9trading@gmail.com",
    external: false,
  },
  {
    icon: MessageCircle,
    label: "LINE Official",
    value: "เพิ่มเพื่อนทาง LINE",
    href: "https://lin.ee/ufaoDYo",
    external: true,
  },
  {
    icon: FacebookIcon,
    label: "Facebook",
    value: "b.nine9 trading",
    href: "https://www.facebook.com/profile.php?id=61560984729693&locale=th_TH",
    external: true,
  },
  {
    icon: InstagramIcon,
    label: "Instagram",
    value: "@b.nine9trading",
    href: "https://www.instagram.com/b.nine9trading/",
    external: true,
  },
  {
    icon: MapPin,
    label: "ที่อยู่",
    value: "29/10 หมู่ที่ 7 ถนนท้ายบ้าน ตำบลท้ายบ้าน อำเภอเมืองสมุทรปราการ สมุทรปราการ 10280",
    href: "",
    external: false,
  },
];

export default function ContactPage() {
  return (
    <>
      {/* contact methods */}
      <section style={{ backgroundColor: "#FAF7F0" }}>
        <div className="mx-auto max-w-6xl px-4 pt-3 pb-16 md:px-8 md:pt-4 md:pb-24">
          <div className="text-center">
            <h2 className="font-serif text-2xl font-medium md:text-3xl" style={{ color: COLOR.onLight }}>
              ช่องทางติดต่อ
            </h2>
            <p className="mt-2 text-sm" style={{ color: COLOR.onLightSoft }}>
              ทีมงานตอบกลับภายใน 24 ชั่วโมง (จันทร์–เสาร์ 9:00–18:00 น.)
            </p>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {contactMethods.map((item) => {
              const inner = (
                <div
                  className="group flex h-full items-start gap-4 rounded-2xl bg-white p-5 shadow-[0_1px_3px_rgba(28,42,23,0.08)] ring-1 transition hover:-translate-y-0.5 hover:shadow-[0_4px_14px_rgba(28,42,23,0.12)]"
                  style={{ borderColor: "#E2DCCB" }}
                >
                  <span
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition group-hover:bg-[#24331C]"
                    style={{ backgroundColor: "#F1EDE1" }}
                  >
                    <item.icon
                      className="h-5 w-5 transition group-hover:text-white"
                      style={{ color: "#5F7850" }}
                      strokeWidth={1.5}
                    />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium uppercase tracking-wide" style={{ color: COLOR.onLightSoft }}>
                      {item.label}
                    </p>
                    <p className="mt-0.5 break-words text-sm font-medium md:text-base" style={{ color: COLOR.onLight }}>
                      {item.value}
                    </p>
                  </div>
                  {item.href && (
                    <ArrowUpRight
                      className="h-4 w-4 shrink-0 opacity-0 transition group-hover:opacity-100"
                      style={{ color: COLOR.onLightSoft }}
                    />
                  )}
                </div>
              );

              return item.href ? (
                <a
                  key={item.label}
                  href={item.href}
                  target={item.external ? "_blank" : undefined}
                  rel={item.external ? "noopener noreferrer" : undefined}
                  className="block"
                >
                  {inner}
                </a>
              ) : (
                <div key={item.label}>{inner}</div>
              );
            })}

            <div
              className="flex h-full items-start gap-4 rounded-2xl p-5"
              style={{ backgroundColor: "#24331C" }}
            >
              <span
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full"
                style={{ backgroundColor: "rgba(255,255,255,0.12)" }}
              >
                <Clock className="h-5 w-5" style={{ color: COLOR.onDark }} strokeWidth={1.5} />
              </span>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide" style={{ color: COLOR.onDarkSoft }}>
                  เวลาทำการ
                </p>
                <p className="mt-0.5 text-sm font-medium md:text-base" style={{ color: COLOR.onDark }}>
                  จันทร์–เสาร์ 8:00–18:00 น.
                </p>
                <p className="mt-0.5 text-xs" style={{ color: "#C7CBBB" }}>
                  ปิดวันอาทิตย์และวันหยุดนักขัตฤกษ์
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}