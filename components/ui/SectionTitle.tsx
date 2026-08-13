import Badge from "./Badge";

interface Props {
  title: string;
  subtitle?: string;
  align?: "left" | "center";
}

export default function SectionTitle({
  title,
  subtitle,
  align = "center",
}: Props) {
  const textAlign =
    align === "left" ? "text-left" : "text-center";

  return (
    <div className={`mb-16 ${textAlign}`}>
      {subtitle && (
        <Badge>
          {subtitle}
        </Badge>
      )}

      <h2 className="mt-5 text-4xl font-bold lg:text-5xl">
        {title}
      </h2>
    </div>
  );
}