import type { JediCharacter, AgentPriority } from "./types";

export const CHARACTERS: Record<AgentPriority, JediCharacter[]> = {
  high: [
    { id: "yoda",       name: "Yoda",           tier: "master", color: "#4ade80" },
    { id: "mace",       name: "Mace Windu",      tier: "master", color: "#a855f7" },
    { id: "obiwan",     name: "Obi-Wan Kenobi",  tier: "master", color: "#60a5fa" },
    { id: "quigon",     name: "Qui-Gon Jinn",    tier: "master", color: "#34d399" },
    { id: "kiadimundi", name: "Ki-Adi-Mundi",    tier: "master", color: "#93c5fd" },
    { id: "aayla",      name: "Aayla Secura",    tier: "master", color: "#38bdf8" },
    { id: "kitfisto",   name: "Kit Fisto",        tier: "master", color: "#22d3ee" },
    { id: "saesee",     name: "Saesee Tiin",      tier: "master", color: "#86efac" },
    { id: "yaddle",     name: "Yaddle",            tier: "master", color: "#6ee7b7" },
    { id: "evenpiell",  name: "Even Piell",        tier: "master", color: "#67e8f9" },
  ],
  medium: [
    { id: "anakin",   name: "Anakin Skywalker", tier: "knight", color: "#fbbf24" },
    { id: "ahsoka",   name: "Ahsoka Tano",      tier: "knight", color: "#fb923c" },
    { id: "plokoon",  name: "Plo Koon",          tier: "knight", color: "#818cf8" },
    { id: "shaakti",  name: "Shaak Ti",          tier: "knight", color: "#f472b6" },
    { id: "luminara", name: "Luminara Unduli",   tier: "knight", color: "#6ee7b7" },
    { id: "barris",   name: "Barriss Offee",     tier: "knight", color: "#a5b4fc" },
    { id: "rex",      name: "Captain Rex",        tier: "knight", color: "#93c5fd" },
    { id: "kanan",    name: "Kanan Jarrus",       tier: "knight", color: "#d8b4fe" },
    { id: "ezra",     name: "Ezra Bridger",       tier: "knight", color: "#7dd3fc" },
    { id: "hera",     name: "Hera Syndulla",      tier: "knight", color: "#86efac" },
    { id: "sabine",   name: "Sabine Wren",        tier: "knight", color: "#fda4af" },
  ],
  low: [
    { id: "r2d2",     name: "R2-D2",        tier: "other", color: "#38bdf8" },
    { id: "c3po",     name: "C-3PO",        tier: "other", color: "#fde68a" },
    { id: "bb8",      name: "BB-8",         tier: "other", color: "#fdba74" },
    { id: "jarjar",   name: "Jar Jar",      tier: "other", color: "#86efac" },
    { id: "chewie",   name: "Chewbacca",    tier: "other", color: "#d97706" },
    { id: "lando",    name: "Lando",        tier: "other", color: "#c084fc" },
    { id: "grogu",    name: "Grogu",         tier: "other", color: "#4ade80" },
    { id: "ig11",     name: "IG-11",         tier: "other", color: "#94a3b8" },
    { id: "chopper",  name: "Chopper",       tier: "other", color: "#f87171" },
    { id: "wicket",   name: "Wicket",        tier: "other", color: "#a78bfa" },
    { id: "niennunb", name: "Nien Nunb",     tier: "other", color: "#6ee7b7" },
  ],
};

const assignmentMap = new Map<string, string>(); // agentId → characterId

export function assignCharacter(agentId: string, priority: AgentPriority): JediCharacter {
  if (assignmentMap.has(agentId)) {
    const charId = assignmentMap.get(agentId)!;
    const all = [...CHARACTERS.high, ...CHARACTERS.medium, ...CHARACTERS.low];
    return all.find((c) => c.id === charId) ?? CHARACTERS[priority][0];
  }
  const pool = CHARACTERS[priority];
  const usedIds = new Set(assignmentMap.values());
  const available = pool.filter((c) => !usedIds.has(c.id));
  const picked = available.length > 0 ? available[0] : pool[usedIds.size % pool.length];
  assignmentMap.set(agentId, picked.id);
  return picked;
}

export function resetCharacterAssignments() {
  assignmentMap.clear();
}
