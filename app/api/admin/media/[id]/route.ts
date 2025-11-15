import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/authOptions";
import clientPromise from "@/lib/mongodb";
import { ObjectId, Db } from "mongodb";

export const runtime = "nodejs";

interface Media {
  _id: ObjectId;
  title: string;
  type: string;
  src: string;
  scope: "dashboard" | "library";
  createdAt: Date;
}

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session || (session as any).user?.role !== "admin") {
    return null;
  }
  return session;
}

// ✅ DELETE /api/admin/media/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> } // <-- required by Next.js 15
) {
  const { id } = await params;

  try {
    const session = await requireAdmin();
    if (!session)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }

    const client = await clientPromise;
    const db: Db = client.db("library");

    const result = await db
      .collection<Media>("media")
      .deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("DELETE /api/admin/media/[id] error", e);
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}

// ✅ PATCH /api/admin/media/[id]
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> } // <-- same change here
) {
  const { id } = await params;

  try {
    const session = await requireAdmin();
    if (!session)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }

    const body = await request.json();
    const update: Partial<Pick<Media, "title" | "scope">> = {};

    if (typeof body.title === "string") update.title = body.title;
    if (
      body.scope &&
      (body.scope === "dashboard" || body.scope === "library")
    ) {
      update.scope = body.scope;
    }

    if (Object.keys(update).length === 0) {
      return NextResponse.json({ error: "No valid fields" }, { status: 400 });
    }

    const client = await clientPromise;
    const db: Db = client.db("library");

    const result = await db
      .collection<Media>("media")
      .findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: update },
        { returnDocument: "after" }
      );

    const updated =
      (result && "value" in result ? result.value : null) as Media | null;

    if (!updated) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const item = {
      _id: updated._id.toString(),
      title: updated.title,
      type: updated.type,
      src: updated.src,
      scope: updated.scope,
      createdAt: updated.createdAt,
    };

    return NextResponse.json({ item });
  } catch (e) {
    console.error("PATCH /api/admin/media/[id] error", e);
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}
