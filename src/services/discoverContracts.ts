import type { RequestOptions } from "./contracts";

export type ReflectionDefinition = {
  id: string; version: string; title: string;
  prompts: { id: string; label: string }[];
};
export type DiscoverAttempt = {
  id: string; activityId: string; version: string; previousAttemptId?: string;
  status: "draft" | "complete"; step: number; answers: Record<string, string>;
  updatedAt: string; completedAt?: string;
  /** Preserve the exact prompts alongside completed notes. */
  definition: ReflectionDefinition;
};
export type DiscoverSuggestion = {
  id: string; title: string; reason: string;
  destination: "reflection" | "subjects" | "concepts" | "education";
};
export type DiscoverSnapshot = {
  reflection: ReflectionDefinition;
  suggestions: DiscoverSuggestion[];
  dismissed: string[];
  attempts: DiscoverAttempt[];
};
export type DiscoverAttemptEdit = { answers: Record<string, string>; step: number };
export interface DiscoverService {
  getSnapshot(options?: RequestOptions): Promise<DiscoverSnapshot>;
  startAttempt(previousAttemptId?: string, options?: RequestOptions): Promise<{ id: string; snapshot: DiscoverSnapshot }>;
  saveAttempt(id: string, edit: DiscoverAttemptEdit, options?: RequestOptions): Promise<DiscoverSnapshot>;
  completeAttempt(id: string, edit: DiscoverAttemptEdit, options?: RequestOptions): Promise<DiscoverSnapshot>;
  removeAttempt(id: string, options?: RequestOptions): Promise<DiscoverSnapshot>;
  setDismissed(id: string, dismissed: boolean, options?: RequestOptions): Promise<DiscoverSnapshot>;
  resetDismissals(options?: RequestOptions): Promise<DiscoverSnapshot>;
}
