import { MatchAction, SyncMutation, TournamentState } from "@/types/tournament";
import { openDB, DBSchema, IDBPDatabase } from "idb";

interface CarbonDB extends DBSchema {
  pending_mutations: {
    key: string;
    value: SyncMutation;
    indexes: { "by-timestamp": number };
  };
  cached_state: {
    key: string;
    value: TournamentState;
  };
}

const DB_NAME = "carbon_shuttles_db";
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<CarbonDB>> | null = null;

export function getDB() {
  if (typeof window === "undefined") return null;
  if (!dbPromise) {
    dbPromise = openDB<CarbonDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains("pending_mutations")) {
          const store = db.createObjectStore("pending_mutations", {
            keyPath: "id",
          });
          store.createIndex("by-timestamp", "timestamp");
        }
        if (!db.objectStoreNames.contains("cached_state")) {
          db.createObjectStore("cached_state");
        }
      },
    });
  }
  return dbPromise;
}

export async function saveMutationOffline(action: MatchAction): Promise<SyncMutation> {
  const db = await getDB();
  const mutation: SyncMutation = {
    id: `mut_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    timestamp: Date.now(),
    action,
    synced: false,
  };

  if (db) {
    await db.put("pending_mutations", mutation);
  }
  return mutation;
}

export async function getPendingMutations(): Promise<SyncMutation[]> {
  const db = await getDB();
  if (!db) return [];
  const mutations = await db.getAllFromIndex("pending_mutations", "by-timestamp");
  return mutations.filter((m) => !m.synced);
}

export async function clearSyncedMutations(ids: string[]): Promise<void> {
  const db = await getDB();
  if (!db) return;
  const tx = db.transaction("pending_mutations", "readwrite");
  for (const id of ids) {
    await tx.store.delete(id);
  }
  await tx.done;
}

export async function cacheTournamentStateOffline(state: TournamentState): Promise<void> {
  const db = await getDB();
  if (!db) return;
  await db.put("cached_state", state, "latest_state");
}

export async function getCachedTournamentState(): Promise<TournamentState | null> {
  const db = await getDB();
  if (!db) return null;
  const state = await db.get("cached_state", "latest_state");
  return state || null;
}
