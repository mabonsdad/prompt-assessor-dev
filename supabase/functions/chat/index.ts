import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, type } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    let systemPrompt: string;
    let requestMessages: Array<{ role: string; content: string }>;

    if (type === "critique") {
      // For critique: we analyze the user's prompt
      const userPrompt = messages[messages.length - 1]?.content || "";
      systemPrompt = `You are a prompt engineering expert. Your job is to critique the quality of prompts given to AI assistants.

Analyze the following prompt and provide:
1. **Overall Score**: Rate the prompt from 1-10
2. **Clarity Issues**: List any ambiguities or unclear aspects
3. **Missing Context**: What additional context could improve results?
4. **Potential Misinterpretations**: Ways the AI might misunderstand the intent
5. **Guardrails Missing**: What constraints or boundaries should be added?
6. **Suggested Improvements**: Provide 2-3 specific rewrites or additions

Be constructive but thorough. Format your response using markdown.`;

      requestMessages = [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: `Critique this prompt:\n\n"${userPrompt}"`,
        },
      ];
    } else {
      // For regular chat: act as a helpful assistant
      systemPrompt = `You are a helpful, knowledgeable AI assistant. Provide clear, accurate, and well-structured responses. Use markdown formatting when appropriate for better readability.`;

      requestMessages = [{ role: "system", content: systemPrompt }, ...messages];
    }

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: requestMessages,
          stream: true,
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required. Please add credits to continue." }),
          {
            status: 402,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "AI service error" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("Chat function error:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
