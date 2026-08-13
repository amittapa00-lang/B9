"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

// นำ component นี้ไปวางไว้ใน root layout.tsx (นอก <body> ก็ได้ แค่ต้อง render อยู่)
// จะนับผู้เข้าชม 1 ครั้งต่อ 1 session ของเบราว์เซอร์

export default function VisitTracker() {
  const pathname = usePathname();

  useEffect(() => {
    const SESSION_KEY = "site_visit_logged";

    if (sessionStorage.getItem(SESSION_KEY)) return;

    let visitorId = localStorage.getItem("visitor_id");
    if (!visitorId) {
      visitorId = crypto.randomUUID();
      localStorage.setItem("visitor_id", visitorId);
    }

    fetch("/api/visits", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: pathname, visitorId }),
    }).catch(() => {});

    sessionStorage.setItem(SESSION_KEY, "1");
  }, [pathname]);

  return null;
}