export interface Brand {
  id: number;
  name: string;
  description: string;
  href: string;
  icon: string;
  color: string;
}

export const brands: Brand[] = [
  {
    id: 1,
    name: "B-NINE HERB",
    description: "ผลิตภัณฑ์สมุนไพรเพื่อสุขภาพและความงามระดับพรีเมียม",
    href: "/brands/herb",
    icon: "🌿",
    color: "bg-green-100",
  },
  {
    id: 2,
    name: "B-NINE FOOD",
    description: "ผลิตภัณฑ์อาหารและเครื่องดื่มคัดสรรคุณภาพชั้นเลิศ",
    href: "/brands/food",
    icon: "🍽️",
    color: "bg-orange-100",
  },
  {
    id: 3,
    name: "B-NINE COSMETIC",
    description: "ผลิตภัณฑ์เพื่อความงามและการดูแลผิวพรรณอย่างล้ำลึก",
    href: "/brands/cosmetic",
    icon: "💄",
    color: "bg-pink-100",
  },
];