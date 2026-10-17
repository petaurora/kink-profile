import { describe, expect, it } from "vitest";
import type { CatalogReferenceData } from "../../services/contracts";
import { ambientTopic, discoveryDismissalId, eligibleDiscoveryTopics, explainedConnections, nextDiscoveryTopic } from "./Serendipity";

const data: CatalogReferenceData = {
  items: [{ id:"collars", name:"Collars",category:"Power Exchange", collections:["kinks"],groups:[] }],
  subjects: [],
  concepts: [
    { id:"trust",name:"Trust",description:"Communication and boundaries",relatedItemIds:[] },
    { id:"ownership",name:"Ownership",description:"Negotiated meaning",relatedItemIds:["collars"] },
    { id:"ceremonial",name:"Ceremonial",description:"Symbolic meaning",relatedItemIds:["collars"] },
    { id:"leather",name:"Leather",description:"Material meaning",relatedItemIds:["collars"] },
    { id:"metal",name:"Metal",description:"Material meaning",relatedItemIds:["collars"] },
  ],
};

describe("editorial serendipity policy", () => {
  it("only selects allowlisted loaded concepts, with a deterministic ambient rotation", () => {
    const topics=eligibleDiscoveryTopics(data,{},[]);
    expect(topics.map(topic=>topic.id)).toEqual(["trust","ceremonial","ownership","leather","metal"]);
    expect(ambientTopic(topics,6)).toEqual(topics[1]);
    expect(ambientTopic(topics,6)).toEqual(ambientTopic(topics,6));
    expect(ambientTopic([],3)).toBeUndefined();
  });

  it("suppresses explicit hard limits without naming the limit or inferring a preference from a skip", () => {
    const topics=eligibleDiscoveryTopics(data,{"concept:ownership:preference":"Hard Limit","collars:overall":"Hard Limit"},[]);
    expect(topics.map(topic=>topic.id)).toEqual(["trust"]); // Collars is limited, so its Metal-linked concept is suppressed too.
    expect(eligibleDiscoveryTopics(data,{},[discoveryDismissalId("trust")]).some(topic=>topic.id==="trust")).toBe(false);
    const all=eligibleDiscoveryTopics(data,{},[]);
    const next=nextDiscoveryTopic(all,["trust"],0,"Communication");
    expect(next).toBeUndefined();
    expect(nextDiscoveryTopic(all,["trust"],0,"Symbolism")?.id).toBe("ceremonial");
    expect(nextDiscoveryTopic(all,all.map(topic=>topic.id))).toBeUndefined();
  });

  it("explains only connections supported by a shared canonical Catalog reference", () => {
    const topics=eligibleDiscoveryTopics(data,{},[]);
    const connected=explainedConnections("ownership",data,topics,{});
    expect(connected.map(edge=>edge.concept.id)).toEqual(["ceremonial"]);
    expect(connected[0].insight).toContain("ritual");
    expect(explainedConnections("metal",data,topics,{}).map(edge=>edge.concept.id)).toEqual(["leather"]);
    expect(connected[0].sharedItem.name).toBe("Collars");
    expect(explainedConnections("trust",data,topics,{})).toEqual([]);
    expect(explainedConnections("ownership",data,topics,{"collars:overall":"Hard Limit"})).toEqual([]);
    const filtered=eligibleDiscoveryTopics(data,{},[discoveryDismissalId("ceremonial")]);
    expect(explainedConnections("ownership",data,filtered,{}).some(edge=>edge.concept.id==="ceremonial")).toBe(false);
  });
});
