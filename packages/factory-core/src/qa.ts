export const QA_CHECKS = [
  "static_analysis",
  "code_validation",
  "asset_validation",
  "dependency_checks",
  "performance",
  "memory",
  "crashes",
  "gameplay_tests",
  "narrative_consistency",
  "continuity",
  "localization",
  "accessibility",
  "security",
  "license_ip",
  "device_testing",
  "regression_tests"
] as const;

export type QACheck = typeof QA_CHECKS[number];
export type QAStatus = "not_run" | "running" | "passed" | "failed" | "blocked" | "skipped";

export type QAFindingSeverity = "info" | "low" | "medium" | "high" | "critical";

export interface QAFinding {
  severity: QAFindingSeverity;
  message: string;
  file?: string;
  line?: number;
  ruleId?: string;
  remediation?: string;
}

export interface QAResult {
  check: QACheck;
  status: Exclude<QAStatus, "not_run" | "running">;
  evidence: string[];
  findings?: QAFinding[];
  metrics?: Record<string, number | string | boolean>;
  startedAt?: string;
  finishedAt?: string;
  workerId?: string;
}

export interface QAGate {
  id: QACheck;
  name: string;
  required: boolean;
  status: QAStatus;
  evidenceIds: string[];
}

export interface QAPlan {
  id: string;
  projectId: string;
  buildId?: string;
  gates: QAGate[];
  createdAt: string;
}

export interface QASummary {
  ready: boolean;
  passed: number;
  failed: number;
  blocked: number;
  skipped: number;
  missingEvidence: number;
}

export interface QAReport {
  id: string;
  projectId: string;
  buildId?: string;
  plan: QAPlan;
  results: QAResult[];
  summary: QASummary;
  ready: boolean;
  evidence: string[];
  createdAt: string;
}

export interface QAContext {
  projectId: string;
  buildId?: string;
  handlers: Partial<Record<QACheck, () => Promise<QAResult>>>;
}

const QA_NAMES: Record<QACheck, string> = {
  static_analysis: "Static analysis",
  code_validation: "Code validation",
  asset_validation: "Asset validation",
  dependency_checks: "Dependency checks",
  performance: "Performance",
  memory: "Memory",
  crashes: "Crash analysis",
  gameplay_tests: "Gameplay tests",
  narrative_consistency: "Narrative consistency",
  continuity: "Continuity",
  localization: "Localization",
  accessibility: "Accessibility",
  security: "Security",
  license_ip: "License / IP",
  device_testing: "Device testing",
  regression_tests: "Regression tests"
};

export function createQAPlan(projectId: string, buildId?: string): QAPlan {
  return {
    id: `qa-${projectId}-${buildId ?? "unbuilt"}`,
    projectId,
    buildId,
    gates: QA_CHECKS.map(check => ({
      id: check,
      name: QA_NAMES[check],
      required: true,
      status: "not_run",
      evidenceIds: []
    })),
    createdAt: new Date().toISOString()
  };
}

export function evaluateQAGates(results: QAResult[]): QASummary {
  const byCheck = new Map(results.map(result => [result.check, result]));
  let passed = 0;
  let failed = 0;
  let blocked = 0;
  let skipped = 0;
  let missingEvidence = 0;

  for (const check of QA_CHECKS) {
    const result = byCheck.get(check);
    if (!result || result.status === "not_run") {
      blocked++;
      missingEvidence++;
      continue;
    }
    if (!result.evidence?.length) {
      missingEvidence++;
      blocked++;
      continue;
    }
    switch (result.status) {
      case "passed": passed++; break;
      case "failed": failed++; break;
      case "blocked": blocked++; break;
      case "skipped": skipped++; break;
    }
  }

  return {
    ready: passed === QA_CHECKS.length && failed === 0 && blocked === 0 && skipped === 0 && missingEvidence === 0,
    passed,
    failed,
    blocked,
    skipped,
    missingEvidence
  };
}

export async function runQASuite(context: QAContext): Promise<QAReport> {
  const plan = createQAPlan(context.projectId, context.buildId);
  const results: QAResult[] = [];

  for (const check of QA_CHECKS) {
    const handler = context.handlers[check];

    if (!handler) {
      results.push({
        check,
        status: "blocked",
        evidence: [],
        findings: [{
          severity: "high",
          message: `No QA worker is configured for ${QA_NAMES[check]}.`,
          remediation: "Connect a worker/adapter that returns machine-readable results and evidence."
        }]
      });
      continue;
    }

    try {
      const result = await handler();
      results.push(result.check === check ? result : {
        ...result,
        check
      });
    } catch (error) {
      results.push({
        check,
        status: "failed",
        evidence: [],
        findings: [{
          severity: "critical",
          message: error instanceof Error ? error.message : String(error)
        }]
      });
    }
  }

  const summary = evaluateQAGates(results);
  const evidence = results.flatMap(result => result.evidence ?? []);
  return {
    id: plan.id,
    projectId: context.projectId,
    buildId: context.buildId,
    plan,
    results,
    summary,
    ready: summary.ready,
    evidence,
    createdAt: new Date().toISOString()
  };
}

export function formatQAChecklist(report: QAReport): string[] {
  return QA_CHECKS.map(check => {
    const result = report.results.find(item => item.check === check);
    return `${QA_NAMES[check]}: ${result?.status ?? "not_run"}`;
  });
}
