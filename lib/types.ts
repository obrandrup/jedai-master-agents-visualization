export type AgentStatus = "active" | "idle" | "error" | "completed";
export type AgentPriority = "high" | "medium" | "low";
export type AgentSource = "claude-code" | "railway" | "local";

export type AgentRecord = {
  id: string;
  name: string;
  source: AgentSource;
  status: AgentStatus;
  priority: AgentPriority;
  task: string;
  connections: string[]; // ids of agents this one communicates with
  startedAt: string; // ISO string
};

export type JediCharacter = {
  id: string;
  name: string;
  tier: "master" | "knight" | "other";
  color: string; // lightsaber/accent color
};
