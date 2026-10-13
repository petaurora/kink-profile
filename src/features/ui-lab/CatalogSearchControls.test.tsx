// @vitest-environment jsdom
import { act, type ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ToastProvider } from "../../components/ui/ToastProvider";
import { AppServicesProvider } from "../../services/AppServicesProvider";
import { createUiLabServices } from "./services/createUiLabServices";
import { CatalogComposite } from "./CatalogComposite";
let container:HTMLDivElement;
let root:Root;
beforeEach(()=>{vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT",true);vi.useFakeTimers();container=document.createElement("div");document.body.append(container);root=createRoot(container);});
afterEach(()=>{act(()=>root.unmount());container.remove();vi.useRealTimers();vi.unstubAllGlobals();});
async function mount(node:ReactNode){
  const {services}=createUiLabServices({latencyMs:0});
  await act(async()=>{root.render(<AppServicesProvider services={services}><ToastProvider>{node}</ToastProvider></AppServicesProvider>);});
  await act(async()=>{await vi.advanceTimersByTimeAsync(0);});
}
describe("Catalog collection search presentation",()=>{
  it("offers grouping when the loaded collection contains multiple categories",async()=>{
    await mount(<CatalogComposite/>);
    expect(container.querySelector('[aria-label="Sort and group results"]')).not.toBeNull();
  });
  it("omits grouping for a single-subject collection",async()=>{
    await mount(<CatalogComposite subject="Power Exchange"/>);
    expect(container.querySelector('[aria-label="Sort results"]')).not.toBeNull();
    expect(container.querySelector('[aria-label="Sort and group results"]')).toBeNull();
  });
  it("keeps Rewards & Punishments classification filters independent",async()=>{
    await mount(<CatalogComposite collection="rewards"/>);
    expect(container.querySelector('[aria-label="Reward and punishment filters"]')).not.toBeNull();
    expect(container.textContent).toContain("RewardPunishmentAnswers");
  });
});
