import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { compare } from "bcryptjs";
import jwt from "jsonwebtoken";

// POST /api/auth/login
export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    // connect to MongoDB
    const client = await clientPromise;
    const db = client.db("library");

    const user = await db.collection("users").findOne({ email });

    if (!user) {
      return NextResponse.json({ error: "No user found with this email" }, { status: 404 });
    }

    // block suspended/blocked/banned users
    if (user.status) {
      const st = String(user.status).toLowerCase();
      if (["suspended", "blocked", "banned"].includes(st)) {
        return NextResponse.json({ error: "This user is suspended." }, { status: 403 });
      }
    }

    // compare password with hash
    const isValid = await compare(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    // create JWT token
    const token = jwt.sign(
      {
        id: user._id.toString(),
        email: user.email,
        role: user.role || "user",
      },
      process.env.NEXTAUTH_SECRET!,
      { expiresIn: "7d" }
    );

    // you can return token + user info
    return NextResponse.json(
      {
        message: "Login successful",
        token,
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
