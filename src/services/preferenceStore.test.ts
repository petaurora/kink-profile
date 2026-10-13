import { describe, expect, it, vi } from "vitest";
import { ratingKey, type AppServices, type PreferenceSnapshot, type PreferenceTarget } from "./contracts";
import { createPreferenceStore } from "./preferenceStore";
const overall:PreferenceTarget={kind:"item",itemId:"collars"};
const modifier:PreferenceTarget={kind:"modifier",itemId:"collars",groupId:"material",valueId:"leather"};
function deferred(){let resolve!:()=>void, reject!:(error:Error)=>void;const promise=new Promise<void>((yes,no)=>{resolve=yes;reject=no;});return {promise,resolve,reject};}
const initial:PreferenceSnapshot={ratings:{},classifications:{collars:{reward:"yes",punishment:"no"}}};
describe("session preference coordinator",()=>{
  it.each(["resolve","reject"] as const)("keeps newest edit/status and serializes writes when the earlier request %ss",async completion=>{
    const first=deferred(),second=deferred();
    const setRating=vi.fn().mockImplementationOnce(()=>first.promise).mockImplementationOnce(()=>second.promise);
    const store=createPreferenceStore({setRating,getSnapshot:async()=>initial} as AppServices["preferences"],initial);
    const older=store.setRating(overall,"Like");await Promise.resolve();
    const latest=store.setRating(overall,"Love");
    expect(setRating).toHaveBeenCalledTimes(1);
    if(completion==="resolve")first.resolve();else first.reject(new Error("Old failure"));
    expect(await older).toBe("superseded");
    expect(store.getSnapshot().ratings[ratingKey(overall)]).toBe("Love");
    expect(store.getSnapshot().saves[ratingKey(overall)]).toBe("saving");
    expect(setRating).toHaveBeenLastCalledWith(overall,"Love");
    second.resolve();expect(await latest).toBe("saved");expect(store.getSnapshot().saves[ratingKey(overall)]).toBe("idle");
  });
  it("preserves failed clear as an unresolved edit and retries without restoring the old value",async()=>{
    const setRating=vi.fn().mockRejectedValueOnce(new Error("Offline")).mockResolvedValue(undefined);
    const store=createPreferenceStore({setRating,getSnapshot:async()=>initial},{...initial,ratings:{[ratingKey(overall)]:"Love"}});
    expect(await store.setRating(overall,undefined)).toBe("failed");
    expect(store.getSnapshot().ratings[ratingKey(overall)]).toBeUndefined();
    expect(store.getSnapshot().saves[ratingKey(overall)]).toBe("failed");
    expect(await store.setRating(overall,undefined)).toBe("saved");
    expect(setRating).toHaveBeenLastCalledWith(overall,undefined);
  });
  it("does not block independent targets or mask another target's error",async()=>{
    const pending=deferred();
    const setRating=vi.fn().mockImplementation((target:PreferenceTarget)=>target.kind==="item"?pending.promise:Promise.reject(new Error("Failure")));
    const store=createPreferenceStore({setRating,getSnapshot:async()=>initial},initial);
    const overallSave=store.setRating(overall,"Like");
    expect(await store.setRating(modifier,"Love")).toBe("failed");
    pending.resolve();await overallSave;
    expect(store.getSnapshot().saves[ratingKey(modifier)]).toBe("failed");
    expect(store.getSnapshot().classifications).toEqual(initial.classifications);
  });
});
