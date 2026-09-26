export type SecurityResource = "project" | "secret" | "model" | "asset" | "deployment" | "provider" | "agent";
export type SecurityAction = "read" | "write" | "execute" | "publish" | "delete" | "export" | "approve";
export type Capability = "model_inference" | "tool_execution" | "file_read" | "file_write" | "network_access" | "build" | "publish" | "secret_use" | "external_provider";
export type LicenseStatus = "unknown" | "review_required" | "approved" | "restricted" | "blocked";
export type ProvenanceSource = "human" | "generated" | "imported" | "derived" | "provider";
export type ApprovalGateKind = "secret_use" | "external_network" | "publish" | "production_deploy" | "license_exception" | "restricted_asset" | "destructive_action";

export interface SecretReference {
  id: string;
  provider: string;
  keyName: string;
  secretManager: "backend" | "cloud_secret_manager" | "android_keystore";
  environment: "development" | "staging" | "production";
  projectId: string;
  version?: string;
  expiresAt?: string;
}
export interface BackendSecretPolicy { clientVisible: false; serverOnly: true; neverLog: true; neverPersistValue: true; }

export interface PermissionRule {
  subjectId: string;
  resource: SecurityResource;
  actions: SecurityAction[];
  projectId: string;
  conditions?: Record<string, string>;
}
export interface AgentCapabilityPolicy {
  agentId: string;
  capabilities: Capability[];
  allowedTools: string[];
  allowedModels: string[];
  projectId: string;
}
export interface ProjectIsolationPolicy {
  projectId: string;
  allowedSecretIds: string[];
  allowedAssetIds: string[];
  allowedModelIds: string[];
  allowedProviderIds: string[];
  allowedAgentIds: string[];
  denyCrossProjectReads: boolean;
  denyCrossProjectWrites: boolean;
  denyCrossProjectExports: boolean;
}

export interface LicenseRecord {
  id: string;
  subjectId: string;
  subjectType: "asset" | "model" | "source" | "provider" | "package";
  license: string;
  status: LicenseStatus;
  sourceUri?: string;
  licenseUri?: string;
  attributionRequired?: boolean;
  attributionText?: string;
  commercialUse?: boolean;
  modificationAllowed?: boolean;
  redistributionAllowed?: boolean;
  restrictions?: string[];
  reviewedBy?: string;
  reviewedAt?: string;
  projectId: string;
}
export interface ModelLicenseRecord extends LicenseRecord {
  subjectType: "model";
  modelId: string;
  modelVersion?: string;
  modelRevision?: string;
  modelCardUri?: string;
}
export interface AssetProvenanceRecord {
  assetId: string;
  projectId: string;
  source: ProvenanceSource;
  providerId?: string;
  modelId?: string;
  modelVersion?: string;
  inputAssetIds?: string[];
  sourceUris?: string[];
  promptHash?: string;
  generationParametersHash?: string;
  licenseRecordId?: string;
  createdAt: string;
}
export interface GeneratedContentMetadata {
  assetId: string;
  projectId: string;
  generated: boolean;
  providerId?: string;
  modelId?: string;
  modelVersion?: string;
  promptHash?: string;
  inputHashes?: string[];
  generationTimestamp: string;
  contentHash: string;
  provenanceRecordId: string;
  licenseRecordId?: string;
}

export interface ApprovalGate {
  id: string;
  projectId: string;
  kind: ApprovalGateKind;
  action: string;
  subjectId: string;
  status: "pending" | "approved" | "rejected" | "expired";
  requestedBy: string;
  decidedBy?: string;
  requestedAt: string;
  decidedAt?: string;
  reason?: string;
}
export interface AuditLogEvent {
  id: string;
  projectId: string;
  actorId: string;
  actorType: "user" | "agent" | "system";
  action: string;
  resourceType: SecurityResource;
  resourceId: string;
  outcome: "allowed" | "denied" | "approved" | "rejected" | "error";
  timestamp: string;
  correlationId?: string;
  metadata?: Record<string, unknown>;
}

export class SecurityIPPolicy {
  private readonly audit: AuditLogEvent[] = [];
  private readonly approvals = new Map<string, ApprovalGate>();

  authorize(rule: PermissionRule, action: SecurityAction, projectId: string): boolean {
    const allowed = rule.projectId === projectId && rule.actions.includes(action);
    this.audit.push({ id: crypto.randomUUID(), projectId, actorId: rule.subjectId, actorType: "agent", action: `authorize:${action}`, resourceType: rule.resource, resourceId: rule.subjectId, outcome: allowed ? "allowed" : "denied", timestamp: new Date().toISOString() });
    return allowed;
  }

  assertProjectIsolation(policy: ProjectIsolationPolicy, projectId: string, resourceId: string, resourceType: keyof Pick<ProjectIsolationPolicy, "allowedSecretIds" | "allowedAssetIds" | "allowedModelIds" | "allowedProviderIds" | "allowedAgentIds">): void {
    if (policy.projectId !== projectId) throw new Error("PROJECT_ISOLATION_VIOLATION");
    const allowed = policy[resourceType].includes(resourceId);
    if (!allowed) throw new Error("RESOURCE_OUTSIDE_PROJECT_SCOPE");
  }

  requireBackendSecret(ref: SecretReference, projectId: string): BackendSecretPolicy {
    if (ref.projectId !== projectId) throw new Error("SECRET_PROJECT_ISOLATION_VIOLATION");
    return { clientVisible: false, serverOnly: true, neverLog: true, neverPersistValue: true };
  }

  requestApproval(gate: ApprovalGate): ApprovalGate {
    this.approvals.set(gate.id, gate);
    this.audit.push({ id: crypto.randomUUID(), projectId: gate.projectId, actorId: gate.requestedBy, actorType: "agent", action: "approval.request", resourceType: "deployment", resourceId: gate.subjectId, outcome: "approved", timestamp: new Date().toISOString() });
    return gate;
  }

  decideApproval(id: string, status: "approved" | "rejected", decidedBy: string, reason?: string): ApprovalGate {
    const current = this.approvals.get(id);
    if (!current) throw new Error("UNKNOWN_APPROVAL_GATE");
    const next = { ...current, status, decidedBy, decidedAt: new Date().toISOString(), reason };
    this.approvals.set(id, next);
    this.audit.push({ id: crypto.randomUUID(), projectId: next.projectId, actorId: decidedBy, actorType: "user", action: "approval.decide", resourceType: "deployment", resourceId: next.subjectId, outcome: status, timestamp: new Date().toISOString() });
    return next;
  }

  isApproved(id: string): boolean { return this.approvals.get(id)?.status === "approved"; }
  auditLog(projectId: string): AuditLogEvent[] { return this.audit.filter(e => e.projectId === projectId); }
}

export function assertLicenseUsable(record: LicenseRecord): void {
  if (record.status === "blocked") throw new Error("LICENSE_BLOCKED");
  if (record.status === "unknown" || record.status === "review_required") throw new Error("LICENSE_REVIEW_REQUIRED");
}
export function assertGeneratedMetadata(metadata: GeneratedContentMetadata): void {
  if (!metadata.generated || !metadata.contentHash || !metadata.provenanceRecordId || !metadata.generationTimestamp) throw new Error("GENERATED_CONTENT_METADATA_INCOMPLETE");
}
export function assertNoClientSecretValue(value: unknown): void {
  if (value && typeof value === "object" && ("apiKey" in value || "api_key" in value || "secret" in value || "token" in value)) throw new Error("SECRET_VALUE_MUST_REMAIN_BACKEND_ONLY");
}
