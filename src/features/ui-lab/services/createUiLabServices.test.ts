import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ratingKey, type PreferenceTarget } from "../../../services/contracts";
import { createUiLabServices } from "./createUiLabServices";
const overall:PreferenceTarget={kind:"item",itemId:"collars"};
const leather:PreferenceTarget={kind:"modifier",itemId:"collars",groupId:"material",valueId:"leather"};
beforeEach(()=>vi.useFakeTimers());
afterEach(()=>vi.useRealTimers());
async function settle<T>(promise:Promise<T>){const result=promise.then(value=>({value}),error=>({error}));await vi.runAllTimersAsync();return result;}
describe("UI Lab adapter contract",()=>{
  it("isolates sessions, snapshots and reference data from callers",async()=>{
    const first=createUiLabServices(),second=createUiLabServices();
    await settle(first.services.preferences.setRating(overall,"Love"));
    const one=await settle(first.services.preferences.getSnapshot());
    const two=await settle(second.services.preferences.getSnapshot());
    expect(one).toHaveProperty(["value","ratings",ratingKey(overall)],"Love");
    expect(two).toMatchObject({value:{ratings:{}}});
    if("value" in one)one.value.ratings[ratingKey(overall)]="Dislike";
    expect(await settle(first.services.preferences.getSnapshot())).toHaveProperty(["value","ratings",ratingKey(overall)],"Love");
    const data=await settle(first.services.catalog.getReferenceData());
    if("value" in data)data.value.items[0].name="Changed";
    expect(await settle(first.services.catalog.getReferenceData())).toHaveProperty(["value","items",0,"name"],"Collars");
  });
  it("keeps overall, modifier and classification evidence independent and clears only its target",async()=>{
    const {services}=createUiLabServices();
    const initial=await settle(services.preferences.getSnapshot());
    await settle(services.preferences.setRating(overall,"Like"));
    await settle(services.preferences.setRating(leather,"Love"));
    await settle(services.preferences.setRating(overall,undefined));
    const result=await settle(services.preferences.getSnapshot());
    expect(result).toHaveProperty(["value","ratings",ratingKey(leather)],"Love");
    if("value" in result){expect(result.value.ratings[ratingKey(overall)]).toBeUndefined();if("value" in initial)expect(result.value.classifications).toEqual(initial.value.classifications);}
  });
  it("fails without changing committed data and lets the next request recover",async()=>{
    const adapter=createUiLabServices();adapter.failNext("save");
    expect(await settle(adapter.services.preferences.setRating(overall,"Love"))).toMatchObject({error:{code:"unavailable"}});
    expect(await settle(adapter.services.preferences.getSnapshot())).toMatchObject({value:{ratings:{}}});
    await settle(adapter.services.preferences.setRating(overall,"Love"));
    expect(await settle(adapter.services.preferences.getSnapshot())).toHaveProperty(["value","ratings",ratingKey(overall)],"Love");
  });
  it("cancels pending reads and writes without committing and rejects unknown targets",async()=>{
    const {services}=createUiLabServices();const controller=new AbortController();
    const save=services.preferences.setRating(overall,"Love",{signal:controller.signal});
    const read=services.catalog.getReferenceData({signal:controller.signal});
    const saveResult=save.catch(error=>error);const readResult=read.catch(error=>error);
    controller.abort();
    expect(await saveResult).toMatchObject({name:"AbortError"});expect(await readResult).toMatchObject({name:"AbortError"});
    expect(await settle(services.preferences.getSnapshot())).toMatchObject({value:{ratings:{}}});
    expect(await settle(services.preferences.setRating({...leather,valueId:"missing"},"Love"))).toMatchObject({error:{code:"invalid-target"}});
  });
  it("returns addressable results from the same universe, including exact modifier IDs",async()=>{
    const {services}=createUiLabServices();
    const result=await settle(services.search.search({text:"léather",type:"Modifiers"}));
    expect(result).toMatchObject({value:[{name:"Leather",target:{itemId:"collars",groupId:"material",valueId:"leather"}}]});
    expect(await settle(services.search.search({text:"Trust",type:"Concepts"}))).toMatchObject({value:[{target:{conceptId:"trust"}}]});
    expect(await settle(services.search.search({text:"definitely nonexistent"}))).toEqual({value:[]});
  });
});
