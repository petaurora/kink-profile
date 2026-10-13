// @vitest-environment jsdom
import { act, useState } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { GlobalCatalogSearch } from "./GlobalCatalogSearch";
import { searchCatalog, searchSections, type SearchResult } from "./CatalogSearch";
import { LabRecordsProvider, useLabRecords } from "./LabRecords";
import { ToastProvider } from "../../components/ui/ToastProvider";
import type { SortBy } from "../../components/ui/SearchControls";

let root: Root; let container: HTMLDivElement;
const button=(label:string)=>{const el=[...document.querySelectorAll<HTMLButtonElement>('button')].find(el=>el.getAttribute('aria-label')===label||el.textContent===label);if(!el)throw new Error(`Missing: ${label}`);return el;};
const click=(el:HTMLElement)=>act(()=>{el.focus();el.click()});
const key=(key:string)=>act(()=>document.activeElement?.dispatchEvent(new KeyboardEvent('keydown',{key,bubbles:true})));
const flush=async(ms=200)=>act(async()=>{vi.advanceTimersByTime(ms);await Promise.resolve()});
function query(value:string){act(()=>{const el=document.querySelector<HTMLInputElement>('#lab-global-query')!;Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value')!.set!.call(el,value);el.dispatchEvent(new Event('input',{bubbles:true}))});}
function RecordsView(){const records=useLabRecords();return <output>{JSON.stringify(records.values)}</output>;}
function mount(search?: (query:string)=>Promise<SearchResult[]>) {
  function Harness(){const [open,setOpen]=useState(true);const [sort,setSort]=useState<SortBy>('default');const [order,setOrder]=useState(false);return <><button onClick={()=>setOpen(true)}>Launch</button><GlobalCatalogSearch open={open} onClose={()=>setOpen(false)} origin="Catalog" sort={sort} onSort={setSort} orderOpen={order} onOrderOpen={setOrder} search={search}/><RecordsView/></>;}
  act(()=>root.render(<ToastProvider><LabRecordsProvider><Harness/></LabRecordsProvider></ToastProvider>));
}
beforeEach(()=>{vi.useFakeTimers();vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT',true);vi.spyOn(HTMLElement.prototype,'getClientRects').mockReturnValue([{}] as unknown as DOMRectList);HTMLElement.prototype.scrollIntoView=vi.fn();container=document.createElement('div');document.body.append(container);root=createRoot(container)});
afterEach(()=>{act(()=>root.unmount());container.remove();vi.restoreAllMocks();vi.unstubAllGlobals();vi.useRealTimers()});

it('indexes the same Catalog records with normalized multiword matching and no duplicate target IDs',()=>{
  const result=searchCatalog('léather collars');expect(result.some(record=>record.type==='Modifiers'&&record.group==='Material'&&record.itemName==='Collars')).toBe(true);
  const all=searchCatalog('ownership');expect(all.some(record=>record.type==='Concepts')).toBe(true);expect(all.some(record=>record.type==='Items')).toBe(true);
  const sections=searchSections(all,'All','default');const ids=sections.flatMap(section=>section.rows.map(row=>row.id));expect(new Set(ids).size).toBe(ids.length);expect(sections[0].label).toBe('Best matches');
});
it('opens unrestricted and global clear resets the type and query with input focus',async()=>{
  mount();expect(button('All').getAttribute('aria-pressed')).toBe('true');query('leather');await flush();click(button('Modifiers'));click(button('Clear search'));
  expect(button('All').getAttribute('aria-pressed')).toBe('true');expect((document.activeElement as HTMLInputElement).id).toBe('lab-global-query');expect((document.activeElement as HTMLInputElement).value).toBe('');
});
it('debounces processing and keeps Sort separate from result type filters',async()=>{
  const search=vi.fn(async(q:string)=>searchCatalog(q));mount(search);query('collars');await flush(199);expect(search).not.toHaveBeenCalled();await flush(1);expect(search).toHaveBeenCalledWith('collars',expect.objectContaining({signal:expect.any(AbortSignal)}));
  click(button('Sort results'));expect(document.body.textContent).not.toContain('Group by');
});
it('opens the exact modifier, returns query/filter/scroll and never records a rating through navigation',async()=>{
  mount();query('leather');await flush();click(button('Modifiers'));
  const scroll=document.querySelector<HTMLElement>('.lab-search-scroll')!;scroll.scrollTop=240;
  click(document.querySelector<HTMLElement>('[data-search-result="modifier:collars:material:leather"]')!);await flush(20);
  expect(button('Material4 options⌃').getAttribute('aria-expanded')).toBe('true');expect(button('Leather: Not rated. Change rating')).toBe(document.activeElement);
  expect(document.querySelector('.cc-value-highlight')?.textContent).toContain('Leather');
  key('Escape');await flush(20);expect(document.querySelector('[aria-label="Refine Collars"]')).toBeNull();
  expect((document.querySelector('#lab-global-query') as HTMLInputElement).value).toBe('leather');expect(button('Modifiers').getAttribute('aria-pressed')).toBe('true');expect(scroll.scrollTop).toBe(240);expect(document.querySelector('output')!.textContent).toBe('{}');
});
it('opens concept detail rather than an item workspace and keeps concept and modifier preference separate',async()=>{
  mount();query('leather');await flush();click(document.querySelector<HTMLElement>('[data-search-result="concept:leather"]')!);
  expect(document.querySelector('[aria-label="Concept: Leather"]')).not.toBeNull();click(button('Leather concept: Not rated. Change rating'));click(button('Like'));key('Escape');await flush(20);
  click(document.querySelector<HTMLElement>('[data-search-result="modifier:collars:material:leather"]')!);await flush(20);expect(button('Leather: Not rated. Change rating')).toBeTruthy();
});
it('rejects stale request results after a newer query completes',async()=>{
  let oldResolve:(rows:SearchResult[])=>void=()=>{};const search=vi.fn((q:string)=>q==='old'?new Promise<SearchResult[]>(resolve=>{oldResolve=resolve}):Promise.resolve(searchCatalog(q)));
  mount(search);query('old');await flush();query('collars');await flush();
  await act(async()=>oldResolve(searchCatalog('trust')));expect(document.querySelector('[data-search-result="item:collars"]')).not.toBeNull();expect(document.querySelector('[data-search-result="concept:trust"]')).toBeNull();
});
it('retains previous successful results on failure and retries the latest query',async()=>{
  let fail=true;const search=vi.fn(async(q:string)=>{if(q==='trust'&&fail)throw new Error('test failure');return searchCatalog(q)});
  mount(search);query('collars');await flush();query('trust');await flush();expect(document.body.textContent).toContain('Previous results · Search update failed');expect(document.querySelector('[data-search-result="item:collars"]')).not.toBeNull();
  fail=false;click(button('Retry search'));await flush();expect(document.querySelector('[data-search-result="concept:trust"]')).not.toBeNull();
});
it('retains active search state on close/reopen without writing browser storage',async()=>{
  const local=vi.spyOn(Storage.prototype,'setItem');mount();query('ownership');await flush();click(button('Concepts'));click(button('Close search'));click(button('Launch'));
  expect((document.querySelector('#lab-global-query') as HTMLInputElement).value).toBe('ownership');expect(button('Concepts').getAttribute('aria-pressed')).toBe('true');expect(local).not.toHaveBeenCalled();
});
