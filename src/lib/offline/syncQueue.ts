import {
  clearSyncedMutations,
  getPendingMutations,
  saveMutationOffline,
} from "./db";
import { MatchAction } from "@/types/tournament";

export type SyncStatusListener = (status: {
  isOnline: boolean;
  pendingCount: number;
  isSyncing: boolean;
}) => void;

class SyncQueueManager {
  private isSyncing = false;
  private listeners: Set<SyncStatusListener> = new Set();
  private pendingCount = 0;

  constructor() {
    if (typeof window !== "undefined") {
      window.addEventListener("online", () => {
        this.notify();
        this.flushQueue();
      });
      window.addEventListener("offline", () => {
        this.notify();
      });
      // Initial count check
      this.refreshCount();
    }
  }

  public subscribe(listener: SyncStatusListener) {
    this.listeners.add(listener);
    listener({
      isOnline: typeof navigator !== "undefined" ? navigator.onLine : true,
      pendingCount: this.pendingCount,
      isSyncing: this.isSyncing,
    });
    return () => this.listeners.delete(listener);
  }

  private notify() {
    const isOnline = typeof navigator !== "undefined" ? navigator.onLine : true;
    for (const listener of this.listeners) {
      listener({
        isOnline,
        pendingCount: this.pendingCount,
        isSyncing: this.isSyncing,
      });
    }
  }

  public async refreshCount(): Promise<number> {
    const pending = await getPendingMutations();
    this.pendingCount = pending.length;
    this.notify();
    return this.pendingCount;
  }

  public async enqueueAndSync(action: MatchAction): Promise<void> {
    await saveMutationOffline(action);
    await this.refreshCount();

    if (navigator.onLine) {
      await this.flushQueue();
    }
  }

  public async flushQueue(): Promise<boolean> {
    if (this.isSyncing || !navigator.onLine) return false;

    try {
      this.isSyncing = true;
      this.notify();

      const pending = await getPendingMutations();
      if (pending.length === 0) {
        this.isSyncing = false;
        this.notify();
        return true;
      }

      const res = await fetch("/api/matches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mutations: pending }),
      });

      if (!res.ok) {
        throw new Error(`Sync HTTP error: ${res.status}`);
      }

      const idsToRemove = pending.map((m) => m.id);
      await clearSyncedMutations(idsToRemove);
      await this.refreshCount();

      return true;
    } catch (err) {
      console.warn("Background sync failed, will retry:", err);
      return false;
    } finally {
      this.isSyncing = false;
      this.notify();
    }
  }
}

export const syncQueue = new SyncQueueManager();
