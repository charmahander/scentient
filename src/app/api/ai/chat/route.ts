import { NextRequest, NextResponse } from "next/server";
import { anthropic } from "@/lib/anthropic";
import { prisma } from "@/lib/prisma";
import { buildSystemPrompt } from "@/lib/recommendations/ai-prompts";
import { parseJson } from "@/lib/utils";

export async function POST(req: NextRequest) {
  try {
    const { messages, weather } = await req.json();

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: "ANTHROPIC_API_KEY not configured. Add it to your .env file." },
        { status: 503 }
      );
    }

    // Fetch collection for context
    const fragrances = await prisma.fragrance.findMany({
      include: { fragranceNotes: { include: { note: true } } },
    });

    const parsedFragrances = fragrances.map((f) => ({
      ...f,
      season: parseJson<string[]>(f.season, []),
      timeOfDay: parseJson<string[]>(f.timeOfDay, []),
      occasion: parseJson<string[]>(f.occasion, []),
      accords: parseJson<string[]>(f.accords, []),
    }));

    const systemPrompt = buildSystemPrompt(parsedFragrances as never, weather);

    // Stream the response
    const stream = await anthropic.messages.stream({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      system: systemPrompt,
      messages: messages.map((m: { role: string; content: string }) => ({
        role: m.role,
        content: m.content,
      })),
    });

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        for await (const chunk of stream) {
          if (
            chunk.type === "content_block_delta" &&
            chunk.delta.type === "text_delta"
          ) {
            controller.enqueue(encoder.encode(chunk.delta.text));
          }
        }
        controller.close();
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked",
      },
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "AI request failed" }, { status: 500 });
  }
}
