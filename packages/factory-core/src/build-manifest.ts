export interface BuildManifest {
  schemaVersion: "1.0";
  projectId: string;
  engine: { id: string; version?: string };
  target: "android-apk" | "android-aab" | "web" | "windows" | "linux" | "macos" | "ios" | (string & {});
  variant: "debug" | "release";
  signing?: { keyAlias: string; secretRef: string };
  minSdk?: number;
  targetSdk?: number;
  artifact?: { uri: string; sha256: string; sizeBytes: number; mimeType?: string; format?: "apk" | "aab" | "web" | "windows" | "linux" | "archive" | "custom"; signed?: boolean; verified: boolean };
  evidence: string[];
}

export interface BuildGate {
  id: string;
  name: string;
  required: boolean;
  passed: boolean;
  evidenceIds: string[];
}

export function isReleaseReady(gates: BuildGate[]): boolean {
  return gates.every(g => !g.required || g.passed);
}
