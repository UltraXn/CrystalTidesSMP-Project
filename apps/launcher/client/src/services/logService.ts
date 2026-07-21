const LOG_KEY = "crystaltides_logs";
const MAX_LOG_LINES = 500;

export type LogLevel = "info" | "warn" | "error" | "debug";

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  category?: string;
  message: string;
}

const getStoredLogs = (): LogEntry[] => {
  try {
    const raw = localStorage.getItem(LOG_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const saveLogs = (logs: LogEntry[]) => {
  // Keep only the last MAX_LOG_LINES entries
  const trimmed = logs.slice(-MAX_LOG_LINES);
  localStorage.setItem(LOG_KEY, JSON.stringify(trimmed));
};

export const log = (
  message: string,
  opts?: { level?: LogLevel; category?: string }
) => {
  const entry: LogEntry = {
    timestamp: new Date().toISOString(),
    level: opts?.level || "info",
    category: opts?.category,
    message,
  };

  const logs = getStoredLogs();
  logs.push(entry);
  saveLogs(logs);

  // Also print to console
  const prefix = entry.category ? `[${entry.category}] ` : "";
  switch (entry.level) {
    case "error":
      console.error(`${prefix}${message}`);
      break;
    case "warn":
      console.warn(`${prefix}${message}`);
      break;
    case "debug":
      console.debug(`${prefix}${message}`);
      break;
    default:
      console.log(`${prefix}${message}`);
  }
};

export const getLogs = (): LogEntry[] => getStoredLogs();

export const clearLogs = () => {
  localStorage.removeItem(LOG_KEY);
};

export const getLogText = (): string => {
  return getStoredLogs()
    .map((e) => {
      const cat = e.category ? `[${e.category}] ` : "";
      return `[${e.timestamp}] [${e.level.toUpperCase()}] ${cat}${e.message}`;
    })
    .join("\n");
};
