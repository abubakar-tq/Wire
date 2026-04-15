import { NextRequest } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
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

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const body = await req.json();
    const rawMessages = body.messages || [];
    const currentView = body.currentView || "UNKNOWN PAGE";

    if (!Array.isArray(rawMessages) || rawMessages.length === 0) {
      return new Response(JSON.stringify({ error: "Messages array cannot be empty." }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    // MEMORY MANAGEMENT: Only keep the last 10 messages to limit token usage on long chats
    const memoryCappedMessages = rawMessages.slice(-10);

    // Format for Gemini API
    const history = memoryCappedMessages.slice(0, -1).map((msg: any) => ({
      role: msg.role === "assistant" ? "model" : "user",
      parts: [{ text: msg.content }]
    }));
    
    const latestMessage = memoryCappedMessages[memoryCappedMessages.length - 1].content;

    // INJECT DYNAMIC CONTEXT
    const finalSystemInstruction = SYSTEM_PROMPT.replace("{{CURRENT_VIEW}}", currentView);

    // Start Chat Session with Context
    const chatSession = model.startChat({
      history,
      systemInstruction: {
        parts: [{ text: finalSystemInstruction }]
      },
      generationConfig: {
        maxOutputTokens: 250, // Keep responses crisp and short
      }
    });

    const result = await chatSession.sendMessageStream(latestMessage);

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
    const message = error.status === 429 
      ? "WireGuide is catching its breath! Please try again in a moment." 
      : "WireGuide encountered an unexpected error. Please try again later.";
      
    return new Response(JSON.stringify({ error: message }), { 
      status: error.status || 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
