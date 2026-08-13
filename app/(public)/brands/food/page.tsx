import BrandHero from "@/components/sections/brands/BrandHero";
import BrandOverview from "@/components/sections/brands/BrandOverview";
import { brandDetails } from "@/data/brandDetail";

const brand = brandDetails.find(
  (item) => item.slug === "food"
)!;

export default function FoodPage() {
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