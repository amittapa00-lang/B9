"use client";

import { useState } from "react";
import Image from "next/image";

interface ImageItem {
  id: string;
  imageUrl: string;
}

interface Props {
  images: ImageItem[];
  productName: string;
}

export default function ProductGallery({
  images,
  productName,
}: Props) {
  const [selected, setSelected] = useState(0);

  if (images.length === 0) {
    return (
      <div className="flex aspect-square items-center justify-center rounded-2xl border bg-gray-100">
        No Image
      </div>
    );
  }

  return (
    <div>

      {/* รูปใหญ่ */}

      <div className="relative aspect-square overflow-hidden rounded-2xl border bg-white">

        <Image
          src={images[selected].imageUrl}
          alt={productName}
          fill
          priority
          className="object-contain"
        />

      </div>

      {/* รูปย่อย */}

      <div className="mt-4 grid grid-cols-5 gap-3">

        {images.map((image, index) => (

          <button
            key={image.id}
            type="button"
            onClick={() => setSelected(index)}
            className={`relative aspect-square overflow-hidden rounded-xl border-2 transition

              ${
                selected === index
                  ? "border-green-700"
                  : "border-gray-200 hover:border-green-500"
              }
            `}
          >
            <Image
              src={image.imageUrl}
              alt={productName}
              fill
              className="object-cover"
            />
          </button>

        ))}

      </div>

    </div>
  );
}