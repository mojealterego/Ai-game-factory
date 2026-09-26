import { SecurityIPPolicy, assertGeneratedMetadata, assertLicenseUsable, assertNoClientSecretValue } from "./security-ip";

const security = new SecurityIPPolicy();
const rule = { subjectId:"A39", resource:"deployment" as const, actions:["read","execute"] as const, projectId:"p1" };
if (!security.authorize(rule, "execute", "p1")) throw new Error("Expected authorization");
if (security.authorize(rule, "execute", "p2")) throw new Error("Cross-project authorization accepted");

const ref = { id:"s1", provider:"openai", keyName:"OPENAI_API_KEY", secretManager:"backend" as const, environment:"production" as const, projectId:"p1" };
security.requireBackendSecret(ref,"p1");
let leaked = false;
try { assertNoClientSecretValue({apiKey:"secret"}); } catch { leaked = true; }
if (!leaked) throw new Error("Client secret value accepted");

const gate = security.requestApproval({id:"g1",projectId:"p1",kind:"production_deploy",action:"deploy",subjectId:"build-1",status:"pending",requestedBy:"A40",requestedAt:new Date().toISOString()});
security.decideApproval(gate.id,"approved","user-1");
if (!security.isApproved("g1")) throw new Error("Approval gate failed");

let blocked = false;
try { assertLicenseUsable({id:"l1",subjectId:"m1",subjectType:"model",license:"unknown",status:"review_required",projectId:"p1"}); } catch { blocked = true; }
if (!blocked) throw new Error("Unreviewed license accepted");

let incomplete = false;
try { assertGeneratedMetadata({assetId:"a1",projectId:"p1",generated:true,contentHash:"",generationTimestamp:"",provenanceRecordId:""}); } catch { incomplete = true; }
if (!incomplete) throw new Error("Incomplete generated metadata accepted");

export const securityIpContractTest = true;
