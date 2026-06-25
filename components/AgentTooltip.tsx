"use client";

import type { AgentRecord, JediCharacter } from "@/lib/types";
import { motion, AnimatePresence } from "framer-motion";

function formatDuration(startedAt: string): string {
  const ms = Date.now() - new Date(startedAt).getTime();
  const mins = Math.floor(ms / 60000);
  const hrs = Math.floor(mins / 60);
  if (hrs > 0) return `${hrs}h ${mins % 60}m`;
  return `${mins}m`;
}

const STATUS_COLORS: Record<string, string> = {
  active: "#4ade80",
  idle: "#94a3b8",
  error: "#ef4444",
  completed: "#60a5fa",
};

const STATUS_LABELS: Record<string, string> = {
  active: "ACTIVE",
  idle: "IDLE",
  error: "CRITICAL FAILURE",
  completed: "COMPLETED",
};

const SOURCE_LABELS: Record<string, string> = {
  "claude-code": "Claude Code",
  railway: "Railway",
  local: "Local",
};

export function AgentTooltip({
  agent,
  character,
  visible,
  x,
  y,
}: {
  agent: AgentRecord;
  character: JediCharacter;
  visible: boolean;
  x: number;
  y: number;
}) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 8 }}
          transition={{ duration: 0.15 }}
          style={{
            position: "fixed",
            left: x,
            top: y,
            transform: "translate(-50%, -110%)",
            zIndex: 9999,
            pointerEvents: "none",
          }}
          className="tooltip-card"
        >
          <div className="tooltip-header">
            <span className="tooltip-name">{agent.name}</span>
            <span
              className="tooltip-status"
              style={{ color: STATUS_COLORS[agent.status] }}
            >
              {STATUS_LABELS[agent.status]}
            </span>
          </div>

          <div className="tooltip-character">
            Channeling <span style={{ color: character.color }}>{character.name}</span>
          </div>

          <div className="tooltip-task">{agent.task}</div>

          <div className="tooltip-footer">
            <span className="tooltip-meta">{SOURCE_LABELS[agent.source]}</span>
            <span className="tooltip-meta">Running {formatDuration(agent.startedAt)}</span>
            {agent.connections.length > 0 && (
              <span className="tooltip-meta">⟷ {agent.connections.length} connection{agent.connections.length > 1 ? "s" : ""}</span>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
