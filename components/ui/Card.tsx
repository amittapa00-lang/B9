interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export default function Card({
  children,
  className = "",
}: CardProps) {
  return (
    <div
      className={`
        rounded-4xl
        border
        border-gray-100
        bg-white
        p-8
        shadow-sm
        transition
        duration-300
        hover:-translate-y-2
        hover:shadow-xl
        ${className}
      `}
    >
      {children}
    </div>
  );
}