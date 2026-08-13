import { NextResponse } from "next/server";
import { auth } from "@/auth";
import cloudinary from "@/lib/cloudinary";
import type {
  UploadApiErrorResponse,
  UploadApiResponse,
} from "cloudinary";

export async function POST(req: Request) {
  try {
    // =====================================================
    // ตรวจสอบ Login
    // =====================================================

    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          message: "กรุณาเข้าสู่ระบบก่อน",
        },
        {
          status: 401,
        }
      );
    }

    // =====================================================
    // รับ FormData
    // =====================================================

    const formData = await req.formData();

    const file = formData.get("file");

    // =====================================================
    // ตรวจสอบไฟล์
    // =====================================================

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        {
          message: "กรุณาเลือกไฟล์สลิป",
        },
        {
          status: 400,
        }
      );
    }

    // =====================================================
    // ตรวจสอบประเภทไฟล์
    // =====================================================

    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        {
          message:
            "รองรับเฉพาะไฟล์ JPG, PNG และ WEBP",
        },
        {
          status: 400,
        }
      );
    }

    // =====================================================
    // จำกัดขนาดไฟล์ 5MB
    // =====================================================

    const maxSize =
      5 * 1024 * 1024;

    if (file.size > maxSize) {
      return NextResponse.json(
        {
          message:
            "ขนาดไฟล์ต้องไม่เกิน 5MB",
        },
        {
          status: 400,
        }
      );
    }

    // =====================================================
    // แปลง File เป็น Buffer
    // =====================================================

    const bytes =
      await file.arrayBuffer();

    const buffer =
      Buffer.from(bytes);

    // =====================================================
    // Upload ไป Cloudinary
    // =====================================================

    const uploadResult =
      await new Promise<
        UploadApiResponse
      >(
        (
          resolve,
          reject
        ) => {
          const uploadStream =
            cloudinary.uploader.upload_stream(
              {
                folder:
                  "b-nine-trading/slips",

                resource_type:
                  "image",
              },

              (
                error:
                  UploadApiErrorResponse | undefined,

                result:
                  UploadApiResponse | undefined
              ) => {
                if (error) {
                  reject(error);

                  return;
                }

                if (!result) {
                  reject(
                    new Error(
                      "Cloudinary upload failed"
                    )
                  );

                  return;
                }

                resolve(result);
              }
            );

          uploadStream.end(
            buffer
          );
        }
      );

    // =====================================================
    // ส่ง URL กลับไปยัง Checkout
    // =====================================================

    return NextResponse.json(
      {
        success: true,

        message:
          "อัปโหลดสลิปสำเร็จ",

        slipUrl:
          uploadResult.secure_url,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(
      "Upload Slip Error:",
      error
    );

    return NextResponse.json(
      {
        message:
          "ไม่สามารถอัปโหลดสลิปได้",
      },
      {
        status: 500,
      }
    );
  }
}