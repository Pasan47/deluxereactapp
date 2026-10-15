import Dexie, { type Table } from "dexie";
import type { Workspace } from "../types/db";

export class AppDatabase extends Dexie {
  workspaces!: Table<Workspace, string>;
  pages!: Table<page, string>;
  blocks!: Table<Block, string>;
  mutationQueue!: Table<MutationQueueItem, number>;

  constructor() {
    super("offlineProductivityDB");
    this.version(1).stores({
      workspaces: "id, updatedAt, synced",
      pages: "id, workspaceId, parentId, updatedAt, delete, synced",
      blocks: "id, pageId, updatedAt, synced",
      mutationQueue: "++id, entityId, timestamp",
    });
  }
}

export const db = new AppDatabase();
