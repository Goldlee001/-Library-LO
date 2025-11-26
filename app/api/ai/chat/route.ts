import { NextResponse } from "next/server";
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { message, history = [] } = await req.json();

    const messages = [
      {
        role: "system",
        content: `
You are a library AI assistant. 
You help students:
- find books
- suggest research topics
- explain criminology concepts
- recommend materials based on the question
Always answer clearly and professionally.`,
      },
      ...history,
      { role: "user", content: message },
    ];

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages,
    });

    return NextResponse.json({
      response: completion.choices[0].message.content,
    });
  } catch (err) {
    console.log(err);
    return NextResponse.json(
      { error: "AI error" },
      { status: 500 }
    );
  }
}
