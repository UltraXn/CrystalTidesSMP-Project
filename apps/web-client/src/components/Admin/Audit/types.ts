export interface LogEntry {
  id: string;
  created_at: number | string;
  username: string;
  action: string;
  details: string;
  source: string;
}

export interface AuditLogProps {
  mockLogs?: LogEntry[];
  mockTotal?: number;
}
