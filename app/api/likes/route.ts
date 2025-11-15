import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/authOptions";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

// GET /api/likes?mediaId=...
// Returns: { count: number, liked: boolean }
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const mediaId = searchParams.get("mediaId");
    if (!mediaId || !ObjectId.isValid(mediaId)) {
      return NextResponse.json({ error: "Invalid mediaId" }, { status: 400 });
    }

    const session = await getServerSession(authOptions);
    const userId = (session as any)?.user?.id as string | undefined;

    const client = await clientPromise;
    const db = client.db("library");

    const mId = new ObjectId(mediaId);

    const [count, likedDoc] = await Promise.all([
      db.collection("likes").countDocuments({ mediaId: mId }),
      userId && ObjectId.isValid(userId)
        ? db.collection("likes").findOne({ mediaId: mId, userId: new ObjectId(userId) })
        : Promise.resolve(null),
    ]);

    return NextResponse.json({ count, liked: !!likedDoc });
  } catch (e) {
    console.error("GET /api/likes error", e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

// POST /api/likes { mediaId: string, action: 'like' | 'unlike' | 'toggle' }
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!((session as any)?.user?.id)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const body = await req.json();
    const mediaId = body?.mediaId as string | undefined;
    const action = (body?.action as 'like' | 'unlike' | 'toggle' | undefined) ?? 'toggle';

    if (!mediaId || !ObjectId.isValid(mediaId)) {
      return NextResponse.json({ error: "Invalid mediaId" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("library");

    const mId = new ObjectId(mediaId);
    const uId = new ObjectId((session as any).user.id as string);

    const existing = await db.collection("likes").findOne({ mediaId: mId, userId: uId });

    let liked = false;

    if (action === 'like') {
      if (!existing) {
        await db.collection("likes").insertOne({ mediaId: mId, userId: uId, createdAt: new Date() });
      }
      liked = true;
    } else if (action === 'unlike') {
      if (existing) {
        await db.collection("likes").deleteOne({ _id: existing._id });
      }
      liked = false;
    } else {
      if (existing) {
        await db.collection("likes").deleteOne({ _id: existing._id });
        liked = false;
      } else {
        await db.collection("likes").insertOne({ mediaId: mId, userId: uId, createdAt: new Date() });
        liked = true;
      }
    }

    const count = await db.collection("likes").countDocuments({ mediaId: mId });

    return NextResponse.json({ liked, count });
  } catch (e) {
    console.error("POST /api/likes error", e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
