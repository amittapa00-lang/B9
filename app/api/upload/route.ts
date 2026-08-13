import { NextResponse } from "next/server";
import cloudinary from "@/lib/cloudinary";
import { UploadApiResponse } from "cloudinary"; // นำเข้า Type มาใช้

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { message: "No file" },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // ระบุ Type ให้กับ Promise เป็น UploadApiResponse
    const uploadResult = await new Promise<UploadApiResponse>((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder: "products",
          },
          (error, result) => {
            if (error) reject(error);
            // ตรวจสอบว่า result มีค่า เพื่อป้องกันกรณี undefined
            else if (result) resolve(result);
            else reject(new Error("Upload failed"));
          }
        )
        .end(buffer);
    });

    return NextResponse.json({
      url: uploadResult.secure_url,
    });
  } catch (err) {
    console.error(err);

    return NextResponse.json(
      {
        message: "Upload Error",
      },
      {
        status: 500,
      }
    );
  }
}