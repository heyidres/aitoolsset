"use client";
import { useEffect, useState } from "react";

const SAVED_KEY = "ats-saved";
const VOTES_KEY = "ats-votes";

function readSet(key: string): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    return new Set(JSON.parse(localStorage.getItem(key) || "[]"));
  } catch {
    return new Set();
  }
}

function writeSet(key: string, set: Set<string>) {
  localStorage.setItem(key, JSON.stringify([...set]));
}

function readMap(key: string): Record<string, number> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(key) || "{}");
  } catch {
    return {};
  }
}

// One-shot per page load: pull the signed-in user's saved slugs from
// the server and union them into localStorage so any tool card the
// user has saved on another device shows as saved here too.
let dbSyncStarted = false;
let dbSyncDone: Promise<void> | null = null;

function syncFromServer(): Promise<void> {
  if (dbSyncDone) return dbSyncDone;
  if (dbSyncStarted) return dbSyncDone ?? Promise.resolve();
  dbSyncStarted = true;
  dbSyncDone = (async () => {
    try {
      const res = await fetch("/api/me/saves", { cache: "no-store" });
      if (!res.ok) return;
      const json = (await res.json()) as { saved?: string[] };
      const remote = json.saved ?? [];
      if (remote.length === 0) return;
      const set = readSet(SAVED_KEY);
      let changed = false;
      for (const slug of remote) if (!set.has(slug)) {
        set.add(slug);
        changed = true;
      }
      if (changed) {
        writeSet(SAVED_KEY, set);
        // Tell other useSaved instances to re-read
        window.dispatchEvent(new Event("ats-saved-sync"));
      }
    } catch {
      // Signed-out / offline / blocked — silent no-op
    }
  })();
  return dbSyncDone;
}

export function useSaved(slug: string) {
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setSaved(readSet(SAVED_KEY).has(slug));
    void syncFromServer().then(() => setSaved(readSet(SAVED_KEY).has(slug)));
    const onSync = () => setSaved(readSet(SAVED_KEY).has(slug));
    window.addEventListener("ats-saved-sync", onSync);
    return () => window.removeEventListener("ats-saved-sync", onSync);
  }, [slug]);

  const toggle = () => {
    // Optimistic local update first — feels instant regardless of network.
    const set = readSet(SAVED_KEY);
    const wasSaved = set.has(slug);
    if (wasSaved) set.delete(slug);
    else set.add(slug);
    writeSet(SAVED_KEY, set);
    setSaved(!wasSaved);

    // Fire-and-forget DB sync. 401 (signed out) and 404 (legacy
    // hardcoded tool) are both fine — we keep local state either way.
    void fetch("/api/me/saves", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ slug }),
    }).catch(() => {});
  };
  return { saved, toggle };
}

export function useVote(id: string) {
  const [voted, setVoted] = useState(false);
  useEffect(() => {
    setVoted((readMap(VOTES_KEY)[id] || 0) > 0);
  }, [id]);
  const toggle = () => {
    const map = readMap(VOTES_KEY);
    map[id] = (map[id] || 0) > 0 ? 0 : 1;
    localStorage.setItem(VOTES_KEY, JSON.stringify(map));
    setVoted(map[id] > 0);
  };
  return { voted, toggle };
}
