"use client";

import { useRef } from "react";
import Image from "next/image";

interface Props {
  files: File[];
  setFiles: (files: File[]) => void;
}

export default function ImageUploader({
  files,
  setFiles,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="space-y-5">

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="rounded-xl bg-blue-600 px-6 py-3 text-white"
      >
        อัปโหลดรูปภาพ
      </button>

      <input
        ref={inputRef}
        hidden
        multiple
        type="file"
        accept="image/*"
        onChange={(e) => {
          if (!e.target.files) return;

          setFiles(Array.from(e.target.files));
        }}
      />

      <div className="grid grid-cols-4 gap-4">

        {files.map((file, index) => (
          <div
            key={`${file.name}-${index}`}
            className="relative aspect-square overflow-hidden rounded-xl"
          >
            <Image
              src={URL.createObjectURL(file)}
              alt=""
              fill
              className="object-cover"
            />
          </div>
        ))}

      </div>

    </div>
  );
}