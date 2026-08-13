import Section from "@/components/common/Section";
import SectionTitle from "@/components/ui/SectionTitle";
import BrandCard from "@/components/cards/BrandCard";
import { brands } from "@/data/brands";

export default function BusinessUnits() {
  return (
    <Section>

      <SectionTitle
        subtitle="กลุ่มธุรกิจของเรา"
        title="แบรนด์สินค้าในเครือ"
      />

      <div className="grid gap-8 lg:grid-cols-3">

        {brands.map((brand) => (

          <BrandCard
            key={brand.id}
            brand={brand}
          />

        ))}

      </div>

    </Section>
  );
}