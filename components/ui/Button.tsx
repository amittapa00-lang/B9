import Link from "next/link";

interface ButtonProps {
  children: React.ReactNode;
  href?: string;
  onClick?: () => void;
  variant?: "primary" | "secondary";
  className?: string;
}

export default function Button({
  children,
  href,
  onClick,
  variant = "primary",
  className = "",
}: ButtonProps) {
  const buttonClass =
    variant === "primary"
      ? "inline-flex items-center justify-center rounded-full bg-[#0B3D2E] px-7 py-3 text-white font-semibold transition hover:bg-[#145941]"
      : "inline-flex items-center justify-center rounded-full border border-[#0B3D2E] px-7 py-3 text-[#0B3D2E] font-semibold transition hover:bg-[#0B3D2E] hover:text-white";

  const classes = `${buttonClass} ${className}`;

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button type="button" className={classes} onClick={onClick}>
      {children}
    </button>
  );
}