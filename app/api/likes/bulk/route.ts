import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/authOptions";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

// POST /api/likes/bulk { mediaIds: string[] }
// Returns: { counts: Record<string, number>, liked: Record<string, boolean> }
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id as string | undefined;

    const body = await req.json();
    const mediaIds = Array.isArray(body?.mediaIds) ? body.mediaIds.filter((id: any) => typeof id === 'string') as string[] : [];
    if (!mediaIds.length) {
      return NextResponse.json({ counts: {}, liked: {} });
    }

    const validIds = mediaIds.filter((id) => ObjectId.isValid(id));
    const objectIds = validIds.map((id) => new ObjectId(id));

    const client = await clientPromise;
    const db = client.db("library");

    // Aggregate counts per mediaId
    const pipeline = [
      { $match: { mediaId: { $in: objectIds } } },
      { $group: { _id: "$mediaId", count: { $sum: 1 } } },
    ];
    const countDocs = await db.collection("likes").aggregate(pipeline).toArray();
    const counts: Record<string, number> = {};
    for (const d of countDocs) {
      counts[(d._id as ObjectId).toString()] = d.count as number;
    }

    // User liked map
    const liked: Record<string, boolean> = {};
    if (userId && ObjectId.isValid(userId)) {
      const uId = new ObjectId(userId);
      const likedDocs = await db
        .collection("likes")
        .find({ mediaId: { $in: objectIds }, userId: uId })
        .project({ mediaId: 1 })
        .toArray();
      for (const d of likedDocs) {
        liked[(d.mediaId as ObjectId).toString()] = true;
      }
    }

    return NextResponse.json({ counts, liked });
  } catch (e) {
    console.error("POST /api/likes/bulk error", e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
