import { NextResponse } from "next/server";

import { getAuthenticatedUser } from "@/lib/auth/session";
import { findUserById, toPublicUser, updateUser } from "@/lib/auth/store";
import type { StudyGoal } from "@/lib/auth/types";
import {
  buildStudyProfile,
  extractSyllabusText,
  validatePersonalizationInput,
  validateSyllabusFile,
} from "@/lib/personalization/syllabus";

export const runtime = "nodejs";

export async function GET() {
  const authUser = await getAuthenticatedUser();

  if (!authUser) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  return NextResponse.json({ studyProfile: authUser.studyProfile });
}

export async function POST(request: Request) {
  const authUser = await getAuthenticatedUser();

  if (!authUser) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const formData = await request.formData().catch(() => null);

  if (!formData) {
    return NextResponse.json({ error: "Invalid personalization form." }, { status: 400 });
  }

  const file = formData.get("syllabusFile");
  const syllabusMode = formData.get("syllabusMode") === "upload" ? "upload" : "paste";
  const syllabusFile = syllabusMode === "upload" && file instanceof File ? file : null;
  const fileValidation = validateSyllabusFile(syllabusFile);

  if (!fileValidation.ok) {
    return NextResponse.json({ error: fileValidation.error }, { status: 400 });
  }

  const fileText = await extractSyllabusText(syllabusFile);

  if (syllabusMode === "upload" && !fileText.trim()) {
    const unsupportedUpload =
      syllabusFile?.type === "application/msword" ||
      syllabusFile?.type ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

    return NextResponse.json(
      {
        error: unsupportedUpload
          ? "DOC/DOCX extraction is not connected yet. Upload a PDF/TXT file or paste the syllabus manually."
          : "Could not extract readable text from this file. This usually means it is a scanned PDF. Use OCR first, or paste the syllabus manually.",
      },
      { status: 422 }
    );
  }

  const manualSyllabus =
    syllabusMode === "upload"
      ? fileText.trim()
      : String(formData.get("manualSyllabus") ?? "").trim();

  const validated = validatePersonalizationInput({
    studying: String(formData.get("studying") ?? ""),
    goal: String(formData.get("goal") ?? "other") as StudyGoal,
    preferences: String(formData.get("preferences") ?? ""),
    manualSyllabus,
    fixedCommitments: String(formData.get("fixedCommitments") ?? ""),
    choresAndErrands: String(formData.get("choresAndErrands") ?? ""),
    wellbeingAndFun: String(formData.get("wellbeingAndFun") ?? ""),
    planningNotes: String(formData.get("planningNotes") ?? ""),
  });

  if (!validated.ok) {
    return NextResponse.json({ error: validated.error }, { status: 400 });
  }

  const storedUser = await findUserById(authUser.id);

  if (!storedUser) {
    return NextResponse.json({ error: "User not found." }, { status: 404 });
  }

  const studyProfile = await buildStudyProfile({
    input: validated.value,
    existing: storedUser.studyProfile ?? null,
    asset: fileValidation.asset,
  });

  const updatedUser = await updateUser({
    ...storedUser,
    studyProfile,
  });

  return NextResponse.json({ user: toPublicUser(updatedUser) });
}
