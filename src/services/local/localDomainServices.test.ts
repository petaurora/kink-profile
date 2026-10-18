import { describe, expect, it, vi } from "vitest";
import { quizzes } from "../../data/quizzes";
import { createEmptyProfile } from "../../lib/profileStorage";
import { createLocalQuizService } from "./createLocalQuizService";
import { createLocalDiscoverService } from "./createLocalDiscoverService";

const quiz = quizzes.find(quiz => quiz.id === "dominance-submission")!;
function quizAdapter() {
  let profile = createEmptyProfile();
  const write = vi.fn((next: typeof profile) => {profile=structuredClone(next);});
  return {service:createLocalQuizService({read:()=>structuredClone(profile),write}),write};
}
describe("local quiz boundary", () => {
  it("rejects invalid targets, answer values and canceled commands without writing", async () => {
    const {service,write}=quizAdapter();
    await expect(service.answerQuestion(quiz.id, "missing", 2)).rejects.toMatchObject({code:"invalid-target"});
    for (const value of [-1, 5, NaN, Infinity, 2.5]) await expect(service.answerQuestion(quiz.id,quiz.questionIds[0],value)).rejects.toMatchObject({code:"invalid-value"});
    const controller=new AbortController();controller.abort();
    await expect(service.answerQuestion(quiz.id,quiz.questionIds[0],2,{signal:controller.signal})).rejects.toMatchObject({name:"AbortError"});
    expect(write).not.toHaveBeenCalled();
  });
  it("reads the latest persisted evidence per command and preserves completed scores throughout a retake",async()=>{
    const {service,write}=quizAdapter();
    for (const id of quiz.questionIds) await service.answerQuestion(quiz.id,id,4);
    const established=(await service.getSnapshot()).quizzes.find(record=>record.definition.id===quiz.id)!;
    expect(established.lifecycle.state).toBe("complete");
    const count=write.mock.calls.length;
    await service.answerQuestion(quiz.id,quiz.questionIds[0],0);
    expect(write).toHaveBeenCalledTimes(count);
    await service.startRetake(quiz.id);
    const draft=await service.answerQuestion(quiz.id,quiz.questionIds[0],0);
    expect(draft.quizzes.find(record=>record.definition.id===quiz.id)).toMatchObject({lifecycle:{state:"retake-in-progress"},scores:established.scores});
    for (const id of quiz.questionIds.slice(1)) await service.answerQuestion(quiz.id,id,0);
    const complete=(await service.getSnapshot()).quizzes.find(record=>record.definition.id===quiz.id)!;
    expect(complete.lifecycle.state).toBe("complete");
    expect(complete.scores).not.toEqual(established.scores);
    expect(complete.scores.every(score=>score.percentage===0 || score.coverage===0)).toBe(true);
  });
  it("does not confirm a failed persistence write or mutate independent snapshots",async()=>{
    const service=createLocalQuizService({read:createEmptyProfile,write:()=>{throw new Error("quota");}});
    await expect(service.answerQuestion(quiz.id,quiz.questionIds[0],3)).rejects.toThrow("quota");
    const first=await service.getSnapshot();first.quizzes[0].definition.title="Mutated";
    expect((await service.getSnapshot()).quizzes[0].definition.title).not.toBe("Mutated");
  });
});
describe("local Discover boundary",()=>{
  it("validates activity commands before changing state and preserves historical notes/prompts",async()=>{
    const service=createLocalDiscoverService();
    const {id}=await service.startAttempt();
    const edit={answers:{interest:"A note"},step:0};
    await service.saveAttempt(id,edit);edit.answers.interest="Mutated caller input";
    await expect(service.saveAttempt(id,{answers:{unknown:"bad"},step:0})).rejects.toMatchObject({code:"invalid-value"});
    await expect(service.saveAttempt(id,{answers:{interest:"bad"},step:99})).rejects.toMatchObject({code:"invalid-value"});
    const snapshot=await service.getSnapshot();
    expect(snapshot.attempts[0].answers).toEqual({interest:"A note"});
    await service.completeAttempt(id,{answers:{interest:"Final note"},step:2});
    await expect(service.saveAttempt(id,{answers:{interest:"overwrite"},step:0})).rejects.toMatchObject({code:"invalid-value"});
    const repeated=await service.startAttempt(id);
    expect(repeated.id).not.toBe(id);
    expect(repeated.snapshot.attempts[1].previousAttemptId).toBe(id);
    repeated.snapshot.attempts[0].definition.prompts[0].label="Mutated";
    expect((await service.getSnapshot()).attempts[0].definition.prompts[0].label).not.toBe("Mutated");
  });
  it("isolates dismissals, attempts and separate sessions; canceled writes do not commit",async()=>{
    const service=createLocalDiscoverService();
    const {id}=await service.startAttempt();
    await service.setDismissed("concepts",true);
    await service.setDismissed("concepts",true);
    expect((await service.getSnapshot()).dismissed).toEqual(["concepts"]);
    await expect(service.setDismissed("unknown",true)).rejects.toMatchObject({code:"invalid-target"});
    const controller=new AbortController();controller.abort();
    await expect(service.removeAttempt(id,{signal:controller.signal})).rejects.toMatchObject({name:"AbortError"});
    const restored=await service.resetDismissals();
    expect(restored.attempts.map(value=>value.id)).toEqual([id]);
    expect(restored.dismissed).toEqual([]);
    expect((await createLocalDiscoverService().getSnapshot()).attempts).toEqual([]);
  });
});
