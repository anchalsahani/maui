interface StructuredResponseOptions {
  name: string;
  schema: Record<string, unknown>;
  instructions: string;
  input: unknown;
  maxOutputTokens?: number;
  thinkingBudget?: number;
  reasoningEffort?: "low" | "medium" | "high";
}

export class AIProviderUnavailableError extends Error {
  constructor(message = "No AI provider is configured.") {
    super(message);
    this.name = "AIProviderUnavailableError";
  }
}

export async function createStructuredResponse<T>(
  options: StructuredResponseOptions
): Promise<T> {
  if (process.env.AI_PROVIDER === "gemini") {
    return createGeminiStructuredResponse<T>(options);
  }

  return createOpenAIStructuredResponse<T>(options);
}

async function createOpenAIStructuredResponse<T>({
  name,
  schema,
  instructions,
  input,
  maxOutputTokens = 1200,
  reasoningEffort,
}: StructuredResponseOptions): Promise<T> {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new AIProviderUnavailableError(
      "OpenAI API key is not configured."
    );
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
      ...(reasoningEffort
        ? {
            reasoning: {
              effort: reasoningEffort,
            },
          }
        : {}),
    }),
  });

  if (!response.ok) {
    const message = await response.text().catch(() => "");
    throw new Error(message || "OpenAI request failed.");
  }

  const payload = (await response.json()) as unknown;
  const text = getOpenAIOutputText(payload);

  if (!text) {
    throw new Error("OpenAI response did not include structured output.");
  }

  return JSON.parse(text) as T;
}

async function createGeminiStructuredResponse<T>({
  schema,
  instructions,
  input,
  maxOutputTokens = 1200,
  thinkingBudget = 0,
}: StructuredResponseOptions): Promise<T> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new AIProviderUnavailableError(
      "Gemini API key is not configured."
    );
  }

  const model = process.env.GEMINI_MODEL ?? "gemini-2.5-flash";
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [
              {
                text: `${instructions}\n\nInput JSON:\n${JSON.stringify(input)}`,
              },
            ],
          },
        ],
        generationConfig: {
          maxOutputTokens,
          thinkingConfig: {
            thinkingBudget,
          },
          responseMimeType: "application/json",
          responseJsonSchema: toGeminiSchema(schema),
        },
      }),
    }
  );

  if (!response.ok) {
    const message = await response.text().catch(() => "");
    throw new Error(message || "Gemini request failed.");
  }

  const payload = (await response.json()) as unknown;
  const text = getGeminiOutputText(payload);

  if (!text) {
    throw new Error("Gemini response did not include structured output.");
  }

  return JSON.parse(text) as T;
}

function toGeminiSchema(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(toGeminiSchema);
  }

  if (!value || typeof value !== "object") {
    return value;
  }

  const source = value as Record<string, unknown>;
  const output: Record<string, unknown> = {};
  const unsupportedOrExpensiveConstraints = new Set([
    "additionalProperties",
    "maxLength",
    "minLength",
    "minItems",
    "maxItems",
    "minimum",
    "maximum",
  ]);

  for (const [key, entry] of Object.entries(source)) {
    if (unsupportedOrExpensiveConstraints.has(key)) {
      continue;
    }

    output[key] = toGeminiSchema(entry);
  }

  return output;
}

function getOpenAIOutputText(payload: unknown) {
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

function getGeminiOutputText(payload: unknown) {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  const candidates = (payload as { candidates?: unknown }).candidates;

  if (!Array.isArray(candidates)) {
    return null;
  }

  for (const candidate of candidates) {
    if (!candidate || typeof candidate !== "object") {
      continue;
    }

    const content = (candidate as { content?: unknown }).content;

    if (!content || typeof content !== "object") {
      continue;
    }

    const parts = (content as { parts?: unknown }).parts;

    if (!Array.isArray(parts)) {
      continue;
    }

    for (const part of parts) {
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
