export type EvidenceLevel = "info" | "warning" | "error" | "decision";

export interface EvidenceEvent {
  id: string;
  projectId: string;
  timestamp: string;
  level: EvidenceLevel;
  source: string;
  action: string;
  message: string;
  data?: Record<string, unknown>;
  correlationId?: string;
}

export class EvidenceLog {
  private events: EvidenceEvent[] = [];
  append(event: Omit<EvidenceEvent, "timestamp">): EvidenceEvent {
    const item = { ...event, timestamp: new Date().toISOString() };
    this.events.push(item);
    return item;
  }
  query(projectId: string): EvidenceEvent[] { return this.events.filter(e => e.projectId === projectId); }
}
