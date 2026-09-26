import { createAgentRun, nextRetryDelay, pauseAgentRun, resumeAgentRun, validateAgentGraph, type NoCodeAgentDefinition } from "./no-code-agent-builder";

const base: NoCodeAgentDefinition = {
  id:"agent.test", name:"Test Agent",
  graph:{nodes:[
    {id:"t",kind:"trigger",name:"Trigger",config:{},permissions:[],enabled:true},
    {id:"a",kind:"agent",name:"Agent",config:{},permissions:["read_project"],enabled:true},
    {id:"m",kind:"model",name:"Model",config:{},permissions:[],enabled:true},
    {id:"o",kind:"output",name:"Output",config:{},permissions:[],enabled:true}
  ],edges:[
    {id:"e1",from:"t",to:"a"},{id:"e2",from:"a",to:"m"},{id:"e3",from:"m",to:"o"}
  ],entryNodeId:"t",outputNodeIds:["o"]},
  inputs:[{name:"prompt",type:"string",required:true}],
  outputs:[{name:"result",type:"string"}], permissions:["read_project"], tools:[], models:["test-model"],
  memory:{enabled:true,scope:"run",read:true,write:true},
  retry:{strategy:"exponential",maxAttempts:3,delayMs:100,maxDelayMs:1000},
  approvals:{mode:"before_deploy"}, deployment:{environment:"staging",status:"draft"}, versions:[]
};

const valid = validateAgentGraph(base);
if (!valid.valid) throw new Error("Expected valid graph");
if (nextRetryDelay(base.retry, 1) !== 100 || nextRetryDelay(base.retry, 3) !== 400) throw new Error("Retry policy failed");
const run = createAgentRun(base,"run-1");
const running = {...run,status:"running" as const};
if (pauseAgentRun(running).status !== "paused") throw new Error("Pause failed");
if (resumeAgentRun(pauseAgentRun(running)).status !== "running") throw new Error("Resume failed");

const broken = {...base, graph:{...base.graph, entryNodeId:"missing"}};
if (validateAgentGraph(broken).valid) throw new Error("Invalid graph accepted");

export const noCodeAgentBuilderContractTest = true;
