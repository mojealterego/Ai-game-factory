import {
  QA_CHECKS,
  createQAPlan,
  evaluateQAGates,
  runQASuite,
  type QAContext,
  type QAResult
} from "./qa";

const assert = (condition: boolean, message: string) => {
  if (!condition) throw new Error(message);
};

export async function runQAContractTests(): Promise<void> {
  assert(QA_CHECKS.length === 16, "QA must contain all 16 requested check families");
  assert(QA_CHECKS.includes("static_analysis"), "static analysis gate missing");
  assert(QA_CHECKS.includes("code_validation"), "code validation gate missing");
  assert(QA_CHECKS.includes("asset_validation"), "asset validation gate missing");
  assert(QA_CHECKS.includes("dependency_checks"), "dependency gate missing");
  assert(QA_CHECKS.includes("performance"), "performance gate missing");
  assert(QA_CHECKS.includes("memory"), "memory gate missing");
  assert(QA_CHECKS.includes("crashes"), "crash gate missing");
  assert(QA_CHECKS.includes("gameplay_tests"), "gameplay gate missing");
  assert(QA_CHECKS.includes("narrative_consistency"), "narrative gate missing");
  assert(QA_CHECKS.includes("continuity"), "continuity gate missing");
  assert(QA_CHECKS.includes("localization"), "localization gate missing");
  assert(QA_CHECKS.includes("accessibility"), "accessibility gate missing");
  assert(QA_CHECKS.includes("security"), "security gate missing");
  assert(QA_CHECKS.includes("license_ip"), "license/IP gate missing");
  assert(QA_CHECKS.includes("device_testing"), "device testing gate missing");
  assert(QA_CHECKS.includes("regression_tests"), "regression gate missing");

  const plan = createQAPlan("demo", "build-1");
  assert(plan.gates.length === 16, "default QA plan must contain 14 gates");
  assert(plan.gates.every(g => g.required), "release QA gates must be required by default");

  const pass: QAResult = {
    check: "static_analysis",
    status: "passed",
    evidence: ["ci://static-analysis"]
  };
  assert(evaluateQAGates([pass]).ready === true, "passing required QA gate must allow readiness");

  const fail: QAResult = {
    check: "security",
    status: "failed",
    evidence: ["ci://security"],
    findings: [{ severity: "high", message: "test finding" }]
  };
  assert(evaluateQAGates([pass, fail]).ready === false, "failed QA gate must block readiness");

  const handlers: QAContext["handlers"] = Object.fromEntries(
    QA_CHECKS.map(check => [check, async (): Promise<QAResult> => ({
      check,
      status: "passed",
      evidence: [`test://${check}`]
    })])
  ) as QAContext["handlers"];

  const suite = await runQASuite({ projectId: "demo", buildId: "build-1", handlers });
  assert(suite.ready === true, "complete passing QA suite must be release-ready");
  assert(suite.results.length === 16, "complete suite must return all QA results");
}

runQAContractTests();
