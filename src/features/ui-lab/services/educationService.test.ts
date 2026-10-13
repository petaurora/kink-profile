import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { createUiLabServices } from "./createUiLabServices";

beforeEach(()=>vi.useFakeTimers());
afterEach(()=>vi.useRealTimers());
async function settle<T>(promise:Promise<T>){
  const result=promise.then(value=>({value}),error=>({error}));
  await vi.runAllTimersAsync();return result;
}
it("lists thirteen stable summaries and loads full Markdown only for a requested article",async()=>{
  const service=createUiLabServices({latencyMs:0}).services.education!;
  const summary=await settle(service.listArticles());
  if(!("value" in summary))throw new Error("Education list failed");
  expect(summary.value).toHaveLength(13);
  expect(summary.value.map(x=>x.id)).toContain("edu-collars");
  expect(summary.value.find(x=>x.id==="edu-impact")).toMatchObject({slug:"impact-play-safety",section:"Practices & safety",readingMinutes:7});
  expect(summary.value.every(x=>!("markdown" in x))).toBe(true);
  const detail=await settle(service.getArticle("edu-collars"));
  if(!("value" in detail))throw new Error("Education detail failed");
  expect(detail.value?.markdown).toContain("# Collars & Collaring");
  expect(detail.value?.links.some(link=>link.target.kind==="catalog-item"&&link.target.id==="collars")).toBe(true);
  const impact=await settle(service.getArticle("edu-impact"));
  if(!("value" in impact))throw new Error("Impact article read failed");
  expect(impact.value?.markdown).toContain("# Impact Play: A Beginner's Guide");
  for(const id of ["edu-impact-tools","edu-impact-anatomy","edu-impact-marks"]){
    const deep=await settle(service.getArticle(id));
    if(!("value" in deep)||!deep.value)throw new Error("Missing Impact deep dive "+id);
    expect(deep.value.readingMinutes).toBeLessThanOrEqual(10);
    const approximateWords=deep.value.markdown.trim().split(/\\s+/).length;
    expect(approximateWords, `Article ${id} exceeds 10 min at 200 wpm`).toBeLessThanOrEqual(2000);
    expect(impact.value?.links.some(link=>link.target.kind==="article"&&link.target.id===id)).toBe(true);
  }
  expect(impact.value?.markdown.trim().split(/\\s+/).length).toBeLessThanOrEqual(2000);
  expect(await settle(service.getArticle("edu-nonexistent"))).toEqual({value:null});
});
it("honors abort, surfaces failures, and does not rewrite preference evidence on reads",async()=>{
  const adapter=createUiLabServices({latencyMs:20});
  const controller=new AbortController();
  const request=adapter.services.education!.listArticles({signal:controller.signal}).catch(error=>error);
  controller.abort();
  expect(await request).toMatchObject({name:"AbortError"});
  adapter.failNext("education");
  expect(await settle(adapter.services.education!.getArticle("edu-collars"))).toMatchObject({error:{code:"unavailable"}});
  expect(await settle(adapter.services.education!.getArticle("edu-collars"))).toHaveProperty(["value","id"],"edu-collars");
  expect(await settle(adapter.services.preferences.getSnapshot())).toMatchObject({value:{ratings:{}}});
});
