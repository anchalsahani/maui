"use client";

const CHANNEL_NAME = "maui-planning-sync";
const STORAGE_KEY = "maui-planning-pulse";

export function announcePlanningUpdate(revision: number) {
  if (typeof window === "undefined") {
    return;
  }

  const message = { revision, updatedAt: Date.now() };

  try {
    const channel = new BroadcastChannel(CHANNEL_NAME);
    channel.postMessage(message);
    channel.close();
  } catch {
    // Storage events keep older browsers and separate tabs in sync.
  }

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(message));
  } catch {
    // The server state remains authoritative if local storage is unavailable.
  }
}

export function subscribeToPlanningUpdates(onUpdate: () => void) {
  if (typeof window === "undefined") {
    return () => undefined;
  }

  let channel: BroadcastChannel | null = null;

  try {
    channel = new BroadcastChannel(CHANNEL_NAME);
    channel.onmessage = onUpdate;
  } catch {
    channel = null;
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY) {
      onUpdate();
    }
  };

  window.addEventListener("storage", onStorage);

  return () => {
    channel?.close();
    window.removeEventListener("storage", onStorage);
  };
}
