import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db();
    const col = db.collection("users");

    const docs = await col
      .find({}, { projection: { password: 0, hash: 0 } })
      .sort({ createdAt: -1 })
      .toArray();

    const users = docs.map((doc: any) => {
      const created = doc.createdAt ?? doc.created_at ?? doc.created_at_ms ?? doc.joined;
      const joinedISO = created
        ? new Date(typeof created === "number" ? created : String(created)).toISOString()
        : new Date().toISOString();
      return {
        id: String(doc._id),
        name: doc.name || doc.fullName || doc.username || "Unnamed",
        email: doc.email || "",
        joined: joinedISO,
        status: doc.status === "Suspended" ? "Suspended" : "Active",
        investment: typeof doc.investment === "number" ? doc.investment : 0,
        role: (doc.role === "admin" ? "admin" : "user") as "admin" | "user",
      };
    });

    return NextResponse.json(users, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Failed to fetch users" }, { status: 500 });
  }
}
