export interface WhyChooseItem {
  id: number;
  title: string;
  description: string;
  icon: string;
}

export const whyChoose: WhyChooseItem[] = [
  {
    id: 1,
    title: "Premium Quality",
    description:
      "Every product is developed with strict quality standards.",
    icon: "⭐",
  },
  {
    id: 2,
    title: "Innovation",
    description:
      "Continuously creating products that improve everyday life.",
    icon: "🚀",
  },
  {
    id: 3,
    title: "Sustainability",
    description:
      "Committed to responsible business and sustainable growth.",
    icon: "🌱",
  },
  {
    id: 4,
    title: "Trusted Partner",
    description:
      "Building long-term trust with customers and partners.",
    icon: "🤝",
  },
];