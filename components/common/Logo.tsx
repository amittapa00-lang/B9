import Link from "next/link";
import Image from "next/image";

export default function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2">
      <div className="relative h-20 w-56 sm:h-28 sm:w-72">
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