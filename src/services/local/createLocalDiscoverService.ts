import { ServiceError, type RequestOptions } from "../contracts";
import type { DiscoverAttempt, DiscoverAttemptEdit, DiscoverService, DiscoverSnapshot } from "../discoverContracts";

export const reflection = {
  id: "preference-reflection", version: "reflection-v1", title: "Reflect on your interests",
  prompts: [{id:"interest",label:"What would you like to understand about your interests?"},
    {id:"comfort",label:"What helps you feel comfortable while exploring?"},
    {id:"next",label:"What would you like to learn or explore next?"}],
};

/** Isolated session adapter; never writes Catalog, quiz evidence, bookmarks or browsing history. */
export function createLocalDiscoverService(): DiscoverService {
  const state: DiscoverSnapshot = {
    reflection: structuredClone(reflection), dismissed: [], attempts: [],
    suggestions: [
      {id:"reflection",title:reflection.title,reason:"Optional reflection · Your notes stay separate from profile records.",destination:"reflection"},
      {id:"catalog-subjects",title:"Explore Catalog subjects",reason:"General exploration · Browse by subject at your own pace.",destination:"subjects"},
      {id:"concepts",title:"Explore concepts",reason:"General learning · Understand meanings without recording a preference.",destination:"concepts"},
      {id:"education-articles",title:"Read education articles",reason:"Beginner guides · Reading never changes your profile.",destination:"education"},
    ],
  };
  const snapshot = () => structuredClone(state);
  const check = (options?: RequestOptions) => options?.signal?.throwIfAborted();
  function attempt(id: string) {
    const value = state.attempts.find(value => value.id === id);
    if (!value) throw new ServiceError("invalid-target", "This activity is unavailable.");
    return value;
  }
  function editDraft(id: string, edit: DiscoverAttemptEdit) {
    const value = attempt(id);
    if (value.status !== "draft") throw new ServiceError("invalid-value", "Completed activities are historical snapshots.");
    if (!Number.isInteger(edit.step) || edit.step < 0 || edit.step >= value.definition.prompts.length ||
      Object.entries(edit.answers).some(([id, answer]) => !value.definition.prompts.some(prompt => prompt.id === id) || typeof answer !== "string")) {
      throw new ServiceError("invalid-value", "Unknown prompt or invalid activity answer.");
    }
    value.answers = structuredClone(edit.answers);
    value.step = edit.step;
    value.updatedAt = new Date().toISOString();
    return value;
  }
  return {
    async getSnapshot(options) { check(options); return snapshot(); },
    async startAttempt(previousAttemptId, options) {
      check(options);
      if (previousAttemptId && attempt(previousAttemptId).status !== "complete") throw new ServiceError("invalid-value", "Only completed activities can be repeated.");
      const value: DiscoverAttempt = {
        id: crypto.randomUUID(), activityId: state.reflection.id, version: state.reflection.version,
        ...(previousAttemptId ? {previousAttemptId} : {}), status:"draft", step:0, answers:{},
        updatedAt:new Date().toISOString(), definition:structuredClone(state.reflection),
      };
      state.attempts.push(value);
      return {id:value.id, snapshot:snapshot()};
    },
    async saveAttempt(id, edit, options) { check(options); editDraft(id, edit); return snapshot(); },
    async completeAttempt(id, edit, options) {
      check(options);
      const value = editDraft(id, edit);
      value.status = "complete";
      value.completedAt = value.updatedAt;
      return snapshot();
    },
    async removeAttempt(id, options) { check(options); attempt(id); state.attempts = state.attempts.filter(value => value.id !== id); return snapshot(); },
    async setDismissed(id, dismissed, options) {
      check(options);
      if (!state.suggestions.some(value => value.id === id)) throw new ServiceError("invalid-target", "This suggestion is unavailable.");
      state.dismissed = state.dismissed.filter(value => value !== id);
      if (dismissed) state.dismissed.push(id);
      return snapshot();
    },
    async resetDismissals(options) { check(options); state.dismissed = []; return snapshot(); },
  };
}
