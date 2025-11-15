import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/authOptions";
import clientPromise from "@/lib/mongodb";
import { v2 as cloudinary } from "cloudinary";

// --- Runtime settings for Next.js serverless ---
export const runtime = "nodejs";
export const maxDuration = 60;

// --- Cloudinary configuration (server-side only) ---
if (
  !process.env.CLOUDINARY_CLOUD_NAME ||
  !process.env.CLOUDINARY_API_KEY ||
  !process.env.CLOUDINARY_API_SECRET
) {
  console.warn("⚠️ Missing Cloudinary environment variables", {
    CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
    CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY ? "Loaded" : "Missing",
    CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET ? "Loaded" : "Missing",
  });
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
  secure: true,
});

// --- API Route ---
export async function POST(req: Request) {
  try {
    // Authenticate admin
    const session = await getServerSession(authOptions);
    const user = (session as any)?.user;

    if (!session || user?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Ensure Cloudinary env is configured at runtime
    if (
      !process.env.CLOUDINARY_CLOUD_NAME ||
      !process.env.CLOUDINARY_API_KEY ||
      !process.env.CLOUDINARY_API_SECRET
    ) {
      return NextResponse.json(
        { error: "Cloudinary environment variables are not configured on the server" },
        { status: 500 }
      );
    }

    // Extract form data
    const form = await req.formData();
    const file = form.get("file") as File | null;
    const title = (form.get("title") as string | null) ?? "Untitled";
    const description = (form.get("description") as string | null) ?? null;
    const type = (form.get("type") as string | null)?.toLowerCase();
    const scope = ((form.get("scope") as string | null) ?? "library").toLowerCase();

    // Validate input
    if (!file || !type || !["video", "image", "pdf"].includes(type)) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    // Convert File to Buffer for Cloudinary
    const buffer = Buffer.from(await file.arrayBuffer());

    // Upload to Cloudinary
    const uploadResult = await new Promise<any>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: `uploads/${type}`,
          resource_type: type === "video" ? "video" : "auto",
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      stream.end(buffer);
    });

    // Store in MongoDB
    const client = await clientPromise;
    const db = client.db("library");
    const doc = {
      title,
      type,
      src: uploadResult?.secure_url,
      scope,
      description: description && description.trim() ? description.trim() : null,
      createdAt: new Date(),
      uploadedBy: user?.id ?? null,
    };

    const insert = await db.collection("media").insertOne(doc);

    return NextResponse.json(
      { id: insert.insertedId, item: { _id: insert.insertedId, ...doc } },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("POST /api/admin/uploads error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
