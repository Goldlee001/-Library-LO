import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { compare } from "bcryptjs";
import jwt from "jsonwebtoken";

// Reuse cached DB connection to avoid slow re-connects
let cachedDb: any = null;

async function getDb() {
  if (cachedDb) return cachedDb;

  const client = await clientPromise;
  cachedDb = client.db("library");

  // Ensure index exists (fast login always)
  cachedDb.collection("users").createIndex({ email: 1 });

  return cachedDb;
}

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const db = await getDb();

    // Use projection to reduce payload → faster DB lookup
    const user = await db.collection("users").findOne(
      { email },
      { projection: { passwordHash: 1, email: 1, name: 1, role: 1, status: 1 } }
    );

    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    // blocked/suspended
    if (user.status && ["suspended", "blocked", "banned"].includes(String(user.status).toLowerCase())) {
      return NextResponse.json(
        { error: "This user is suspended." },
        { status: 403 }
      );
    }

    // verify password
    const isValid = await compare(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    // Sign JWT
    const token = jwt.sign(
      {
        id: user._id.toString(),
        email: user.email,
        role: user.role ?? "user",
      },
      process.env.NEXTAUTH_SECRET!,
      { expiresIn: "7d" }
    );

    return NextResponse.json(
      {
        message: "Login successful",
        token,
        user: {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          role: user.role,
        },
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("Login error:", err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
