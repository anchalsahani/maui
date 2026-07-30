import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import { hasKvStore, kvGetJson, kvSetJson } from "@/lib/storage/kv";
import type { AuthUser, StoredUser } from "./types";

const DATA_DIR = path.join(process.cwd(), ".local-data");
const USERS_FILE = path.join(DATA_DIR, "users.json");
const USERS_KEY = "maui:users";

async function ensureStore() {
  await mkdir(DATA_DIR, { recursive: true });

  try {
    await readFile(USERS_FILE, "utf8");
  } catch {
    await writeFile(USERS_FILE, "[]", "utf8");
  }
}

async function readUsers(): Promise<StoredUser[]> {
  if (hasKvStore()) {
    const users = await kvGetJson<StoredUser[]>(USERS_KEY);
    return Array.isArray(users) ? users.map(normalizeStoredUser) : [];
  }

  await ensureStore();
  const raw = await readFile(USERS_FILE, "utf8");

  try {
    const parsed = JSON.parse(raw) as StoredUser[];
    return Array.isArray(parsed) ? parsed.map(normalizeStoredUser) : [];
  } catch {
    return [];
  }
}

async function writeUsers(users: StoredUser[]) {
  if (hasKvStore()) {
    await kvSetJson(USERS_KEY, users);
    return;
  }

  await ensureStore();
  await writeFile(USERS_FILE, JSON.stringify(users, null, 2), "utf8");
}

export async function findUserByEmail(email: string) {
  const users = await readUsers();
  return users.find((user) => user.email.toLowerCase() === email.toLowerCase()) ?? null;
}

export async function findUserById(id: string) {
  const users = await readUsers();
  return users.find((user) => user.id === id) ?? null;
}

export async function findUserByGoogleId(googleId: string) {
  const users = await readUsers();
  return users.find((user) => user.googleId === googleId) ?? null;
}

export async function createUser(user: StoredUser) {
  const users = await readUsers();
  users.push(user);
  await writeUsers(users);
  return user;
}

export async function updateUser(updatedUser: StoredUser) {
  const users = await readUsers();
  const nextUsers = users.map((user) =>
    user.id === updatedUser.id ? updatedUser : user
  );
  await writeUsers(nextUsers);
  return updatedUser;
}

export function toPublicUser(user: StoredUser): AuthUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    createdAt: user.createdAt,
    onboardingCompleted: user.onboardingCompleted ?? false,
    survey: user.survey ?? null,
    onboardingDraft: user.onboardingDraft ?? null,
    studyProfile: normalizeStudyProfile(user.studyProfile ?? null),
  };
}

function normalizeStudyProfile(profile: StoredUser["studyProfile"]) {
  if (!profile) {
    return null;
  }

  return {
    ...profile,
    fixedCommitments: profile.fixedCommitments ?? "",
    choresAndErrands: profile.choresAndErrands ?? "",
    wellbeingAndFun: profile.wellbeingAndFun ?? "",
    planningNotes: profile.planningNotes ?? "",
  };
}

function normalizeStoredUser(user: StoredUser): StoredUser {
  return {
    ...user,
    onboardingCompleted: user.onboardingCompleted ?? false,
    survey: user.survey ?? null,
    onboardingDraft: user.onboardingDraft ?? null,
    studyProfile: user.studyProfile ?? null,
  };
}
