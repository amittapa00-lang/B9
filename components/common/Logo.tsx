import Link from "next/link";
import Image from "next/image";

export default function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2">
      <div className="relative h-12 w-32 sm:h-14 sm:w-40">
        <Image
          src="/images/b-nine-logo.png"
          alt="B-NINE Logo"
          fill
          className="object-contain"
          priority
        />
      </div>
    </Link>
  );
}