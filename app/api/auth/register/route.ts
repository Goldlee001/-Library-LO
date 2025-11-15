import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { hash } from "bcryptjs";

export async function POST(req: Request) {
  try {
    const url = new URL(req.url);
    const refFromQuery = url.searchParams.get("ref");
    const body = await req.json();
    const { username, name, email, password, confirmPassword, repeatPassword } = body as any;
    const refFromBody: string | null = body?.ref || body?.referralCode || body?.referredByCode || null;

    const finalName = username || name;
    const finalConfirm = confirmPassword || repeatPassword;

    if (!finalName || !email || !password || !finalConfirm) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    if (password !== finalConfirm) {
      return NextResponse.json({ error: "Passwords do not match" }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters long" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("library");

    const existingUser = await db.collection("users").findOne({ email });
    if (existingUser) {
      return NextResponse.json({ error: "User already exists" }, { status: 400 });
    }

    const hashedPassword = await hash(password, 10);

    // Resolve referrer by referralCode if provided
    let referredBy: string | undefined = undefined;
    const ref = refFromBody || refFromQuery || null;
    if (ref) {
      const referrer = await db.collection("users").findOne({ referralCode: ref });
      if (referrer?._id) {
        referredBy = referrer._id.toString();
      }
    }

    const result = await db.collection("users").insertOne({
      name: finalName,
      email,
      passwordHash: hashedPassword,
      role: "user",
      status: "active",
      balance: 5, // welcome bonus
      totalInvested: 0,
      totalEarnings: 5, // count welcome bonus as earnings
      welcomeBonusGranted: true,
      referredBy: referredBy || null,
      createdAt: new Date(),
    });

    if (!result.insertedId) {
      throw new Error("User creation failed");
    }

    return NextResponse.json({ message: "User registered successfully" }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
