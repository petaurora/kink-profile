// @vitest-environment jsdom
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { MemoryRouter, useLocation, useNavigate, type NavigateFunction } from "react-router-dom";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { UiLabPage } from "./UiLabPage";
import { labPath, parseLabRoute } from "./LabNavigation";
import { ViewErrorBoundary } from "../../components/ui/ViewErrorBoundary";

let root:Root;let container:HTMLDivElement;let navigate:NavigateFunction;
const button=(label:string)=>{const el=[...document.querySelectorAll<HTMLButtonElement>('button')].find(el=>el.getAttribute('aria-label')===label||el.textContent===label);if(!el)throw new Error(`Missing: ${label}`);return el;};
const click=(el:HTMLElement)=>act(()=>{el.focus();el.click()});
const flush=async(ms=200)=>act(async()=>{vi.advanceTimersByTime(ms);await Promise.resolve()});
const route=()=>document.querySelector('output')!.textContent!;
function Driver(){const location=useLocation();navigate=useNavigate();return <output>{location.pathname+location.search}</output>;}
function mount(path='/ui-lab/home'){act(()=>root.render(<MemoryRouter initialEntries={[path]}><UiLabPage/><Driver/></MemoryRouter>));}
function type(selector:string,value:string){act(()=>{const input=document.querySelector<HTMLInputElement|HTMLTextAreaElement>(selector)!;const prototype=input instanceof HTMLTextAreaElement?HTMLTextAreaElement.prototype:HTMLInputElement.prototype;Object.getOwnPropertyDescriptor(prototype,'value')!.set!.call(input,value);input.dispatchEvent(new Event('input',{bubbles:true}))});}
beforeEach(()=>{vi.useFakeTimers();vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT',true);vi.spyOn(HTMLElement.prototype,'getClientRects').mockReturnValue([{}] as unknown as DOMRectList);HTMLElement.prototype.scrollIntoView=vi.fn();vi.spyOn(window,'scrollTo').mockImplementation(()=>{});container=document.createElement('div');document.body.append(container);root=createRoot(container)});
afterEach(()=>{act(()=>root.unmount());container.remove();vi.restoreAllMocks();vi.unstubAllGlobals();vi.useRealTimers()});

it('round-trips registered routes and handles unknown Lab destinations without leaving the Lab',()=>{
  expect(parseLabRoute(labPath('Catalog','Rewards & Punishments')).workspace).toBe('Rewards & Punishments');expect(parseLabRoute('/ui-lab/settings').area).toBe('Settings');
  mount('/ui-lab/unknown');expect(document.body.textContent).toContain('This Lab destination is unavailable');click(button('Return Home'));expect(route()).toBe('/ui-lab/home');
});
it('opens nested deep links with one canonical title and navigable parent breadcrumb',()=>{
  mount('/ui-lab/catalog/rewards-punishments');expect(document.querySelectorAll('h1')).toHaveLength(1);expect(document.querySelector('h1')!.textContent).toBe('Rewards & Punishments');
  const crumb=document.querySelector<HTMLButtonElement>('[aria-label="Breadcrumb"] button')!;click(crumb);expect(route()).toBe('/ui-lab/catalog');expect(document.querySelector('[aria-label="Breadcrumb"]')).toBeNull();
});
it('routes full-menu destinations and preserves active navigation and rail state',()=>{
  mount();click(button('Collapse sidebar'));expect(document.querySelector('.lab-rail-collapsed')).not.toBeNull();click(button('Open full menu'));click(button('Settings›'));expect(route()).toBe('/ui-lab/settings');
  click(button('Open full menu'));expect(document.querySelector('.ui-lab-menu-settings')!.getAttribute('aria-current')).toBe('page');click(button('Close menu'));click(button('Catalog'));expect(route()).toBe('/ui-lab/catalog');expect(document.querySelector('.lab-rail-collapsed')).not.toBeNull();
});
it('keeps R/P filters and search through navigation without changing independent clear semantics',async()=>{
  mount('/ui-lab/catalog/rewards-punishments');click(button('Reward'));type('[aria-label="Search rewards and punishments"]','praise');await flush(275);click(button('Profile'));act(()=>navigate('/ui-lab/catalog/rewards-punishments'));
  expect(button('Reward').getAttribute('aria-pressed')).toBe('true');expect((document.querySelector('[aria-label="Search rewards and punishments"]') as HTMLInputElement).value).toBe('praise');click(button('Clear search'));expect(button('Reward').getAttribute('aria-pressed')).toBe('true');
});
it('browser Back restores Search and then the exact underlying workspace without queries in the URL',async()=>{
  mount('/ui-lab/catalog/rewards-punishments');click(button('Reward'));click(button('Search'));type('#lab-global-query','leather');await flush();click(button('Modifiers'));
  click(document.querySelector<HTMLElement>('[data-search-result="modifier:Power Exchange:0:Material:Leather"]')!);await flush(20);expect(route()).toContain('target=');expect(route()).not.toContain('query=');
  act(()=>navigate(-1));await flush(20);expect(document.querySelector('[aria-label="Refine Collars"]')).toBeNull();expect((document.querySelector('#lab-global-query') as HTMLInputElement).value).toBe('leather');expect(button('Modifiers').getAttribute('aria-pressed')).toBe('true');
  act(()=>navigate(-1));expect(route()).toBe('/ui-lab/catalog/rewards-punishments');expect(button('Reward').getAttribute('aria-pressed')).toBe('true');
});
it('blocks drawer swipes while another modal owns interaction',()=>{
  mount();click(button('Search'));const surface=document.querySelector('.ui-lab')!;
  act(()=>{const start=new Event('touchstart',{bubbles:true});Object.assign(start,{touches:[{clientX:0,clientY:10}]});surface.dispatchEvent(start);const end=new Event('touchend',{bubbles:true});Object.assign(end,{changedTouches:[{clientX:180,clientY:12}]});surface.dispatchEvent(end)});
  expect(document.querySelector('#ui-lab-full-menu')).toBeNull();
});
it('dismisses content by ID, restores individually and confirms reset without losing activities',()=>{
  mount('/ui-lab/discover');click(button('Dismiss Explore concepts'));click(button('Manage Suggestions'));expect(document.body.textContent).toContain('Explore concepts');click(button('Restore'));expect(document.body.textContent).toContain('No dismissed suggestions');
  act(()=>navigate('/ui-lab/discover'));click(button('Dismiss Explore concepts'));click(button('Manage Suggestions'));click(button('Reset all dismissals'));click(button('Cancel'));expect(button('Restore')).toBeTruthy();click(button('Reset all dismissals'));click(button('Restore all suggestions'));expect(document.body.textContent).toContain('No dismissed suggestions');
});
it('resumes real drafts, preserves completed snapshots and repeats as a separate attempt without profile writes',()=>{
  mount('/ui-lab/home');expect(document.body.textContent).toContain('No unfinished activities');click(button('Discover'));
  const row=[...document.querySelectorAll('.lab-list-row')].find(row=>row.textContent?.includes('Reflect on your interests'))!;click(row.querySelector<HTMLButtonElement>('button')!);const firstRoute=route();
  type('#lab-reflection-answer','A deliberate note');click(button('Next prompt'));click(button('Save and exit'));click(button('Home'));expect(button('Resume')).toBeTruthy();click(button('Resume'));expect(document.body.textContent).toContain('Optional prompt 2 of 3');click(button('Next prompt'));click(button('Finish reflection'));expect(document.body.textContent).toContain('A deliberate note');
  click(button('Repeat with latest version'));expect(route()).not.toBe(firstRoute);type('#lab-reflection-answer','A new note');act(()=>navigate(firstRoute));expect(document.body.textContent).toContain('A deliberate note');expect(document.body.textContent).not.toContain('A new note');expect(document.querySelector('textarea')).toBeNull();click(button('Profile'));expect(document.body.textContent).toContain('No explicit records yet');
});
it('keeps Home shortcuts explicitly controlled across destinations',()=>{
  mount();click(button('Edit shortcuts⌄'));const checkbox=[...document.querySelectorAll<HTMLInputElement>('.lab-shortcut-choice input')].find(input=>input.parentElement!.textContent==='Learn')!;click(checkbox);click(button('Catalog'));click(button('Home'));expect(document.querySelector('.lab-shortcuts')!.textContent).toContain('Learn');
});
it('recovers a failed view on retry and after navigation',()=>{
  vi.spyOn(console,'error').mockImplementation(()=>{});let fail=true;
  function Broken(){if(fail)throw new Error('test');return <p>Recovered view</p>;}
  const render=(key:string)=>act(()=>root.render(<ViewErrorBoundary resetKey={key} onHome={()=>{}}><Broken/></ViewErrorBoundary>));
  render('one');expect(document.body.textContent).toContain('This view could not be displayed');fail=false;click(button('Try again'));expect(document.body.textContent).toContain('Recovered view');fail=true;render('one');fail=false;render('two');expect(document.body.textContent).toContain('Recovered view');
});
