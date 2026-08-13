import Link from "next/link";
import { Mail, MessageCircle } from "lucide-react";

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


const aboutLinks = [
  { label: "เกี่ยวกับเรา", href: "/company" },
  { label: "ติดต่อเรา", href: "/contact" },
];

const supportLinks = [
  { label: "นโยบายการยกเลิก", href: "/help#cancellation" },
  { label: "การคืน/เปลี่ยนสินค้า", href: "/help#return-exchange" },
  { label: "ติดตามพัสดุ", href: "/help#tracking" },
];

const paymentMethods = [ "โอนผ่านธนาคาร", "เลขที่บัญชีรับเงิน" , "prompt pay"];
const shippingMethods = ["Kerry Express", "ไปรษณีย์ไทย", "Flash Express"];

const socialLinks = [
  { label: "Facebook", href: "https://facebook.com", icon: FacebookIcon },
  { label: "Instagram", href: "https://instagram.com", icon: InstagramIcon },
  { label: "อีเมล", href: "mailto:hello@example.com", icon: Mail },
  { label: "LINE", href: "https://line.me", icon: MessageCircle },
];

const socialLinkClass =
  "flex h-10 w-10 items-center justify-center rounded-full bg-[#E7ECDF] text-[#21301F]/60 transition hover:bg-[#70855C] hover:text-[#FCFBF7]";

export default function Footer() {
  return (
    <footer className="bg-[#E7ECDF]">
      <div className="mx-auto max-w-6xl px-4 py-14 md:px-8 md:py-16">
        <div className="rounded-3xl bg-[#FCFBF7] p-8 shadow-sm md:p-12">
          <div className="grid grid-cols-2 gap-10 md:grid-cols-5 md:gap-8">
            <div>
              <h3 className="font-serif text-lg font-light text-[#21301F]">เกี่ยวกับเรา</h3>
              <ul className="mt-4 space-y-3">
                {aboutLinks.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-sm text-[#21301F]/60 hover:text-[#21301F] hover:underline">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="font-serif text-lg font-light text-[#21301F]">ช่วยเหลือ</h3>
              <ul className="mt-4 space-y-3">
                {supportLinks.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-sm text-[#21301F]/60 hover:text-[#21301F] hover:underline">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="font-serif text-lg font-light text-[#21301F]">การชำระเงิน</h3>
              <ul className="mt-4 space-y-2">
                {paymentMethods.map((method) => (
                  <li key={method} className="w-fit rounded-full bg-[#E7ECDF] px-3 py-1 text-[11px] text-[#21301F]/60">
                    {method}
                  </li>
                ))}
              </ul>

              <h3 className="mt-6 font-serif text-lg font-light text-[#21301F]">การจัดส่ง</h3>
              <ul className="mt-4 space-y-2">
                {shippingMethods.map((method) => (
                  <li key={method} className="w-fit rounded-full bg-[#E7ECDF] px-3 py-1 text-[11px] text-[#21301F]/60">
                    {method}
                  </li>
                ))}
              </ul>
            </div>

            <div className="col-span-2 md:col-span-2">
              <h3 className="font-serif text-lg font-light text-[#21301F]">รับข่าวสาร</h3>
              <p className="mt-4 text-sm text-[#21301F]/60">สมัครรับข่าวสารและโปรโมชั่นก่อนใคร</p>
              <div className="mt-6 flex flex-wrap items-center gap-3">
                {socialLinks.map((s) => (
                  <a
                    key={s.label}
                    href={s.href}
                    aria-label={s.label}
                    title={s.label}
                    className={socialLinkClass}
                  >
                    <s.icon className="h-4 w-4" strokeWidth={1.75} />
                  </a>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-10 flex items-center justify-between border-t border-[#21301F]/10 pt-6 text-[11px] text-[#21301F]/45">
            <span>© {new Date().getFullYear()} ร้านของเรา</span>
            <span>สงวนลิขสิทธิ์ทุกประการ</span>
          </div>
        </div>
      </div>
    </footer>
  );
}