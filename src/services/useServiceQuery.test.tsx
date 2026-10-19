// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { expect, it, vi } from "vitest";
import { useServiceQuery } from "./useServiceQuery";
import type { RequestOptions } from "./contracts";
function deferred(){let resolve!:(value:string)=>void;const promise=new Promise<string>(yes=>{resolve=yes;});return {promise,resolve};}
it("cancels replaced/unmounted reads and ignores stale results even if an adapter ignores abort",async()=>{
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT",true);
  const container=document.createElement("div");document.body.append(container);const root=createRoot(container);
  const older=deferred(),newer=deferred();let oldSignal:AbortSignal|undefined,newSignal:AbortSignal|undefined;
  const oldRequest=({signal}:RequestOptions)=>{oldSignal=signal;return older.promise;};
  const newRequest=({signal}:RequestOptions)=>{newSignal=signal;return newer.promise;};
  function Harness({request}:{request:typeof oldRequest}){const result=useServiceQuery(request);return <p>{result.loading?"Loading":result.data}</p>;}
  try{
    await act(async()=>root.render(<Harness request={oldRequest}/>));
    await act(async()=>root.render(<Harness request={newRequest}/>));expect(oldSignal?.aborted).toBe(true);
    await act(async()=>newer.resolve("New results"));expect(container.textContent).toBe("New results");
    await act(async()=>older.resolve("Stale results"));expect(container.textContent).toBe("New results");
    act(()=>root.unmount());expect(newSignal?.aborted).toBe(true);
  }finally{container.remove();vi.unstubAllGlobals();}
});
