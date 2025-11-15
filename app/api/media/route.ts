import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type") as "video" | "image" | "pdf" | null;
    const scope = (searchParams.get("scope") as "dashboard" | "library" | null) ?? null;

    const client = await clientPromise;
    const db = client.db("library");
    const query: any = {};
    if (type) query.type = type;
    if (scope) query.scope = scope;

    const raw = await db
      .collection("media")
      .find(query)
      .sort({ createdAt: -1 })
      .limit(200)
      .toArray();

    const items = raw.map((d: any) => ({
      _id: d._id?.toString?.() ?? d._id,
      title: d.title,
      type: d.type,
      src: d.src,
      scope: d.scope,
      description: d.description ?? null,
      createdAt: d.createdAt,
      uploadedBy: d.uploadedBy ?? null,
    }));

    return NextResponse.json({ items });
  } catch (e) {
    console.error("GET /api/media error", e);
    return NextResponse.json({ error: "Failed to fetch media" }, { status: 500 });
  }
}
