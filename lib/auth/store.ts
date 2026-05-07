import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import type { AuthUser, StoredUser } from "./types";

const DATA_DIR = path.join(process.cwd(), ".local-data");
const USERS_FILE = path.join(DATA_DIR, "users.json");

async function ensureStore() {
  await mkdir(DATA_DIR, { recursive: true });

  try {
    await readFile(USERS_FILE, "utf8");
  } catch {
    await writeFile(USERS_FILE, "[]", "utf8");
  }
}

async function readUsers(): Promise<StoredUser[]> {
  await ensureStore();
  const raw = await readFile(USERS_FILE, "utf8");

  try {
    const parsed = JSON.parse(raw) as StoredUser[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writeUsers(users: StoredUser[]) {
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

export async function createUser(user: StoredUser) {
  const users = await readUsers();
  users.push(user);
  await writeUsers(users);
  return user;
}

export function toPublicUser(user: StoredUser): AuthUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    createdAt: user.createdAt,
  };
}

