export interface BaseEntity {
  id: string;
  updatedAt: number;
  deleted: boolean;
  version: number;
  synced: boolean;
}

export interface Workspace extends BaseEntity {
  name: string;
}

export interface page extends BaseEntity {
  workspaceId: string;
  title: string;
  parentId: string | null;
}

export interface Block extends BaseEntity {
  pageId: string;
  type: "text" | "heading" | "todo";
  content: string;
  order: number;
}

export interface MutationQueueItem {
  id?: string;
  entityId: string;
  entityType: "workspace" | "page" | "block";
  action: "create" | "update" | "delete";
  payload: any;
  timestamp: number;
  retryCount: number;
}
