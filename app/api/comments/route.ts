import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/authOptions";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const mediaId = searchParams.get("mediaId");
    if (!mediaId || !ObjectId.isValid(mediaId)) {
      return NextResponse.json({ error: "Invalid mediaId" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("library");

    const docs = await db
      .collection("comments")
      .find({ mediaId: new ObjectId(mediaId) })
      .sort({ createdAt: -1 })
      .limit(200)
      .toArray();

    const items = docs.map((d: any) => ({
      _id: d._id?.toString?.() ?? d._id,
      mediaId: d.mediaId?.toString?.() ?? d.mediaId,
      userId: d.userId?.toString?.() ?? d.userId ?? null,
      userName: d.userName ?? null,
      text: d.text,
      createdAt: d.createdAt,
    }));

    return NextResponse.json({ items });
  } catch (e) {
    console.error("GET /api/comments error", e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const user = (session as any)?.user;
    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const mediaId = body?.mediaId as string | undefined;
    const text = (body?.text as string | undefined)?.trim();
    if (!mediaId || !ObjectId.isValid(mediaId) || !text) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("library");

    const doc = {
      mediaId: new ObjectId(mediaId),
      userId: new ObjectId(user.id as string),
      userName: user.name ?? user.email ?? "User",
      text,
      createdAt: new Date(),
    };

    const insert = await db.collection("comments").insertOne(doc);

    return NextResponse.json({ id: insert.insertedId, item: { _id: insert.insertedId, ...doc, mediaId } }, { status: 201 });
  } catch (e) {
    console.error("POST /api/comments error", e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
