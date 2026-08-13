// components/sections/home/BrandsSection.tsx
const brands = ["แบรนด์ A", "แบรนด์ B", "แบรนด์ C", "แบรนด์ D", "แบรนด์ E", "แบรนด์ F"];

export default function BrandsSection() {
  return (
    <section className="bg-[#FCFBF7] py-10">
      <div className="mx-auto max-w-6xl px-4 md:px-8">
        <p className="mb-6 text-center font-mono text-[11px] uppercase tracking-[0.2em] text-[#21301F]/35">
          แบรนด์ที่เราคัดสรร
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
          {brands.map((brand) => (
            <span
              key={brand}
              className="font-serif text-lg font-light text-[#21301F]/45"
            >
              {brand}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}