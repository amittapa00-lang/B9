// app/layout.tsx
import type { Metadata } from "next";
import { Taviraj, IBM_Plex_Sans_Thai, IBM_Plex_Mono } from "next/font/google";
import SessionProvider from "@/components/providers/SessionProvider";
import "./globals.css";

const taviraj = Taviraj({
  subsets: ["thai", "latin"],
  weight: ["300", "400", "500"],
  variable: "--font-serif",
});

const plexSansThai = IBM_Plex_Sans_Thai({
  subsets: ["thai", "latin"],
  weight: ["400", "500"],
  variable: "--font-sans",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "B-NINE TRADING",
  description: "ของใช้ที่ใช่ เพื่อวันที่ดีขึ้น",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th">
      <body
        className={`${taviraj.variable} ${plexSansThai.variable} ${plexMono.variable} bg-[#E7ECDF] font-sans antialiased`}
      >
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}