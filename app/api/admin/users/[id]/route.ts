import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function PATCH(req: Request, context: any) {
  try {
    const id = (context?.params as { id: string })?.id;
    const body = await req.json().catch(() => ({}));
    const status = body?.status;

    if (status !== "Active" && status !== "Suspended") {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();
    const col = db.collection("users");

    // ✅ Force filter type to a broad Record<string, unknown>
    const filter: Record<string, unknown> = ObjectId.isValid(id)
      ? { _id: new ObjectId(id) }
      : { _id: id };

    const res = await col.updateOne(filter, { $set: { status } });

    if (res.matchedCount === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "Failed to update user" },
      { status: 500 }
    );
  }
}

export async function DELETE(_req: Request, context: any) {
  try {
    const id = (context?.params as { id: string })?.id;
    const client = await clientPromise;
    const db = client.db();
    const col = db.collection("users");

    // ✅ Same fix applied here
    const filter: Record<string, unknown> = ObjectId.isValid(id)
      ? { _id: new ObjectId(id) }
      : { _id: id };

    const res = await col.deleteOne(filter);

    if (res.deletedCount === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "Failed to delete user" },
      { status: 500 }
    );
  }
}
