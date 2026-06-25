import { NextRequest, NextResponse } from "next/server";
import { readFileSync, writeFileSync, existsSync } from "fs";
import { join } from "path";
import type { AgentRecord } from "@/lib/types";
import { MOCK_AGENTS } from "@/lib/mockData";

const SIDECAR_PATH = join(process.cwd(), "data", "agents.json");

function readSidecar(): AgentRecord[] {
  try {
    if (!existsSync(SIDECAR_PATH)) return [];
    return JSON.parse(readFileSync(SIDECAR_PATH, "utf8"));
  } catch {
    return [];
  }
}

function writeSidecar(agents: AgentRecord[]) {
  const dir = join(process.cwd(), "data");
  if (!existsSync(dir)) {
    const { mkdirSync } = require("fs");
    mkdirSync(dir, { recursive: true });
  }
  writeFileSync(SIDECAR_PATH, JSON.stringify(agents, null, 2));
}

// Merge agents: sidecar wins over mock for same id
function mergeAgents(mock: AgentRecord[], sidecar: AgentRecord[]): AgentRecord[] {
  const map = new Map<string, AgentRecord>();
  for (const a of mock) map.set(a.id, a);
  for (const a of sidecar) map.set(a.id, a); // sidecar overrides
  return Array.from(map.values());
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const useMock = searchParams.get("mock") === "true";

  if (useMock) {
    return NextResponse.json(MOCK_AGENTS);
  }

  // Merge mock + sidecar (real agents posted from Railway etc.)
  const sidecar = readSidecar();
  const merged = mergeAgents(MOCK_AGENTS, sidecar);

  return NextResponse.json(merged);
}

// Railway agents or external agents POST here to self-report
export async function POST(req: NextRequest) {
  try {
    const body: AgentRecord = await req.json();
    if (!body.id || !body.name || !body.status) {
      return NextResponse.json({ error: "Missing required fields: id, name, status" }, { status: 400 });
    }

    const sidecar = readSidecar();
    const idx = sidecar.findIndex((a) => a.id === body.id);
    if (idx >= 0) {
      sidecar[idx] = { ...sidecar[idx], ...body };
    } else {
      sidecar.push(body);
    }
    writeSidecar(sidecar);

    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const sidecar = readSidecar();
  const filtered = sidecar.filter((a) => a.id !== id);
  writeSidecar(filtered);

  return NextResponse.json({ ok: true });
}
