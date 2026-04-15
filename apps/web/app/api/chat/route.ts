import { NextRequest } from "next/server";
import { GoogleGenerativeAI, type Content } from "@google/generative-ai";
import { SYSTEM_PROMPT } from "./systemPrompt";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY || "";
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "Missing API Key configuration." }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }

    const body = await req.json();
    const rawMessages = body.messages || [];
    const currentView = body.currentView || "UNKNOWN PAGE";

    if (!Array.isArray(rawMessages) || rawMessages.length === 0) {
      return new Response(JSON.stringify({ error: "Messages array cannot be empty." }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    const contents = toGeminiContents(rawMessages);
    if (contents.length === 0 || contents[contents.length - 1]?.role !== "user") {
      return new Response(JSON.stringify({ error: "Latest chat message must be a non-empty user message." }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: process.env.GEMINI_MODEL || "gemini-2.5-flash" });

    // INJECT DYNAMIC CONTEXT
    const finalSystemInstruction = SYSTEM_PROMPT.replace("{{CURRENT_VIEW}}", currentView);

    const result = await model.generateContentStream({
      contents,
      systemInstruction: finalSystemInstruction,
      generationConfig: {
        maxOutputTokens: 250, // Keep responses crisp and short
      }
    });

    // STREAMING: Setup standard web stream to send chunks real-time to the frontend
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        try {
          for await (const chunk of result.stream) {
            const chunkText = chunk.text();
            controller.enqueue(encoder.encode(chunkText));
          }
          controller.close();
        } catch (streamError: any) {
          console.error("Stream generation error:", streamError);
          controller.enqueue(encoder.encode("\\n\\n[Connection Interrupted]"));
          controller.close();
        }
      }
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked",
        "Cache-Control": "no-cache",
      }
    });

  } catch (error: any) {
    console.error("WireGuide API Error:", error);
    
    // Fallback error messaging
    const message = toPublicGeminiError(error);
      
    return new Response(JSON.stringify({ error: message }), { 
      status: error.status || 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}

function toGeminiContents(rawMessages: unknown[]): Content[] {
  const normalized: Content[] = [];

  for (const rawMessage of rawMessages.slice(-10)) {
    if (!rawMessage || typeof rawMessage !== "object") continue;
    const message = rawMessage as { role?: unknown; content?: unknown };
    const text = typeof message.content === "string" ? message.content.trim() : "";
    if (!text) continue;

    const role = message.role === "assistant" ? "model" : "user";
    const previous = normalized[normalized.length - 1];

    if (previous?.role === role) {
      previous.parts.push({ text });
    } else {
      normalized.push({ role, parts: [{ text }] });
    }
  }

  return normalized;
}

function toPublicGeminiError(error: any): string {
  const message = typeof error?.message === "string" ? error.message : "";

  if (error?.status === 429) {
    return "WireGuide is catching its breath. Please try again in a moment.";
  }
  if (message.includes("API_KEY_INVALID") || message.includes("API key not valid")) {
    return "WireGuide is not configured with a valid Gemini API key. Add a valid GEMINI_API_KEY in apps/web/.env and restart the dev server.";
  }
  if (message.includes("models/") && (message.includes("not found") || message.includes("not supported"))) {
    return "WireGuide is configured with an unavailable Gemini model. Set GEMINI_MODEL to a supported model and restart the dev server.";
  }
  if (error?.status === 400) {
    return "WireGuide sent Gemini an invalid request. Please clear the chat and try again.";
  }

  return "WireGuide encountered an unexpected error. Please try again later.";
}
