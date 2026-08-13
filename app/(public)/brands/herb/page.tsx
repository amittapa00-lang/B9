import BrandHero from "@/components/sections/brands/BrandHero";
import BrandOverview from "@/components/sections/brands/BrandOverview";
import { brandDetails } from "@/data/brandDetail";

const brand = brandDetails.find(
  (item) => item.slug === "herb"
)!;

export default function HerbPage() {
  return (
    <>
      <BrandHero
        icon={brand.icon}
        title={brand.name}
        slogan={brand.slogan}
      />

      <BrandOverview
        description={brand.description}
      />
    </>
  );
}