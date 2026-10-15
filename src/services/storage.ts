import { db } from "./db";
import { v4 as uuidv4 } from "uuid";
import { BaseEntity, Page, Block } from "../types/db";
export const storageService = {
  async createEntity<T extends BaseEntity>(
    table: "workspaces" | "pages" | "blocks",
    data: Omit<T, keyof BaseEntity>,
  ): Promise<T> {
    const now = Date.now();
    const newItem = {
      ...data,
      id: uuidv4(),
      updatedAt: now,
      deleted: false,
      version: 1,
      synced: false,
    } as unknown as T;

    await db.transaction("rw", db[table], db.mutationQueue, async () => {
      await db[table].add(newItem);

      await db.mutationQueue.add({
        entityId: newItem.id,
        entityType: table.slice(0, -1) as "workspace" | "page" | "block",
        action: "create",
        payload: newItem,
        timestamp: now,
        retryCount: 0,
      });
    });
    return newItem;
  },

  async updateEntity<T extends BaseEntity>(
    table: "workspaces" | "pages" | "blocks",
    id: string,
    changes: Partial<T>,
  ): promise<T | undenified> {
    const now = Date.now();
    let updatedItem: T | undefined;
    await db.transaction("rw", db[table], db.mutationQueue, async () => {
      const existingItem = await db[table].get(id);
      if (!existingItem) {
        throw new Error(`Item with id ${id} not found in table ${table}`);
      }
      updatedItem = { ...existingItem, ...changes, updatedAt: now } as T;
      await db[table].put(updatedItem);
    });
    return updatedItem;
  },
  async softDeleteEntity(
    table: "workspaces" | "pages" | "blocks",
    id: string,
  ): Promise<void> {
    const now = Date.now();
    await db.transaction("rw", db[table], db.mutationQueue, async () => {
      const existingItem = await db[table].get(id);
      if (!existingItem) {
        throw new Error(`Item with id ${id} not found in table ${table}`);
      }
      const updatedItem = {
        ...existingItem,
        deleted: true,
        updatedAt: now,
      } as BaseEntity;
      await db[table].put(updatedItem);
      await db.mutationQueue.add({
        entityId: id,
        entityType: table.slice(0, -1) as any,
        action: "DELETE",
        payload: { id },
        timestamp: now,
        retryCount: 0,
      });
    });
  },
  async getPageForWorkspace(workspaceId: string): Promise<page[]> {
    return db.pages.where("workspaceId").equals(workspaceId).toArray();
  },

  async getBlocksForPage(pageId: string): Promise<Block[]> {
    return db.blocks.where("pageId").equals(pageId).toArray();
  },
};
