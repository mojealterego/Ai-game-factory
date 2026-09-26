import { canDeliverArtifact, createAndroidControlSession, createGamePipeline, requiredQAGatesForRelease } from "./android-control-center";

const session = createAndroidControlSession("p1","u1","android-test");
if (!session.capabilities.includes("build_farm")) throw new Error("Android session missing Build Farm capability");

const pipeline = createGamePipeline("p1","A cinematic mobile mystery game");
if (pipeline.gameDnaStatus !== "not_started") throw new Error("Pipeline initialization failed");
if (canDeliverArtifact(pipeline)) throw new Error("Incomplete pipeline delivered an artifact");

const ready = {...pipeline,buildStatus:"completed" as const,qaStatus:"passed" as const,artifact:{target:"android-apk" as const,uri:"https://worker/artifact.apk",sha256:"a".repeat(64),sizeBytes:1024}};
if (!canDeliverArtifact(ready)) throw new Error("Verified artifact was not deliverable");
if (requiredQAGatesForRelease().length !== 16) throw new Error("Release gate count mismatch");

export const androidControlCenterContractTest = true;
