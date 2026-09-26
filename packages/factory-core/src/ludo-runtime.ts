import type { LudoConnectionConfig, LudoInvocation, LudoInvocationResult, LudoTransportAdapter } from "./ludo-api-mcp-adapter";

export interface SecretResolver {
  resolve(reference: string): Promise<string>;
}

export class FetchLudoTransport implements LudoTransportAdapter {
  constructor(private readonly secrets?: SecretResolver) {}

  async invoke(config: LudoConnectionConfig, request: LudoInvocation): Promise<LudoInvocationResult> {
    const headers: Record<string, string> = { "content-type": "application/json", "x-idempotency-key": request.idempotencyKey };
    if (config.apiKeyRef) {
      if (!this.secrets) throw new Error("LUDO_SECRET_RESOLVER_REQUIRED");
      headers.authorization = "Bearer " + await this.secrets.resolve(config.apiKeyRef);
    }
    const response = await fetch(new URL("/v1/" + request.capability, config.baseUrl), {
      method: "POST", headers, body: JSON.stringify({ projectId: request.projectId, input: request.input })
    });
    const text = await response.text();
    if (!response.ok) throw new Error("LUDO_HTTP_" + response.status + ":" + text.slice(0, 500));
    return JSON.parse(text) as LudoInvocationResult;
  }
}
