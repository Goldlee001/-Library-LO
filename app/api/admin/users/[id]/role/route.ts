import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function PUT(req: Request, context: any) {
  try {
    const id = (context?.params as { id: string })?.id;
    const body = await req.json().catch(() => ({}));
    const role = body?.role;

    if (role !== "admin" && role !== "user") {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();
    const col = db.collection<any>("users");

    const filter: any = ObjectId.isValid(id) ? { _id: new ObjectId(id) } : { _id: id };
    const res = await col.updateOne(filter, { $set: { role } });

    if (res.matchedCount === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ ok: true, role }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Failed to update role" }, { status: 500 });
  }
}
