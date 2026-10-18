// @vitest-environment jsdom
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { MemoryRouter, useLocation, useNavigate, type NavigateFunction } from "react-router-dom";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { UiLabPage } from "./UiLabPage";
import { labPath, parseLabRoute } from "./LabNavigation";
import { ViewErrorBoundary } from "../../components/ui/ViewErrorBoundary";
import { compareRoute, rewardsToolsRandomizerRoute, rewardsToolsRecipesRoute, sceneBuilderRoute } from "../../app/routes";
import { createUiLabServices as makeUiLabServices } from "./services/createUiLabServices";
import { illustrativeReferenceData as labReferenceData } from "./services/fixtures";
import { ratingKey, type AppServices } from "../../services/contracts";

const createUiLabServices = (options:Parameters<typeof makeUiLabServices>[0]={}) => makeUiLabServices({...options,referenceData:options.referenceData??labReferenceData});
let root:Root;let container:HTMLDivElement;let navigate:NavigateFunction;
const button=(label:string)=>{const el=[...document.querySelectorAll<HTMLButtonElement>('button')].find(el=>el.getAttribute('aria-label')===label||el.textContent?.replace(/[⌃⌄]/g, "").trim()===label.replace(/[⌃⌄]/g, "").trim());if(!el)throw new Error(`Missing: ${label}`);return el;};
const click=async(el:HTMLElement)=>{await act(async()=>{el.focus();el.click()});};
const flush=async(ms=220)=>act(async()=>{await vi.advanceTimersByTimeAsync(ms)});
const route=()=>document.querySelector('output')!.textContent!;
function Driver(){const location=useLocation();navigate=useNavigate();return <output>{location.pathname+location.search}</output>;}
async function mount(path='/ui-lab/home',services:AppServices=createUiLabServices({latencyMs:0}).services){act(()=>root.render(<MemoryRouter initialEntries={[path]}><UiLabPage services={services}/><Driver/></MemoryRouter>));await flush(0);}
function type(selector:string,value:string){act(()=>{const input=document.querySelector<HTMLInputElement|HTMLTextAreaElement>(selector)!;const prototype=input instanceof HTMLTextAreaElement?HTMLTextAreaElement.prototype:HTMLInputElement.prototype;Object.getOwnPropertyDescriptor(prototype,'value')!.set!.call(input,value);input.dispatchEvent(new Event('input',{bubbles:true}))});}
beforeEach(()=>{vi.useFakeTimers();vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT',true);vi.spyOn(HTMLElement.prototype,'getClientRects').mockReturnValue([{}] as unknown as DOMRectList);HTMLElement.prototype.scrollIntoView=vi.fn();vi.spyOn(window,'scrollTo').mockImplementation(()=>{});container=document.createElement('div');document.body.append(container);root=createRoot(container)});
afterEach(()=>{act(()=>root.unmount());container.remove();vi.restoreAllMocks();vi.unstubAllGlobals();vi.useRealTimers()});

it('round-trips registered routes and handles unknown Lab destinations without leaving the Lab',async()=>{
  expect(parseLabRoute(labPath('Catalog','Rewards & Punishments')).workspace).toBe('Rewards & Punishments');expect(parseLabRoute('/ui-lab/settings').area).toBe('Settings');
  await mount('/ui-lab/unknown');expect(document.body.textContent).toContain('This Lab destination is unavailable');await click(button('Return Home'));expect(route()).toBe('/ui-lab/home');
});
it('opens nested deep links with one canonical title and navigable parent breadcrumb',async()=>{
  await mount('/ui-lab/catalog/rewards-punishments');expect(document.querySelectorAll('h1')).toHaveLength(1);expect(document.querySelector('h1')!.textContent).toBe('Rewards & Punishments');
  const crumb=document.querySelector<HTMLButtonElement>('[aria-label="Breadcrumb"] button')!;await click(crumb);expect(route()).toBe('/ui-lab/catalog');expect(document.querySelector('[aria-label="Breadcrumb"]')).toBeNull();
});
it('routes full-menu destinations and preserves active navigation and rail state',async()=>{
  await mount();await click(button('Collapse sidebar'));expect(document.querySelector('.lab-rail-collapsed')).not.toBeNull();await click(button('Open full menu'));await click(button('Settings›'));expect(route()).toBe('/ui-lab/settings');
  await click(button('Open full menu'));expect(document.querySelector('.ui-lab-menu-settings')!.getAttribute('aria-current')).toBe('page');await click(button('Close menu'));await click(button('Catalog'));expect(route()).toBe('/ui-lab/catalog');expect(document.querySelector('.lab-rail-collapsed')).not.toBeNull();
});
it('keeps R/P filters and search through navigation without changing independent clear semantics',async()=>{
  await mount('/ui-lab/catalog/rewards-punishments');await click(button('Reward'));type('[aria-label="Search Items in rewards and punishments"]','praise');await flush(275);await click(button('Profile'));act(()=>navigate('/ui-lab/catalog/rewards-punishments'));
  expect(button('Reward').getAttribute('aria-pressed')).toBe('true');expect((document.querySelector('[aria-label="Search Items in rewards and punishments"]') as HTMLInputElement).value).toBe('praise');await click(button('Clear search'));expect(button('Reward').getAttribute('aria-pressed')).toBe('true');
});
it('browser Back restores Search and then the exact underlying workspace without queries in the URL',async()=>{
  await mount('/ui-lab/catalog/rewards-punishments');await click(button('Reward'));await click(button('Search'));type('#lab-global-query','leather');await flush();await click(button('Modifiers'));
  await click(document.querySelector<HTMLElement>('[data-search-result="modifier:collars:material:leather"]')!);await flush(20);expect(route()).toContain('target=');expect(route()).not.toContain('query=');
  act(()=>navigate(-1));await flush(20);expect(document.querySelector('[role="dialog"][aria-label="Refine Collars"]')).toBeNull();expect((document.querySelector('#lab-global-query') as HTMLInputElement).value).toBe('leather');expect(button('Modifiers').getAttribute('aria-pressed')).toBe('true');
  act(()=>navigate(-1));expect(route()).toBe('/ui-lab/catalog/rewards-punishments');expect(button('Reward').getAttribute('aria-pressed')).toBe('true');
});
it('blocks drawer swipes while another modal owns interaction',async()=>{
  await mount();await click(button('Search'));const surface=document.querySelector('.ui-lab')!;
  act(()=>{const start=new Event('touchstart',{bubbles:true});Object.assign(start,{touches:[{clientX:0,clientY:10}]});surface.dispatchEvent(start);const end=new Event('touchend',{bubbles:true});Object.assign(end,{changedTouches:[{clientX:180,clientY:12}]});surface.dispatchEvent(end)});
  expect(document.querySelector('#ui-lab-full-menu')).toBeNull();
});
it('dismisses content by ID, restores individually and confirms reset without losing activities',async()=>{
  await mount('/ui-lab/discover');await click(button('Dismiss Explore concepts'));await click(button('Manage Suggestions'));expect(document.body.textContent).toContain('Explore concepts');await click(button('Restore'));expect(document.body.textContent).toContain('No dismissed suggestions');
  act(()=>navigate('/ui-lab/discover'));await click(button('Dismiss Explore concepts'));await click(button('Manage Suggestions'));await click(button('Reset all dismissals'));await click(button('Cancel'));expect(button('Restore')).toBeTruthy();await click(button('Reset all dismissals'));await click(button('Restore all suggestions'));expect(document.body.textContent).toContain('No dismissed suggestions');
});
it('resumes real drafts, preserves completed snapshots and repeats as a separate attempt without profile writes',async()=>{
  await mount('/ui-lab/home');expect(document.body.textContent).toContain('No unfinished activities');await click(button('Discover'));
  await click(button('Open Reflect on your interests'));const firstRoute=route();
  type('#lab-reflection-answer','A deliberate note');await click(button('Next prompt'));await click(button('Exit reflection'));await click(button('Home'));expect(button('Resume')).toBeTruthy();await click(button('Resume'));expect(document.body.textContent).toContain('Optional prompt 2 of 3');await click(button('Next prompt'));await click(button('Finish reflection'));expect(document.body.textContent).toContain('A deliberate note');
  await click(button('Repeat with latest version'));expect(route()).not.toBe(firstRoute);type('#lab-reflection-answer','A new note');act(()=>navigate(firstRoute));expect(document.body.textContent).toContain('A deliberate note');expect(document.body.textContent).not.toContain('A new note');expect(document.querySelector('textarea')).toBeNull();await click(button('Profile'));expect(document.body.textContent).toContain('No explicit records yet');
});
it('keeps Home shortcuts explicitly controlled across destinations',async()=>{
  await mount();await click(button('Edit shortcuts⌄'));const checkbox=[...document.querySelectorAll<HTMLInputElement>('.lab-shortcut-choice input')].find(input=>input.parentElement!.textContent==='Learn')!;await click(checkbox);await click(button('Catalog'));await click(button('Home'));expect(document.querySelector('.lab-shortcuts')!.textContent).toContain('Learn');
});
it('recovers a failed view on retry and after navigation',async()=>{
  vi.spyOn(console,'error').mockImplementation(()=>{});let fail=true;
  function Broken(){if(fail)throw new Error('test');return <p>Recovered view</p>;}
  const render=(key:string)=>act(()=>root.render(<ViewErrorBoundary resetKey={key} onHome={()=>{}}><Broken/></ViewErrorBoundary>));
  render('one');expect(document.body.textContent).toContain('This view could not be displayed');fail=false;await click(button('Try again'));expect(document.body.textContent).toContain('Recovered view');fail=true;render('one');fail=false;render('two');expect(document.body.textContent).toContain('Recovered view');
});

it('keeps the four styled Home cards and truthful empty states with working destinations',async()=>{
  await mount();expect(document.querySelectorAll('.lab-home-cards > .ui-lab-app-tile')).toHaveLength(4);
  expect(document.querySelector('.lab-continue-card.featured')).not.toBeNull();
  expect(document.body.textContent).toContain('No unfinished activities');
  await click(button('Your profile at a glance'));expect(route()).toBe('/ui-lab/profile');
  await click(button('Home'));await click(button('Discover something'));expect(route()).toBe('/ui-lab/discover');
});
it('labels Training records using exact item identity rather than the Ownership prefix',async()=>{
  await mount('/ui-lab/catalog/kinks');await click(button('Training overall: Not rated. Change rating'));await click(button('Love'));await click(button('Profile'));await click(button('Your profile'));
  expect(document.querySelector('.lab-records')?.textContent).toContain('Training');expect(document.querySelector('.lab-records')?.textContent).not.toContain('Ownership0');
});

it('keeps Profile records and honest capability destinations accessible from its cards',async()=>{
  await mount('/ui-lab/profile');await click(button('Your profile'));expect(route()).toBe('/ui-lab/profile/records');expect(document.body.textContent).toContain('No explicit records yet');
  await click(button('Profile'));await click(button('Relationships'));expect(route()).toBe('/ui-lab/relationships');expect(document.body.textContent).toContain('No connected relationship workspace');
  await click(button('Profile'));await click(button('Sharing & permissions'));expect(route()).toBe('/ui-lab/profile/sharing');
  await click(button('Profile'));const identity=button('Identity & expression');const descriptions=identity.getAttribute('aria-describedby')!.split(' ').map(id=>document.getElementById(id)?.textContent).join(' ');expect(descriptions).toContain('Not available');
  await click(identity);expect(route()).toBe('/ui-lab/profile/identity');expect(document.body.textContent).toContain('Identity and expression editing is not available');
});
it('keeps tool cards connected to current tools and truthful unavailable states',async()=>{
  await mount('/ui-lab/tools');expect(document.querySelector('a[aria-label="Scene Builder"]')?.getAttribute('href')).toBe('#'+sceneBuilderRoute.path);
  expect(document.querySelector('a[aria-label="Compare profiles"]')?.getAttribute('href')).toBe('#'+compareRoute.path);
  await click(button('Agreements & rituals'));expect(route()).toBe('/ui-lab/tools/agreements');expect(document.body.textContent).toContain('do not yet have an editor');
  await click(button('Back to tools'));await click(button('Randomizers & recipes'));expect(route()).toBe('/ui-lab/tools/randomizers-recipes');
  expect(document.querySelector('a[aria-label="Reward / Punishment randomizer"]')?.getAttribute('href')).toBe('#'+rewardsToolsRandomizerRoute.path);
  expect(document.querySelector('a[aria-label="Recipes"]')?.getAttribute('href')).toBe('#'+rewardsToolsRecipesRoute.path);
});
it('keeps Discover navigation and dismissal separate without nested buttons or invented drafts',async()=>{
  await mount('/ui-lab/discover');expect(document.querySelector('.lab-discover-cards button button')).toBeNull();
  await click(button('Dismiss Reflect on your interests'));await click(button('Home'));expect(document.body.textContent).toContain('No unfinished activities');expect(document.querySelector('.lab-continue-card .lab-list-row')).toBeNull();
  await click(button('Discover'));await click(button('Open Explore concepts'));expect(route()).toBe('/ui-lab/catalog/concepts');
});

it('resolves direct modifier and concept routes against injected service reference data',async()=>{
  const data=structuredClone(labReferenceData);data.items[0].name='Injected Item';data.items[0].groups[0].values[0].name='Injected option';data.concepts.find(concept=>concept.id==='leather')!.name='Injected concept';
  const adapter=createUiLabServices({latencyMs:0,referenceData:data});
  await mount('/ui-lab/catalog/kinks?target='+encodeURIComponent('modifier:collars:material:leather'),adapter.services);await flush(20);
  expect(document.querySelector('[role="dialog"][aria-label="Refine Injected Item"]')).not.toBeNull();expect(button('Injected option: Not rated. Change rating')).toBeTruthy();expect(route()).not.toContain('query=');
  act(()=>navigate('/ui-lab/catalog/concepts?concept=leather'));await flush(20);
  expect(document.querySelector('[role="dialog"][aria-label="Concept: Injected concept"]')).not.toBeNull();
});
it('preserves ranked Catalog search and confirmed service records across routed Profile navigation',async()=>{
  const adapter=createUiLabServices({latencyMs:0,saveLatencyMs:10});const write=vi.spyOn(adapter.services.preferences,'setRating');
  await mount('/ui-lab/catalog/kinks',adapter.services);type('[aria-label="Search Items in kinks"]','ca');await flush(275);
  expect([...document.querySelectorAll('[data-item-id]')].map(item=>item.getAttribute('data-item-id'))).toEqual(expect.arrayContaining(['aftercare','permission-rituals']));expect(document.querySelector('[data-item-id="permission-rituals"] .kp-item-supporting-text')?.textContent).toContain('practical');
  await click(button('Aftercare overall: Not rated. Change rating'));await click(button('Love'));act(()=>document.activeElement?.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true})));await flush(10);
  await click(button('Profile'));await click(button('Your profile'));expect(document.querySelector('.lab-records')?.textContent).toContain('Aftercare');expect(document.querySelector('.lab-records')?.textContent).toContain('Love');
  expect(write).toHaveBeenCalledWith({kind:'item',itemId:'aftercare'},'Love');const snapshot=adapter.services.preferences.getSnapshot();await flush(0);expect((await snapshot).ratings[ratingKey({kind:'item',itemId:'aftercare'})]).toBe('Love');
  act(()=>navigate('/ui-lab/catalog/kinks'));expect((document.querySelector('[aria-label="Search Items in kinks"]') as HTMLInputElement).value).toBe('ca');expect(button('Aftercare overall: Love. Change rating')).toBeTruthy();
});

it('keeps the existing quizzes discoverable in V2 without turning them into dismissible suggestions',async()=>{
  await mount('/ui-lab/discover');
  const quizzes=document.querySelector<HTMLAnchorElement>('.lab-discover-cards a[aria-label="Quizzes"]');
  expect(quizzes?.getAttribute('href')).toBe('#'+labPath("Quizzes"));
  await click(button('Manage Suggestions'));
  expect(document.body.textContent).not.toContain('Quizzes');
  await click(button('Discover'));
  await click(button('Dismiss Reflect on your interests'));
  expect(document.querySelector('.lab-discover-cards a[aria-label="Quizzes"]')).not.toBeNull();
  await click(button('Open full menu'));
  await click(button('Quizzes'));
  expect(route()).toBe(labPath("Quizzes"));
});

it('keeps one canonical quiz route accessible from Home and Profile without extra top-level tabs',async()=>{
  await mount('/ui-lab/home');
  expect([...document.querySelectorAll('.ui-lab-app-bottom button')]).toHaveLength(5);
  expect(document.querySelectorAll('.lab-home-cards > .ui-lab-app-tile')).toHaveLength(4);
  expect(document.querySelector('.lab-home-cards a[href="#'+labPath("Quizzes")+'"]')?.textContent).toContain('Explore quizzes');
  await click(button('Profile'));
  expect(document.querySelector('.lab-profile-cards a[href="#'+labPath("Quizzes")+'"]')?.textContent).toContain('Build your profile with quizzes');
  await click(button('Open full menu'));
  expect(document.querySelector('.ui-lab-menu-links button')?.textContent).not.toBe('Quizzes');
  await click(button('Quizzes'));
  expect(route()).toBe(labPath("Quizzes"));
});


it('keeps the native Quiz experience free of Lab data disclaimers and Toast Playground controls',async()=>{
  await mount('/ui-lab/quizzes');
  expect(route()).toBe('/ui-lab/quizzes');
  expect(document.querySelector('.lab-quiz-landing')).not.toBeNull();
  expect(document.body.textContent).toContain('Your answers save automatically');
  expect(document.body.textContent).not.toContain('temporary Lab records');
  expect(document.querySelector('.ui-lab-app-note')).toBeNull();
  expect(document.querySelector('.ui-lab-app-switch')).toBeNull();
});
