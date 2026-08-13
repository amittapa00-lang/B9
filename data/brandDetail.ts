export interface BrandDetail {
  slug: string;
  name: string;
  slogan: string;
  description: string;
  color: string;
  icon: string;
}

export const brandDetails: BrandDetail[] = [
  {
    slug: "herb",
    name: "B-Long HERB",
    slogan: "Natural Wellness",
    description:
      "Premium herbal wellness products inspired by nature.",
    color: "#2E7D32",
    icon: "🌿",
  },

  {
    slug: "food",
    name: "B-Long FOOD",
    slogan: "Premium Food",
    description:
      "Healthy food and beverage for modern lifestyle.",
    color: "#F57C00",
    icon: "🍽️",
  },

  {
    slug: "cosmetic",
    name: "B-Long COSMETIC",
    slogan: "Beauty Innovation",
    description:
      "Premium beauty and personal care products.",
    color: "#D81B60",
    icon: "💄",
  },
];