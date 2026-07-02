import { randomUUID } from "node:crypto";
import path from "node:path";

import type {
  GeneratedStudyTask,
  StudyGoal,
  StudyProfile,
  SyllabusAsset,
  SyllabusTopic,
} from "@/lib/auth/types";
import {
  AIProviderUnavailableError,
  createStructuredResponse,
} from "@/lib/ai/provider";

const allowedGoals: StudyGoal[] = ["exam", "course", "skill", "revision", "other"];
const allowedFileTypes = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
]);
const OCR_PAGE_LIMIT = 10;
const KNOWN_PROFILE_SUBJECTS = [
  "Study and learning",
  "Fixed commitments and appointments",
  "Chores, errands, and household work",
  "Wellbeing, games, rest, and social time",
  "Planning notes and support rules",
] as const;

interface AiSyllabusTopic {
  title: string;
  subject: string;
  difficulty: "easy" | "medium" | "hard";
  priority: "low" | "medium" | "high";
  estimatedMinutes: number;
}

export interface PersonalizationInput {
  studying: string;
  goal: StudyGoal;
  preferences: string;
  manualSyllabus: string;
  fixedCommitments: string;
  choresAndErrands: string;
  wellbeingAndFun: string;
  planningNotes: string;
}

export function validatePersonalizationInput(input: PersonalizationInput) {
  const studying = input.studying.trim();
  const goal = input.goal;
  const preferences = input.preferences.trim();
  const manualSyllabus = input.manualSyllabus.trim();
  const fixedCommitments = input.fixedCommitments.trim();
  const choresAndErrands = input.choresAndErrands.trim();
  const wellbeingAndFun = input.wellbeingAndFun.trim();
  const planningNotes = input.planningNotes.trim();

  if (studying.length < 2) {
    return { ok: false as const, error: "Tell Maui what you are studying." };
  }

  if (!allowedGoals.includes(goal)) {
    return { ok: false as const, error: "Choose a valid study goal." };
  }

  if (!manualSyllabus && !fixedCommitments && !choresAndErrands && !wellbeingAndFun) {
    return {
      ok: false as const,
      error: "Add at least one study, chore, appointment, routine, or rest item.",
    };
  }

  return {
    ok: true as const,
    value: {
      studying,
      goal,
      preferences,
      manualSyllabus,
      fixedCommitments,
      choresAndErrands,
      wellbeingAndFun,
      planningNotes,
    },
  };
}

export function validateSyllabusFile(file: File | null) {
  if (!file || file.size === 0) {
    return { ok: true as const, asset: null };
  }

  if (!allowedFileTypes.has(file.type)) {
    return {
      ok: false as const,
      error: "Upload a PDF, DOC, DOCX, or TXT syllabus file.",
    };
  }

  if (file.size > 8 * 1024 * 1024) {
    return {
      ok: false as const,
      error: "Keep syllabus uploads under 8 MB for now.",
    };
  }

  const asset: SyllabusAsset = {
    id: randomUUID(),
    fileName: file.name,
    fileType: file.type,
    fileSize: file.size,
    uploadedAt: new Date().toISOString(),
    parseStatus: "completed",
    error: null,
  };

  return { ok: true as const, asset };
}

export async function extractSyllabusText(file: File | null) {
  if (!file || file.size === 0) {
    return "";
  }

  if (file.type === "text/plain") {
    return file.text();
  }

  if (file.type === "application/pdf") {
    const { PDFParse } = await import("pdf-parse");
    const buffer = Buffer.from(await file.arrayBuffer());
    const parser = new PDFParse({ data: buffer });

    try {
      const result = await parser.getText();
      const text = result.text.trim();

      if (text.length > 40) {
        return text;
      }

      return extractTextFromScannedPdf(buffer);
    } finally {
      await parser.destroy();
    }
  }

  return "";
}

async function extractTextFromScannedPdf(buffer: Buffer) {
  const { PDFParse } = await import("pdf-parse");
  const { createWorker } = await import("tesseract.js");
  const parser = new PDFParse({ data: buffer });
  const worker = await createWorker("eng", undefined, {
    gzip: true,
    langPath: path.join(
      process.cwd(),
      "node_modules",
      "@tesseract.js-data",
      "eng",
      "4.0.0"
    ),
  });

  try {
    const screenshots = await parser.getScreenshot({
      first: OCR_PAGE_LIMIT,
      desiredWidth: 1800,
      imageBuffer: true,
      imageDataUrl: false,
    });
    const pageTexts: string[] = [];

    for (const page of screenshots.pages) {
      const result = await worker.recognize(Buffer.from(page.data));
      const pageText = result.data.text.trim();

      if (pageText) {
        pageTexts.push(pageText);
      }
    }

    return pageTexts.join("\n").trim();
  } finally {
    await worker.terminate();
    await parser.destroy();
  }
}

export async function buildStudyProfile({
  input,
  existing,
  asset,
}: {
  input: PersonalizationInput;
  existing: StudyProfile | null;
  asset: SyllabusAsset | null;
}) {
  const source = buildWholeDaySource(input);
  const fallbackTopics = parseSyllabusTopics(source, input.studying);
  const aiTopics = shouldUseAiTopicExtraction(source, fallbackTopics)
    ? await extractTopicsWithAi(source, input.studying)
    : [];
  const topics = aiTopics.length > 1 ? aiTopics : fallbackTopics;
  const generatedTasks = generateStudyTasks(topics);
  const now = new Date().toISOString();

  return {
    studying: input.studying,
    goal: input.goal,
    preferences: input.preferences,
    manualSyllabus: input.manualSyllabus,
    fixedCommitments: input.fixedCommitments,
    choresAndErrands: input.choresAndErrands,
    wellbeingAndFun: input.wellbeingAndFun,
    planningNotes: input.planningNotes,
    syllabusAsset: asset ?? existing?.syllabusAsset ?? null,
    topics,
    generatedTasks,
    roadmapStatus: topics.length > 0 ? "ready" : "empty",
    lastProcessedAt: topics.length > 0 ? now : null,
    updatedAt: now,
  } satisfies StudyProfile;
}

function shouldUseAiTopicExtraction(source: string, fallbackTopics: SyllabusTopic[]) {
  return source.length > 250 && fallbackTopics.length >= 3;
}

async function extractTopicsWithAi(
  source: string,
  studying: string
): Promise<SyllabusTopic[]> {
  try {
    const result = await createStructuredResponse<{ topics: AiSyllabusTopic[] }>({
      name: "syllabus_topics",
      schema: {
        type: "object",
        additionalProperties: false,
        required: ["topics"],
        properties: {
          topics: {
            type: "array",
            minItems: 0,
            maxItems: 60,
            items: {
              type: "object",
              additionalProperties: false,
              required: [
                "title",
                "subject",
                "difficulty",
                "priority",
                "estimatedMinutes",
              ],
              properties: {
                title: { type: "string", maxLength: 100 },
                subject: { type: "string", maxLength: 80 },
                difficulty: { type: "string", enum: ["easy", "medium", "hard"] },
                priority: { type: "string", enum: ["low", "medium", "high"] },
                estimatedMinutes: { type: "integer", minimum: 10, maximum: 180 },
              },
            },
          },
        },
      },
      instructions:
        "Extract concise study, commitment, chore, wellbeing, and planning topics from the user's personalization text. Keep tasks concrete, deduplicate overlapping items, preserve the source category as subject, and return only schema-valid JSON.",
      maxOutputTokens: 2200,
      input: {
        studying,
        source: source.slice(0, 12000),
        knownSubjects: KNOWN_PROFILE_SUBJECTS,
      },
    });

    return result.topics
      .filter((topic) => topic.title.trim().length > 0)
      .map((topic, index) => ({
        id: randomUUID(),
        title: topic.title.trim(),
        subject: topic.subject.trim() || studying,
        difficulty: topic.difficulty,
        priority: topic.priority,
        estimatedMinutes: Math.min(180, Math.max(10, topic.estimatedMinutes)),
        sourceLine: index + 1,
      }));
  } catch (error) {
    if (!(error instanceof AIProviderUnavailableError)) {
      console.error("AI syllabus extraction failed", error);
    }

    return [];
  }
}

function buildWholeDaySource(input: PersonalizationInput) {
  return [
    section("Study and learning", input.manualSyllabus),
    section("Fixed commitments and appointments", input.fixedCommitments),
    section("Chores, errands, and household work", input.choresAndErrands),
    section("Wellbeing, games, rest, and social time", input.wellbeingAndFun),
    section("Planning notes and support rules", input.planningNotes),
  ]
    .filter(Boolean)
    .join("\n");
}

function section(title: string, body: string) {
  return body.trim() ? `${title}\n${body.trim()}` : "";
}

function parseSyllabusTopics(text: string, studying: string): SyllabusTopic[] {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.replace(/^[-*•\d.)\s]+/, "").trim())
    .filter(Boolean);

  const normalizedLines = (lines.length > 0 ? lines : [studying]).flatMap((line) => {
    const parts = line
      .split(/[,;|]+/)
      .map((part) => part.trim())
      .filter((part) => part.length > 0);

    return parts.length > 1 ? parts : [line];
  });
  let currentSubject = studying;

  const topics = normalizedLines
    .slice(0, 120)
    .reduce<SyllabusTopic[]>((acc, line, index) => {
      const isSubjectHeading =
        line.length < 64 &&
        /^(unit|module|subject|paper|chapter|study|fixed|chores|errands|household|wellbeing|games|rest|social|planning|support|rules)\b/i.test(
          line
        );

      if (isSubjectHeading) {
        currentSubject = line;
      }

      if (isProfileSectionHeading(line)) {
        return acc;
      }

      const estimatedMinutes = Math.min(120, Math.max(25, Math.ceil(line.length / 2)));
      const priority = index < 6 ? "high" : index < 18 ? "medium" : "low";
      const difficulty = estimatedMinutes > 70 ? "hard" : estimatedMinutes > 40 ? "medium" : "easy";

      acc.push({
        id: randomUUID(),
        title: line,
        subject: currentSubject,
        difficulty,
        priority,
        estimatedMinutes,
        sourceLine: index + 1,
      });

      return acc;
    }, []);

  return topics;
}

function generateStudyTasks(topics: SyllabusTopic[]): GeneratedStudyTask[] {
  return topics.slice(0, 60).map((topic, index) => {
    const deadline = new Date(Date.now() + (index + 1) * 24 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 10);

    const isStudyTask = /study|learning|subject|unit|module|chapter|paper/i.test(
      topic.subject
    );

    return {
      id: randomUUID(),
      title: isStudyTask ? `Study ${topic.title}` : topic.title,
      topicId: topic.id,
      subject: topic.subject,
      category: getTaskCategory(topic.subject),
      status: "todo",
      priority: topic.priority,
      difficulty: topic.difficulty,
      deadline,
      progress: 0,
      recurrence: isStudyTask
        ? topic.priority === "high"
          ? "revision_1_3_7"
          : "weekly"
        : "none",
      estimatedMinutes: topic.estimatedMinutes,
    };
  });
}

function isProfileSectionHeading(line: string) {
  return /^(study and learning|fixed commitments and appointments|chores, errands, and household work|wellbeing, games, rest, and social time|planning notes and support rules)$/i.test(
    line
  );
}

function getTaskCategory(subject: string): GeneratedStudyTask["category"] {
  if (/fixed|appointment|commitment/i.test(subject)) {
    return "commitment";
  }

  if (/chore|errand|household/i.test(subject)) {
    return "chore";
  }

  if (/wellbeing|games|rest|social/i.test(subject)) {
    return "wellbeing";
  }

  if (/planning|support|rules/i.test(subject)) {
    return "wellbeing";
  }

  return "study";
}
