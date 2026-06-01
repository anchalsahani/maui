interface StructuredResponseOptions {
  name: string;
  schema: Record<string, unknown>;
  instructions: string;
  input: unknown;
  maxOutputTokens?: number;
}

export class OpenAIUnavailableError extends Error {
  constructor(message = "OpenAI API key is not configured.") {
    super(message);
    this.name = "OpenAIUnavailableError";
  }
}

export async function createStructuredResponse<T>({
  name,
  schema,
  instructions,
  input,
  maxOutputTokens = 1200,
}: StructuredResponseOptions): Promise<T> {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new OpenAIUnavailableError();
  }

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL ?? "gpt-5",
      input: [
        {
          role: "system",
          content: instructions,
        },
        {
          role: "user",
          content: JSON.stringify(input),
        },
      ],
      max_output_tokens: maxOutputTokens,
      text: {
        format: {
          type: "json_schema",
          name,
          strict: true,
          schema,
        },
      },
    }),
  });

  if (!response.ok) {
    const message = await response.text().catch(() => "");
    throw new Error(message || "OpenAI request failed.");
  }

  const payload = (await response.json()) as unknown;
  const text = getOutputText(payload);

  if (!text) {
    throw new Error("OpenAI response did not include structured output.");
  }

  return JSON.parse(text) as T;
}

function getOutputText(payload: unknown) {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  const directText = (payload as { output_text?: unknown }).output_text;

  if (typeof directText === "string") {
    return directText;
  }

  const output = (payload as { output?: unknown }).output;

  if (!Array.isArray(output)) {
    return null;
  }

  for (const item of output) {
    if (!item || typeof item !== "object") {
      continue;
    }

    const content = (item as { content?: unknown }).content;

    if (!Array.isArray(content)) {
      continue;
    }

    for (const part of content) {
      if (!part || typeof part !== "object") {
        continue;
      }

      const text = (part as { text?: unknown }).text;

      if (typeof text === "string") {
        return text;
      }
    }
  }

  return null;
}
