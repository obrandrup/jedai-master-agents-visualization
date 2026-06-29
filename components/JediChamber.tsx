"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { AgentRecord, JediCharacter } from "@/lib/types";
import { assignCharacter, resetCharacterAssignments } from "@/lib/characters";
import { CharacterSilhouette } from "./CharacterSilhouette";
import { AgentTooltip } from "./AgentTooltip";

// ─── Layout constants (chamber occupies 0..1000 x 0..1000) ─────────────────
const BASE_VW = 1000, VH = 1000;
const FCX = 500, FCY = 638;
const FRX = 455, FRY = 222;
const SRX = 358, SRY = 175;
const MAX_SEATS = 24;
const PR = 90;

const PILLARS = [
  { x: 50,  py: 598 }, { x: 150, py: 492 }, { x: 265, py: 447 },
  { x: 382, py: 422 }, { x: 500, py: 416 }, { x: 618, py: 422 },
  { x: 735, py: 447 }, { x: 850, py: 492 }, { x: 950, py: 598 },
] as const;

function seatPos(i: number) {
  const a = (i / MAX_SEATS) * 2 * Math.PI - Math.PI / 2;
  return { x: FCX + SRX * Math.cos(a), y: FCY + SRY * Math.sin(a) };
}

function depthScale(y: number) {
  const t = Math.max(0, Math.min(1, (y - (FCY - FRY)) / (FRY * 2)));
  return 0.58 + 0.54 * t;
}

function getSvgPt(e: React.PointerEvent | PointerEvent, svg: SVGSVGElement) {
  const ctm = svg.getScreenCTM();
  if (!ctm) return { x: 0, y: 0 };
  const pt = svg.createSVGPoint();
  pt.x = e.clientX; pt.y = e.clientY;
  const r = pt.matrixTransform(ctm.inverse());
  return { x: r.x, y: r.y };
}

const STATUS_COLOR: Record<string, string> = {
  active: "#4ade80", idle: "#94a3b8", error: "#ef4444", completed: "#60a5fa",
};

function getMidichlorians(agent: AgentRecord): number {
  const elapsed = Date.now() - new Date(agent.startedAt).getTime();
  const hours = elapsed / (1000 * 60 * 60);
  const base = agent.status === "active" ? 14000 : agent.status === "idle" ? 5000
    : agent.status === "error" ? 9500 : 2200;
  const prio = agent.priority === "high" ? 1.6 : agent.priority === "medium" ? 1.1 : 0.75;
  return Math.round(base * prio * (1 + hours * 0.08));
}

// ─── Weapon map: character → weapon colour + type ───────────────────────────
type WeaponType = "saber" | "blaster" | "force" | "staff";
const WEAPON_MAP: Record<string, { color: string; type: WeaponType }> = {
  yoda:       { color: "#4ade80", type: "saber"   },
  mace:       { color: "#a855f7", type: "saber"   },
  obiwan:     { color: "#60a5fa", type: "saber"   },
  quigon:     { color: "#34d399", type: "saber"   },
  kiadimundi: { color: "#93c5fd", type: "saber"   },
  aayla:      { color: "#38bdf8", type: "saber"   },
  kitfisto:   { color: "#22d3ee", type: "saber"   },
  saesee:     { color: "#86efac", type: "saber"   },
  yaddle:     { color: "#6ee7b7", type: "saber"   },
  evenpiell:  { color: "#67e8f9", type: "saber"   },
  anakin:     { color: "#fbbf24", type: "saber"   },
  ahsoka:     { color: "#fb923c", type: "saber"   },
  plokoon:    { color: "#818cf8", type: "saber"   },
  shaakti:    { color: "#f472b6", type: "saber"   },
  luminara:   { color: "#6ee7b7", type: "saber"   },
  barris:     { color: "#a5b4fc", type: "saber"   },
  rex:        { color: "#93c5fd", type: "blaster" },
  kanan:      { color: "#d8b4fe", type: "saber"   },
  ezra:       { color: "#7dd3fc", type: "saber"   },
  hera:       { color: "#86efac", type: "blaster" },
  sabine:     { color: "#fda4af", type: "blaster" },
  r2d2:       { color: "#38bdf8", type: "staff"   },
  c3po:       { color: "#fde68a", type: "force"   },
  bb8:        { color: "#fdba74", type: "staff"   },
  jarjar:     { color: "#86efac", type: "force"   },
  chewie:     { color: "#d97706", type: "blaster" },
  lando:      { color: "#c084fc", type: "blaster" },
  grogu:      { color: "#4ade80", type: "force"   },
  ig11:       { color: "#94a3b8", type: "blaster" },
  chopper:    { color: "#f87171", type: "staff"   },
  wicket:     { color: "#a78bfa", type: "staff"   },
  niennunb:   { color: "#6ee7b7", type: "blaster" },
};

// ─── Weapon SVG drawn above an agent on completion ──────────────────────────
function WeaponFlash({ type, color, r }: { type: WeaponType; color: string; r: number }) {
  if (type === "saber") return (
    <motion.g
      initial={{ opacity: 0, scaleY: 0 }}
      animate={{ opacity: [0, 1, 1, 0], scaleY: [0, 1, 1, 0] }}
      transition={{ duration: 2.8, ease: "easeOut" }}
      style={{ transformOrigin: `0px ${-r - 4}px` }}
    >
      {/* Hilt */}
      <rect x={-3} y={-r - 4} width={6} height={10} rx={2} fill="#888" />
      {/* Blade */}
      <rect x={-2.5} y={-r - 4 - 44} width={5} height={44} rx={2.5}
        fill={color} style={{ filter: `drop-shadow(0 0 6px ${color})` }} />
      <rect x={-1} y={-r - 4 - 44} width={2} height={44} rx={1} fill="#fff" opacity={0.7} />
    </motion.g>
  );

  if (type === "blaster") return (
    <motion.g
      initial={{ opacity: 0 }}
      animate={{ opacity: [0, 1, 1, 0] }}
      transition={{ duration: 2.0 }}
    >
      {/* Barrel */}
      <rect x={-14} y={-r - 18} width={28} height={8} rx={3} fill="#666" />
      {/* Muzzle flash */}
      <motion.ellipse cx={14} cy={-r - 14} rx={8} ry={5}
        fill={color} animate={{ rx: [8, 14, 6, 10, 0], opacity: [1, 0.8, 1, 0.6, 0] }}
        transition={{ duration: 0.5, repeat: 3 }}
        style={{ filter: `drop-shadow(0 0 5px ${color})` }} />
    </motion.g>
  );

  if (type === "force") return (
    <motion.g>
      {[0, 60, 120, 180, 240, 300].map((deg, i) => {
        const rad = (deg * Math.PI) / 180;
        return (
          <motion.circle key={i}
            cx={Math.cos(rad) * 20} cy={-r - 30 + Math.sin(rad) * 10}
            r={4} fill={color} opacity={0.9}
            animate={{ r: [4, 8, 4], opacity: [0.9, 0.3, 0.9] }}
            transition={{ duration: 0.8, repeat: 3, delay: i * 0.1 }}
            style={{ filter: `drop-shadow(0 0 4px ${color})` }}
          />
        );
      })}
    </motion.g>
  );

  // staff
  return (
    <motion.g
      initial={{ opacity: 0, rotate: -30 }}
      animate={{ opacity: [0, 1, 1, 0], rotate: [-30, 0, 0, 30] }}
      transition={{ duration: 2.4 }}
      style={{ transformOrigin: `0px ${-r - 10}px` }}
    >
      <rect x={-2} y={-r - 10 - 50} width={4} height={50} rx={2} fill="#8B5E3C" />
      <ellipse cx={0} cy={-r - 10 - 54} rx={6} ry={4} fill={color}
        style={{ filter: `drop-shadow(0 0 5px ${color})` }} />
    </motion.g>
  );
}

// ─── Handoff beam: arcs from completed agent to next active ─────────────────
function HandoffBeam({ x1, y1, x2, y2, color }: { x1:number;y1:number;x2:number;y2:number;color:string }) {
  const mx = (x1 + x2) / 2;
  const my = Math.min(y1, y2) - 80;
  const d = `M ${x1} ${y1} Q ${mx} ${my} ${x2} ${y2}`;
  return (
    <motion.path d={d} fill="none" stroke={color} strokeWidth={3}
      strokeLinecap="round"
      initial={{ pathLength: 0, opacity: 1 }}
      animate={{ pathLength: 1, opacity: [1, 1, 0] }}
      transition={{ duration: 1.4, ease: "easeInOut" }}
      style={{ filter: `drop-shadow(0 0 8px ${color})` }}
    />
  );
}

// ─── Completion toast floating up from agent ────────────────────────────────
function CompletionToast({ label }: { label: string }) {
  return (
    <motion.g
      initial={{ y: 0, opacity: 1 }}
      animate={{ y: -60, opacity: 0 }}
      transition={{ duration: 2.5, ease: "easeOut" }}
    >
      <rect x={-50} y={-10} width={100} height={20} rx={4}
        fill="rgba(8,12,24,0.92)" stroke="#60a5fa" strokeWidth={1} />
      <text textAnchor="middle" y={4} fontSize={9} fill="#60a5fa"
        fontFamily="var(--font-mono)" letterSpacing="0.5">
        ✓ {label.length > 12 ? label.slice(0, 11) + "…" : label}
      </text>
    </motion.g>
  );
}

// ─── Full-bleed chamber background ──────────────────────────────────────────
function ChamberRoom({ offset, totalW }: { offset: number; totalW: number }) {
  const L = -offset, R = totalW - offset; // left/right in chamber coords
  const buildings: [number, number, number][] = [
    [22,388,52],[82,418,38],[135,380,62],[212,402,48],[270,372,72],
    [358,398,40],[412,376,58],[488,402,36],[542,380,84],[638,394,46],
    [697,374,64],[778,402,36],[828,378,74],[916,400,50],[978,394,20],
    // extra buildings for wide screens
    [-220,392,60],[-150,410,44],[-70,382,52],[-310,398,36],
    [1020,390,58],[1100,415,40],[1180,385,62],[1270,402,46],[1350,378,54],
  ];
  return (
    <g>
      <defs>
        <linearGradient id="skyG" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#010306" />
          <stop offset="40%" stopColor="#091018" />
          <stop offset="78%" stopColor="#2a1608" />
          <stop offset="100%" stopColor="#3e2210" />
        </linearGradient>
        <radialGradient id="floorG" cx="50%" cy="42%" r="62%">
          <stop offset="0%" stopColor="#1c2236" />
          <stop offset="58%" stopColor="#111825" />
          <stop offset="100%" stopColor="#0a0e18" />
        </radialGradient>
        <radialGradient id="centerGlowG" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#c8a84b" stopOpacity="0.14" />
          <stop offset="100%" stopColor="#c8a84b" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="stoneG" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1a1f2c" />
          <stop offset="100%" stopColor="#0e131e" />
        </linearGradient>
      </defs>

      {/* Sky fills entire width */}
      <rect x={L} width={R - L} height={VH} fill="#030508" />
      <rect x={L} width={R - L} height={660} fill="url(#skyG)" />

      {/* Coruscant city glow */}
      <ellipse cx={FCX} cy={330} rx={Math.max(520, (R-L)*0.52)} ry={200}
        fill="#c07828" opacity={0.07} />

      {/* City building silhouettes — fill full width */}
      {buildings.map(([x, y, w], i) => (
        <rect key={i} x={x} y={y} width={w} height={VH - y}
          fill={`hsl(${215+i*4},20%,${9+(i%3)*3}%)`} opacity={0.88} />
      ))}
      {/* Filler rect to fill gaps between buildings on sides */}
      {offset > 0 && <>
        <rect x={L} y={380} width={offset - 36} height={VH} fill="hsl(217,18%,9%)" opacity={0.85} />
        <rect x={BASE_VW + 36} y={380} width={offset - 36} height={VH} fill="hsl(217,18%,9%)" opacity={0.85} />
      </>}

      {/* Window lights */}
      {Array.from({ length: 90 }, (_, i) => (
        <rect key={`wl${i}`}
          x={L + 8 + (i * 163) % (R - L - 16)} y={388 + (i * 47) % 185}
          width={3} height={4} fill={`hsl(${38+(i%28)},72%,62%)`}
          opacity={i % 4 === 0 ? 0.82 : 0.20} />
      ))}

      {/* Ceiling lattice */}
      {[32, 58, 84].map(y => (
        <line key={y} x1={L} y1={y} x2={R} y2={y} stroke="#18202e" strokeWidth={3.5} />
      ))}
      {Array.from({ length: Math.ceil((R - L) / 85) + 1 }, (_, i) => {
        const sx = L + i * 85;
        return (
          <g key={`lat${i}`}>
            <line x1={sx} y1={0} x2={sx+75} y2={92} stroke="#14192a" strokeWidth={2.5} opacity={0.85} />
            <line x1={sx+75} y1={0} x2={sx} y2={92} stroke="#14192a" strokeWidth={2.5} opacity={0.85} />
          </g>
        );
      })}

      {/* Window glow between pillars */}
      {PILLARS.slice(0, -1).map((p, i) => {
        const q = PILLARS[i + 1];
        const cx2 = (p.x + q.x) / 2;
        const topY = Math.min(p.py, q.py) - 20;
        const botY = Math.max(p.py, q.py) + 10;
        return (
          <ellipse key={i} cx={cx2} cy={(topY + botY) / 2}
            rx={(q.x - p.x) * 0.35} ry={(botY - topY) * 0.42}
            fill="#d07830" opacity={0.06} />
        );
      })}

      {/* Wall fills */}
      <path d={`M ${L} 0 L ${PILLARS[0].x-14} 0 L ${PILLARS[0].x-14} ${PILLARS[0].py} Q 28 ${FCY-FRY+40} 0 ${FCY+10} L ${L} ${FCY+10} Z`}
        fill="url(#stoneG)" />
      <path d={`M ${R} 0 L ${PILLARS[8].x+14} 0 L ${PILLARS[8].x+14} ${PILLARS[8].py} Q 972 ${FCY-FRY+40} ${BASE_VW} ${FCY+10} L ${R} ${FCY+10} Z`}
        fill="url(#stoneG)" />

      {/* Stone pillars */}
      {PILLARS.map((p, i) => {
        const w = i===0||i===8?36:i===1||i===7?32:i===2||i===6?29:26;
        return (
          <g key={i}>
            <rect x={p.x-w/2} y={0} width={w} height={p.py+14} fill="url(#stoneG)" />
            <rect x={p.x-w/2} y={0} width={4} height={p.py+14} fill="#28324a" opacity={0.55} />
            <rect x={p.x+w/2-4} y={0} width={4} height={p.py+14} fill="#06080e" opacity={0.65} />
            <rect x={p.x-w/2-4} y={82} width={w+8} height={10} fill="#1e2535" opacity={0.9} />
            <rect x={p.x-w/2-4} y={p.py} width={w+8} height={14} fill="#1e2535" opacity={0.9} rx={2} />
          </g>
        );
      })}

      {/* Floor */}
      <ellipse cx={FCX} cy={FCY} rx={FRX} ry={FRY} fill="url(#floorG)" />
      <ellipse cx={FCX} cy={FCY} rx={FRX} ry={FRY} fill="none" stroke="#1d2640" strokeWidth={3.5} />
      <ellipse cx={FCX} cy={FCY} rx={FRX+3} ry={FRY+1.5} fill="none" stroke="#08090e" strokeWidth={7} opacity={0.6} />
      {[0.86, 0.71, 0.55, 0.39, 0.23, 0.11].map((s, i) => (
        <ellipse key={i} cx={FCX} cy={FCY} rx={FRX*s} ry={FRY*s}
          fill="none" stroke="#c8a84b" strokeWidth={i<2?0.9:0.55} opacity={0.07+i*0.013} />
      ))}
      {Array.from({ length: MAX_SEATS }, (_, i) => {
        const a = (i / MAX_SEATS) * 2 * Math.PI - Math.PI / 2;
        return (
          <line key={i}
            x1={FCX+62*Math.cos(a)} y1={FCY+30*Math.sin(a)}
            x2={FCX+FRX*0.88*Math.cos(a)} y2={FCY+FRY*0.88*Math.sin(a)}
            stroke="#c8a84b" strokeWidth={0.35} opacity={0.045} />
        );
      })}
      <ellipse cx={FCX} cy={FCY} rx={92} ry={45} fill="url(#centerGlowG)" />
      <ellipse cx={FCX} cy={FCY+FRY} rx={FRX*0.96} ry={20} fill="#05070c" opacity={0.55} />
    </g>
  );
}

function JediEmblem() {
  return (
    <g>
      <ellipse cx={FCX} cy={FCY} rx={74} ry={36} fill="none" stroke="#c8a84b" strokeWidth={1} opacity={0.38} />
      <ellipse cx={FCX} cy={FCY} rx={52} ry={25} fill="none" stroke="#c8a84b" strokeWidth={0.6} opacity={0.28} />
      <polygon points={`${FCX},${FCY-34} ${FCX+13},${FCY} ${FCX},${FCY+34} ${FCX-13},${FCY}`}
        fill="#c8a84b" opacity={0.20} />
      <path d={`M ${FCX-13} ${FCY} L ${FCX-70} ${FCY-19} L ${FCX-60} ${FCY} L ${FCX-70} ${FCY+19} Z`}
        fill="#c8a84b" opacity={0.16} />
      <path d={`M ${FCX+13} ${FCY} L ${FCX+70} ${FCY-19} L ${FCX+60} ${FCY} L ${FCX+70} ${FCY+19} Z`}
        fill="#c8a84b" opacity={0.16} />
    </g>
  );
}

function ForceBeam({ x1, y1, x2, y2 }: { x1:number;y1:number;x2:number;y2:number }) {
  const mx = (x1+x2)/2+(FCX-(x1+x2)/2)*0.22;
  const my = (y1+y2)/2+(FCY-(y1+y2)/2)*0.22;
  const d = `M ${x1} ${y1} Q ${mx} ${my} ${x2} ${y2}`;
  return (
    <g>
      <motion.path d={d} stroke="#818cf8" strokeWidth={2} fill="none" opacity={0.18}
        animate={{ opacity: [0.10, 0.35, 0.10] }}
        transition={{ duration: 2.4, repeat: Infinity }} />
      <motion.path d={d} stroke="#c7d2fe" strokeWidth={0.7} fill="none"
        strokeDasharray="10 8" opacity={0.5}
        animate={{ strokeDashoffset: [0, -220] }}
        transition={{ duration: 2.8, repeat: Infinity, ease: "linear" }} />
    </g>
  );
}

// ─── Planet surfaces ─────────────────────────────────────────────────────────
function TatooineSurface() {
  return (
    <g>
      <defs>
        <clipPath id="tat-clip"><circle r={PR} /></clipPath>
        <radialGradient id="tat-grad" cx="35%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#f5e080" /><stop offset="30%" stopColor="#e09040" />
          <stop offset="65%" stopColor="#c86820" /><stop offset="100%" stopColor="#6a2e08" />
        </radialGradient>
      </defs>
      <circle r={PR} fill="url(#tat-grad)" />
      <g clipPath="url(#tat-clip)">
        <ellipse cx={0} cy={-16} rx={PR*0.9} ry={9} fill="#c87030" opacity={0.38} />
        <ellipse cx={4} cy={0} rx={PR*0.85} ry={7} fill="#b86020" opacity={0.32} />
        <ellipse cx={-4} cy={15} rx={PR*0.8} ry={8} fill="#c87840" opacity={0.30} />
        <ellipse cx={0} cy={30} rx={PR*0.7} ry={10} fill="#a05010" opacity={0.35} />
        <path d="M -40 -8 Q -20 0 0 -4 Q 22 -8 44 0" fill="none" stroke="#7a3a08" strokeWidth={2.5} opacity={0.55} />
        <path d="M -50 14 Q -25 8 0 13 Q 26 18 52 10" fill="none" stroke="#8a4810" strokeWidth={2} opacity={0.45} />
        <ellipse cx={-16} cy={-32} rx={24} ry={9} fill="#f5e090" opacity={0.28} />
        <ellipse cx={26} cy={24} rx={38} ry={32} fill="#60280a" opacity={0.32} />
      </g>
      <circle r={PR} fill="none" stroke="#f5c842" strokeWidth={6} opacity={0.22} />
      <circle r={PR+8} fill="none" stroke="#f0a020" strokeWidth={3} opacity={0.08} />
      <motion.g animate={{ rotate: 360 }} transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
        style={{ transformOrigin: "0px 0px" }}>
        <circle cx={PR+18} cy={-PR+6} r={10} fill="#fff8a0" opacity={0.95} />
        <circle cx={PR+18} cy={-PR+6} r={16} fill="#ffd060" opacity={0.25} />
        <circle cx={PR+36} cy={-PR+22} r={7} fill="#ffe080" opacity={0.90} />
        <circle cx={PR+36} cy={-PR+22} r={11} fill="#ffb030" opacity={0.22} />
      </motion.g>
    </g>
  );
}

function CoruscantSurface() {
  const lights: [number, number, number][] = [
    [-52,-44,4],[-30,-48,3],[-10,-50,4],[14,-48,3],[34,-44,4],[52,-38,3],
    [-56,-28,3],[-38,-32,4],[-18,-30,3],[4,-32,4],[24,-28,3],[44,-24,4],[58,-20,3],
    [-58,-12,4],[-40,-14,3],[-22,-12,4],[-4,-14,3],[16,-10,4],[36,-12,3],[54,-8,4],
    [-54,4,3],[-34,8,4],[-14,6,3],[6,8,4],[26,4,3],[46,8,4],[58,10,3],
    [-52,20,4],[-32,24,3],[-12,22,4],[8,24,3],[28,20,4],[48,22,3],
    [-44,36,3],[-24,38,4],[-4,36,3],[16,38,4],[36,36,3],[52,34,4],
    [-34,50,4],[-14,52,3],[6,50,4],[26,52,3],[44,48,4],
  ];
  return (
    <g>
      <defs>
        <clipPath id="cor-clip"><circle r={PR} /></clipPath>
        <radialGradient id="cor-grad" cx="50%" cy="50%" r="65%">
          <stop offset="0%" stopColor="#1e2848" /><stop offset="55%" stopColor="#111830" />
          <stop offset="100%" stopColor="#070c1c" />
        </radialGradient>
        <radialGradient id="cor-atm" cx="50%" cy="50%" r="50%">
          <stop offset="65%" stopColor="#e07030" stopOpacity="0" />
          <stop offset="100%" stopColor="#e07030" stopOpacity="0.35" />
        </radialGradient>
      </defs>
      <circle r={PR} fill="url(#cor-grad)" />
      <g clipPath="url(#cor-clip)">
        {lights.map(([x,y,r],i) => (
          <motion.circle key={i} cx={x} cy={y} r={r}
            fill={i%3===0?"#ffa030":i%3===1?"#ffcc60":"#6ab0ff"} opacity={0.75}
            animate={{ opacity: [0.45,1.0,0.45] }}
            transition={{ duration:1.4+(i%5)*0.35, repeat:Infinity, delay:(i%9)*0.15 }} />
        ))}
        <ellipse cx={0} cy={-PR+14} rx={28} ry={14} fill="#1a2a58" opacity={0.55} />
      </g>
      <circle r={PR} fill="url(#cor-atm)" />
      <circle r={PR} fill="none" stroke="#e07030" strokeWidth={7} opacity={0.25} />
    </g>
  );
}

function DagobahSurface() {
  return (
    <g>
      <defs>
        <clipPath id="dag-clip"><circle r={PR} /></clipPath>
        <radialGradient id="dag-grad" cx="40%" cy="36%" r="70%">
          <stop offset="0%" stopColor="#2e5e34" /><stop offset="50%" stopColor="#1a4024" />
          <stop offset="100%" stopColor="#081810" />
        </radialGradient>
      </defs>
      <circle r={PR} fill="url(#dag-grad)" />
      <g clipPath="url(#dag-clip)">
        <ellipse cx={-18} cy={14} rx={28} ry={16} fill="#4a2e10" opacity={0.50} />
        <ellipse cx={24} cy={-8} rx={22} ry={13} fill="#3a2808" opacity={0.42} />
        <ellipse cx={-6} cy={34} rx={30} ry={14} fill="#5a3a14" opacity={0.44} />
        <ellipse cx={-30} cy={-20} rx={18} ry={11} fill="#3a6030" opacity={0.60} />
        <ellipse cx={10} cy={-30} rx={16} ry={10} fill="#2e5428" opacity={0.55} />
        <ellipse cx={-14} cy={18} rx={24} ry={8} fill="#60b0b0" opacity={0.15} />
        <ellipse cx={22} cy={22} rx={36} ry={30} fill="#061008" opacity={0.38} />
      </g>
      <circle r={PR} fill="none" stroke="#60a060" strokeWidth={7} opacity={0.22} />
      <motion.g animate={{ rotate: [0,360] }} transition={{ duration:70, repeat:Infinity, ease:"linear" }}
        style={{ transformOrigin:"0px 0px" }}>
        <ellipse cx={0} cy={-PR+6} rx={PR*0.75} ry={8} fill="#80c080" opacity={0.14} />
      </motion.g>
    </g>
  );
}

function JedaiCouncoseSurface() {
  const crystals: [number, number, number, string][] = [
    [-48,-40,3,"#d090ff"],[-28,-50,4,"#a060ff"],[0,-55,5,"#c080ff"],[28,-50,3,"#8050e0"],[50,-42,4,"#b070ff"],
    [-54,-22,3,"#9050e0"],[-36,-28,4,"#c080ff"],[-16,-24,3,"#a060ff"],[6,-26,4,"#d090ff"],[26,-22,3,"#8040d0"],
    [-52,-6,4,"#b070ff"],[-32,-8,3,"#a060ff"],[-12,-4,4,"#d090ff"],[8,-8,3,"#9050e0"],[30,-4,4,"#c080ff"],[52,-2,3,"#b070ff"],
    [-50,12,3,"#8040d0"],[-30,10,4,"#c080ff"],[-10,14,3,"#a060ff"],[10,10,4,"#d090ff"],[30,14,3,"#b070ff"],[50,12,4,"#9050e0"],
    [-46,28,4,"#c080ff"],[-26,26,3,"#a060ff"],[-6,30,4,"#d090ff"],[14,26,3,"#8050e0"],[34,28,4,"#b070ff"],
    [-36,44,3,"#9050e0"],[-16,42,4,"#c080ff"],[4,46,3,"#a060ff"],[24,44,4,"#d090ff"],[44,42,3,"#b070ff"],
  ];
  return (
    <g>
      <defs>
        <clipPath id="jcc-clip"><circle r={PR} /></clipPath>
        <radialGradient id="jcc-grad" cx="38%" cy="32%" r="72%">
          <stop offset="0%" stopColor="#2a1060" /><stop offset="40%" stopColor="#180840" />
          <stop offset="75%" stopColor="#0e0530" /><stop offset="100%" stopColor="#050218" />
        </radialGradient>
        <radialGradient id="jcc-glow" cx="50%" cy="50%" r="50%">
          <stop offset="60%" stopColor="#9040ff" stopOpacity="0" />
          <stop offset="100%" stopColor="#9040ff" stopOpacity="0.45" />
        </radialGradient>
      </defs>
      <circle r={PR} fill="url(#jcc-grad)" />
      <g clipPath="url(#jcc-clip)">
        {crystals.map(([x,y,r,color],i) => (
          <motion.circle key={i} cx={x} cy={y} r={r} fill={color} opacity={0.80}
            animate={{ opacity:[0.5,1.0,0.5], r:[r*0.8,r*1.2,r*0.8] }}
            transition={{ duration:1.8+(i%7)*0.3, repeat:Infinity, delay:(i%11)*0.18 }} />
        ))}
        <path d={`M 0 ${-PR} Q 30 0 0 ${PR}`} fill="none" stroke="#b070ff" strokeWidth={0.8} opacity={0.25} />
        <path d={`M 0 ${-PR} Q -30 0 0 ${PR}`} fill="none" stroke="#b070ff" strokeWidth={0.8} opacity={0.25} />
        <ellipse cx={0} cy={0} rx={PR*0.85} ry={PR*0.3} fill="none" stroke="#9050e0" strokeWidth={0.7} opacity={0.20} />
        <ellipse cx={20} cy={28} rx={42} ry={34} fill="#050218" opacity={0.42} />
      </g>
      <circle r={PR} fill="url(#jcc-glow)" />
      <circle r={PR} fill="none" stroke="#a060ff" strokeWidth={7} opacity={0.30} />
      <motion.g animate={{ rotate:[-360,0] }} transition={{ duration:20, repeat:Infinity, ease:"linear" }}
        style={{ transformOrigin:"0px 0px" }}>
        {[0,60,120,180,240,300].map((angle,i) => {
          const rad=(angle*Math.PI)/180;
          return <circle key={i} cx={(PR+20)*Math.cos(rad)} cy={9*Math.sin(rad)} r={3.5}
            fill={i%2===0?"#c080ff":"#8040d0"} opacity={0.75} />;
        })}
      </motion.g>
    </g>
  );
}

// ─── Planet types & nodes ────────────────────────────────────────────────────
type PlanetId = "tatooine"|"coruscant"|"dagobah"|"jedaicouncode";
type PlanetTier = "high"|"medium"|"low"|"all";
type PlanetData = { id: PlanetId; name: string; tier: PlanetTier; label: string; color: string };

const PLANETS: PlanetData[] = [
  { id:"tatooine",      name:"Tatooine",      tier:"high",   label:"Websites · Grand Masters",  color:"#f5c842" },
  { id:"coruscant",     name:"Coruscant",     tier:"medium", label:"SaaS Tools · Jedi Knights", color:"#818cf8" },
  { id:"dagobah",       name:"Dagobah",       tier:"low",    label:"Personal · Companions",      color:"#4ade80" },
  { id:"jedaicouncode", name:"Jedai Councode",tier:"all",    label:"The Council · All Systems",  color:"#c080ff" },
];

const PRIORITY_TO_PLANET: Record<string, PlanetId> = {
  high:"tatooine", medium:"coruscant", low:"dagobah",
};

function PlanetNode({ planet, pos, scale, onPtrDown, onPtrMove, onPtrUp, isDragging }: {
  planet: PlanetData; pos:{x:number;y:number}; scale:number;
  onPtrDown:(e:React.PointerEvent)=>void;
  onPtrMove:(e:React.PointerEvent)=>void;
  onPtrUp:(e:React.PointerEvent)=>void;
  isDragging:boolean;
}) {
  return (
    <g transform={`translate(${pos.x},${pos.y}) scale(${scale})`}
      style={{ cursor: isDragging?"grabbing":"grab" }}
      onPointerDown={onPtrDown} onPointerMove={onPtrMove} onPointerUp={onPtrUp}>
      <ellipse cx={0} cy={PR+12} rx={PR*0.85} ry={PR*0.20} fill="#000" opacity={0.45} />
      <motion.g animate={{ y:[-5,5,-5] }} transition={{ duration:7, repeat:Infinity, ease:"easeInOut" }}>
        {planet.id==="tatooine"      && <TatooineSurface />}
        {planet.id==="coruscant"     && <CoruscantSurface />}
        {planet.id==="dagobah"       && <DagobahSurface />}
        {planet.id==="jedaicouncode" && <JedaiCouncoseSurface />}
      </motion.g>
      <text y={PR+22} textAnchor="middle" fontSize={13} fill="#e2e8f0"
        fontFamily="var(--font-mono)" letterSpacing="1" fontWeight="bold">
        {planet.name.toUpperCase()}
      </text>
      <text y={PR+36} textAnchor="middle" fontSize={9} fill={planet.color}
        fontFamily="var(--font-mono)" letterSpacing="0.5" opacity={0.85}>
        {planet.label}
      </text>
    </g>
  );
}

function PlanetTether({ ax, ay, px, py, color }: { ax:number;ay:number;px:number;py:number;color:string }) {
  const mx=(ax+px)/2, my=(ay+py)/2-18;
  const d=`M ${ax} ${ay} Q ${mx} ${my} ${px} ${py}`;
  return (
    <motion.path d={d} fill="none" stroke={color} strokeWidth={0.8} opacity={0.22}
      strokeDasharray="5 8"
      animate={{ strokeDashoffset:[0,-130] }}
      transition={{ duration:3.5, repeat:Infinity, ease:"linear" }} />
  );
}

// ─── Tooltip ─────────────────────────────────────────────────────────────────
type TooltipState = { agent:AgentRecord; character:JediCharacter; x:number; y:number }|null;

// ─── Midichlorian panel ───────────────────────────────────────────────────────
function MidichlorianPanel({ agents, assignments, open, onClose }: {
  agents:AgentRecord[]; assignments:Map<string,JediCharacter>; open:boolean; onClose:()=>void;
}) {
  const sorted = [...agents].sort((a,b) => getMidichlorians(b)-getMidichlorians(a));
  const max = sorted.length>0 ? getMidichlorians(sorted[0]) : 1;
  return (
    <AnimatePresence>
      {open && (
        <motion.div className="midi-panel"
          initial={{ x:-340 }} animate={{ x:0 }} exit={{ x:-340 }}
          transition={{ type:"spring", stiffness:280, damping:32 }}>
          <div className="midi-header">
            <span className="midi-title">MIDICHLORIAN RANK</span>
            <button className="midi-close" onClick={onClose}>✕</button>
          </div>
          <div className="midi-subtitle">Token + context usage · ranked by The Force</div>
          <div className="midi-list">
            {sorted.map((agent, idx) => {
              const char = assignments.get(agent.id);
              const midi = getMidichlorians(agent);
              const pct  = midi/max;
              const sc   = STATUS_COLOR[agent.status];
              const tierColor = agent.priority==="high"?"#f5c842":agent.priority==="medium"?"#818cf8":"#4ade80";
              return (
                <div key={agent.id} className="midi-row">
                  <span className="midi-rank">#{idx+1}</span>
                  <div className="midi-info">
                    <div className="midi-agent-name">
                      <span className="midi-status-dot" style={{ background:sc }} />
                      {agent.name}
                    </div>
                    <div className="midi-char-label" style={{ color:char?.color??tierColor }}>
                      {char?.name??"—"} · {agent.priority.toUpperCase()}
                    </div>
                    <div className="midi-bar-wrap">
                      <motion.div className="midi-bar" style={{ background:tierColor }}
                        initial={{ width:0 }}
                        animate={{ width:`${pct*100}%` }}
                        transition={{ delay:idx*0.04, duration:0.6, ease:"easeOut" }} />
                    </div>
                    <div className="midi-count">{midi.toLocaleString()} M-count</div>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Status Panel ────────────────────────────────────────────────────────────
function StatusPanel({ status, agents, assignments, onSelectAgent, onClose }: {
  status: "active"|"idle"|"error";
  agents: AgentRecord[];
  assignments: Map<string,JediCharacter>;
  onSelectAgent: (agent:AgentRecord, char:JediCharacter) => void;
  onClose: () => void;
}) {
  const filtered = agents.filter(a => a.status === status);
  const now = Date.now();

  function elapsed(iso: string) {
    const ms = now - new Date(iso).getTime();
    const m = Math.floor(ms / 60000);
    const h = Math.floor(m / 60);
    if (h > 0) return `${h}h ${m % 60}m`;
    if (m > 0) return `${m}m`;
    return "<1m";
  }

  const label = status === "active" ? "RUNNING MISSIONS"
    : status === "idle" ? "AGENTS ON STANDBY"
    : "CRITICAL ALERTS";
  const accent = status === "active" ? "#4ade80"
    : status === "idle" ? "#94a3b8"
    : "#ef4444";

  return (
    <motion.div className="status-panel"
      initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.18 }}
      style={{ "--status-accent": accent } as React.CSSProperties}>
      <div className="status-panel-header">
        <span className="status-panel-title" style={{ color: accent }}>{label}</span>
        <span className="status-panel-count">{filtered.length} agent{filtered.length !== 1 ? "s" : ""}</span>
        <button className="status-panel-close" onClick={onClose}>✕</button>
      </div>
      <div className="status-panel-list">
        {filtered.length === 0 && (
          <div className="status-panel-empty">No agents in this state.</div>
        )}
        {filtered.map(agent => {
          const char = assignments.get(agent.id);
          return (
            <div key={agent.id} className="status-panel-row"
              onClick={() => char && onSelectAgent(agent, char)}>
              <div className="status-panel-row-left">
                <span className="status-panel-char" style={{ color: char?.color ?? accent }}>
                  {char?.name ?? "—"}
                </span>
                <span className="status-panel-name">{agent.name}</span>
              </div>
              <div className="status-panel-row-right">
                {status === "active" && agent.task && (
                  <span className="status-panel-task">{agent.task.slice(0, 55)}{agent.task.length > 55 ? "…" : ""}</span>
                )}
                {status === "idle" && (
                  <span className="status-panel-meta">idle {elapsed(agent.startedAt)} · waiting for orders</span>
                )}
                {status === "error" && (
                  <span className="status-panel-error">
                    {agent.task ? agent.task.slice(0, 55) : "Unknown error — agent needs reassignment"}
                  </span>
                )}
              </div>
              <div className="status-panel-action">
                {status === "idle"  && <span className="status-panel-btn">DISPATCH →</span>}
                {status === "error" && <span className="status-panel-btn err">REASSIGN →</span>}
                {status === "active" && <span className="status-panel-btn active">VIEW →</span>}
              </div>
            </div>
          );
        })}
      </div>
      {status === "idle" && filtered.length > 0 && (
        <div className="status-panel-footer">
          Click any standby agent to assign a mission
        </div>
      )}
      {status === "error" && filtered.length > 0 && (
        <div className="status-panel-footer err">
          Critical agents need reassignment — click to open their command panel
        </div>
      )}
    </motion.div>
  );
}

// ─── Mission Briefing (first-visit overlay) ──────────────────────────────────
function MissionBriefing({ onDismiss }: { onDismiss: () => void }) {
  return (
    <motion.div className="briefing-overlay"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onDismiss}>
      <motion.div className="briefing-card"
        initial={{ y: 28, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.12, type: "spring", stiffness: 260, damping: 28 }}
        onClick={e => e.stopPropagation()}>
        <div className="briefing-header">
          <div className="briefing-icon">⚔</div>
          <div className="briefing-title">JEDI COUNCIL</div>
          <div className="briefing-sub">Autonomous Agent Network · Coruscant Division</div>
        </div>
        <div className="briefing-body">
          <p className="briefing-desc">
            Each figure in the chamber is a <strong>live AI agent</strong> running a real task.
            Status rings pulse when active. Planets indicate mission tier.
          </p>
          <div className="briefing-tiers">
            <div className="briefing-tier">
              <span className="briefing-tier-dots" style={{ color:"#f5c842" }}>●●●</span>
              <strong>Tatooine</strong> — High priority · Websites &amp; Grand Masters
            </div>
            <div className="briefing-tier">
              <span className="briefing-tier-dots" style={{ color:"#818cf8" }}>●●</span>
              <strong>Coruscant</strong> — Medium priority · SaaS Tools
            </div>
            <div className="briefing-tier">
              <span className="briefing-tier-dots" style={{ color:"#4ade80" }}>●</span>
              <strong>Dagobah</strong> — Low priority · Personal &amp; Experimental
            </div>
            <div className="briefing-tier">
              <span className="briefing-tier-dots" style={{ color:"#c080ff" }}>✦</span>
              <strong>Jedai Councode</strong> — The Council · All Systems
            </div>
          </div>
          <p className="briefing-hint">
            <strong>Click</strong> any agent to assign a mission · <strong>Drag</strong> to reposition · <strong>⚡ MIDI</strong> ranks by Force strength
          </p>
        </div>
        <button className="briefing-cta" onClick={onDismiss}>ENTER THE COUNCIL →</button>
      </motion.div>
    </motion.div>
  );
}

// ─── Agent assign drawer ──────────────────────────────────────────────────────
function AgentDrawer({ agent, character, onClose, onDispatch }: {
  agent: AgentRecord;
  character: JediCharacter;
  onClose: () => void;
  onDispatch: (agentId: string, task: string) => Promise<void>;
}) {
  const [taskInput, setTaskInput] = useState("");
  const [sending, setSending]     = useState(false);
  const [sent,    setSent]        = useState(false);
  const wp = WEAPON_MAP[character.id] ?? { color: character.color, type: "saber" as WeaponType };

  async function handleDispatch() {
    if (!taskInput.trim()) return;
    setSending(true);
    await onDispatch(agent.id, taskInput.trim());
    setSending(false);
    setSent(true);
    setTimeout(() => { setSent(false); setTaskInput(""); }, 2200);
  }

  return (
    <motion.div className="agent-drawer"
      initial={{ x: 380 }} animate={{ x: 0 }} exit={{ x: 380 }}
      transition={{ type: "spring", stiffness: 280, damping: 32 }}>
      <div className="drawer-header">
        <div className="drawer-identity">
          <span className="drawer-char-name" style={{ color: character.color }}>
            {character.name.toUpperCase()}
          </span>
          <span className="drawer-agent-name">/ {agent.name}</span>
        </div>
        <button className="midi-close" onClick={onClose}>✕</button>
      </div>

      <div className="drawer-status-row">
        <span className="drawer-status-dot" style={{ background: STATUS_COLOR[agent.status] }} />
        <span className="drawer-status-label" style={{ color: STATUS_COLOR[agent.status] }}>
          {agent.status.toUpperCase()}
        </span>
        <span className="drawer-priority-badge">
          {agent.priority.toUpperCase()} · {wp.type.toUpperCase()}
        </span>
      </div>

      {agent.task && (
        <div className="drawer-section">
          <div className="drawer-section-label">CURRENT MISSION</div>
          <div className="drawer-current-task">{agent.task}</div>
        </div>
      )}

      <div className="drawer-section drawer-assign-section">
        <div className="drawer-section-label">TRANSMIT NEW ORDERS</div>
        <textarea
          className="drawer-textarea"
          placeholder={`Give ${character.name} a mission…`}
          value={taskInput}
          onChange={e => setTaskInput(e.target.value)}
          rows={4}
          onKeyDown={e => { if (e.key === "Enter" && e.metaKey) handleDispatch(); }}
        />
        <button
          className={`drawer-dispatch-btn${sent ? " sent" : ""}`}
          onClick={handleDispatch}
          disabled={sending || sent || !taskInput.trim()}>
          {sent ? "✓ MISSION TRANSMITTED" : sending ? "TRANSMITTING…" : `⚡ DISPATCH ${character.name.toUpperCase()}`}
        </button>
        <div className="drawer-hint">⌘ + Enter to send</div>
      </div>

      <div className="drawer-footer">
        <div className="drawer-weapon-row">
          <span className="drawer-weapon-label">WEAPON</span>
          <span className="drawer-weapon-val" style={{ color: wp.color }}>
            {wp.type.toUpperCase()}
          </span>
        </div>
        <div className="drawer-weapon-row">
          <span className="drawer-weapon-label">TIER</span>
          <span className="drawer-weapon-val" style={{ color: agent.priority==="high"?"#f5c842":agent.priority==="medium"?"#818cf8":"#4ade80" }}>
            {agent.priority==="high"?"TATOOINE":agent.priority==="medium"?"CORUSCANT":"DAGOBAH"}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Completion event tracking ────────────────────────────────────────────────
type CompletionEvent = {
  id: string;         // unique event id
  agentId: string;
  charId: string;
  pos: {x:number;y:number};
  nextPos: {x:number;y:number}|null;
  weaponType: WeaponType;
  weaponColor: string;
  agentName: string;
};

// ─── Default planet positions ─────────────────────────────────────────────────
const planetDefaultPos: Record<PlanetId, {x:number;y:number}> = {
  tatooine:      { x: FCX-205, y: FCY+55  },
  coruscant:     { x: FCX-65,  y: FCY-70  },
  dagobah:       { x: FCX+165, y: FCY+55  },
  jedaicouncode: { x: FCX+80,  y: FCY-50  },
};

// ─── Main component ───────────────────────────────────────────────────────────
export default function JediChamber() {
  const [agents,      setAgents]      = useState<AgentRecord[]>([]);
  const [useMock,     setUseMock]     = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date|null>(null);
  const [tooltip,     setTooltip]     = useState<TooltipState>(null);
  const [assignments, setAssignments] = useState<Map<string,JediCharacter>>(new Map());
  const [pulseKey,    setPulseKey]    = useState(0);
  const [dragId,      setDragId]      = useState<string|null>(null);
  const [midiOpen,    setMidiOpen]    = useState(false);
  const [showBriefing, setShowBriefing] = useState(() => {
    if (typeof window === "undefined") return false;
    return !localStorage.getItem("jedi-briefing-seen");
  });
  const [assignDrawer, setAssignDrawer] = useState<{agent:AgentRecord;char:JediCharacter}|null>(null);
  const [statusPanel,  setStatusPanel]  = useState<"active"|"idle"|"error"|null>(null);
  const [dynVW, setDynVW] = useState(() => {
    if (typeof window === "undefined") return BASE_VW;
    // topbar ≈56px, legend ≈38px
    const h = window.innerHeight - 94;
    return h > 0 ? Math.round(BASE_VW * window.innerWidth / h) : BASE_VW;
  });
  const [completions, setCompletions] = useState<CompletionEvent[]>([]);

  const [posOverrides, setPosOverrides] = useState<Map<string,{x:number;y:number}>>(() => {
    if (typeof window==="undefined") return new Map();
    try { const s=localStorage.getItem("jedi-pos-v3"); if(s) return new Map(JSON.parse(s)); } catch {}
    return new Map();
  });
  useEffect(() => {
    localStorage.setItem("jedi-pos-v3", JSON.stringify([...posOverrides.entries()]));
  }, [posOverrides]);

  const svgRef   = useRef<SVGSVGElement>(null);
  const wrapRef  = useRef<HTMLDivElement>(null);
  const dragRef  = useRef<{id:string;ox:number;oy:number;moved:boolean}|null>(null);
  const prevStatusRef = useRef<Map<string,string>>(new Map());
  const eventIdRef    = useRef(0);

  // ── Full-bleed: measure container, compute dynamic viewBox width ───────────
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(entries => {
      const { width, height } = entries[0].contentRect;
      if (height > 0) setDynVW(Math.round(BASE_VW * width / height));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const offset = Math.max(0, (dynVW - BASE_VW) / 2);
  const viewBox = `${-offset} 0 ${dynVW} ${VH}`;

  // ── Fetch agents & detect completions ─────────────────────────────────────
  const fetchAgents = useCallback(async () => {
    try {
      const res  = await fetch(`/api/agents${useMock?"?mock=true":""}`);
      const data: AgentRecord[] = await res.json();
      resetCharacterAssignments();
      const map = new Map<string,JediCharacter>();
      for (const a of data) map.set(a.id, assignCharacter(a.id, a.priority));

      // detect status transitions → completed
      const newEvents: CompletionEvent[] = [];
      for (const a of data) {
        const prev = prevStatusRef.current.get(a.id);
        if (prev && prev !== "completed" && a.status === "completed") {
          const char = map.get(a.id);
          const wp = char ? (WEAPON_MAP[char.id] ?? { color: char.color, type: "saber" as WeaponType }) : { color: "#60a5fa", type: "saber" as WeaponType };
          newEvents.push({
            id: String(++eventIdRef.current),
            agentId: a.id,
            charId: char?.id ?? "",
            pos: { x: FCX, y: FCY }, // will be resolved during render
            nextPos: null,
            weaponType: wp.type,
            weaponColor: wp.color,
            agentName: a.name,
          });
        }
        prevStatusRef.current.set(a.id, a.status);
      }

      setAgents(data);
      setAssignments(map);
      setLastRefresh(new Date());
      setPulseKey(k => k+1);
      if (newEvents.length) {
        setCompletions(prev => [...prev, ...newEvents]);
        setTimeout(() => {
          setCompletions(prev => prev.filter(e => !newEvents.find(n => n.id === e.id)));
        }, 3500);
      }
    } catch(e) { console.error("fetch agents failed", e); }
  }, [useMock]);

  useEffect(() => { fetchAgents(); const t=setInterval(fetchAgents,5000); return ()=>clearInterval(t); }, [fetchAgents]);

  // ── Positions ─────────────────────────────────────────────────────────────
  const seated = agents.slice(0, MAX_SEATS);
  const agentPos = new Map<string,{x:number;y:number}>();
  seated.forEach((a,i) => { agentPos.set(a.id, posOverrides.get(a.id)??seatPos(i)); });

  const planetPos = (p: PlanetData) => posOverrides.get("planet-"+p.id)??planetDefaultPos[p.id];

  const beams: Array<[string,string]> = [];
  const seenB = new Set<string>();
  for (const a of seated) {
    for (const cid of a.connections) {
      const key=[a.id,cid].sort().join("--");
      if (!seenB.has(key)&&agentPos.has(cid)) { seenB.add(key); beams.push([a.id,cid]); }
    }
  }

  const seatedSorted = [...seated].sort((a,b) => (agentPos.get(a.id)?.y??0)-(agentPos.get(b.id)?.y??0));

  // ── Drag helpers ───────────────────────────────────────────────────────────
  function startDrag(e: React.PointerEvent, id: string, curPos:{x:number;y:number}) {
    e.stopPropagation();
    const svg=svgRef.current; if(!svg) return;
    (e.currentTarget as SVGElement).setPointerCapture(e.pointerId);
    const p=getSvgPt(e,svg);
    dragRef.current={id, ox:p.x-curPos.x, oy:p.y-curPos.y, moved:false};
    setDragId(id); setTooltip(null);
  }
  function moveDrag(e: React.PointerEvent, id: string) {
    const d=dragRef.current; if(!d||d.id!==id) return;
    const svg=svgRef.current; if(!svg) return;
    const p=getSvgPt(e,svg);
    const nx=p.x-d.ox, ny=p.y-d.oy;
    const prev=posOverrides.get(id);
    if(prev && (Math.abs(nx-prev.x)>4||Math.abs(ny-prev.y)>4)) d.moved=true;
    else if(!prev) d.moved=true;
    setPosOverrides(prev => { const m=new Map(prev); m.set(id,{x:nx,y:ny}); return m; });
  }
  function endDrag(id: string) {
    if(dragRef.current?.id===id) { dragRef.current=null; setDragId(null); }
  }
  function handleAgentClick(agent: AgentRecord, char: JediCharacter) {
    if(dragRef.current?.moved) return; // was a drag, not a tap
    setAssignDrawer({agent, char});
  }

  // ── Task dispatch ──────────────────────────────────────────────────────────
  async function dispatchTask(agentId: string, task: string) {
    try {
      await fetch(`/api/agents/${agentId}/task`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ task }),
      });
    } catch { /* no-op — mock mode, fire-and-forget */ }
  }

  // ── Briefing dismiss ───────────────────────────────────────────────────────
  function dismissBriefing() {
    localStorage.setItem("jedi-briefing-seen", "1");
    setShowBriefing(false);
  }
  useEffect(() => {
    if (!showBriefing) return;
    const t = setTimeout(dismissBriefing, 12000);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showBriefing]);

  const totalMidi = agents.reduce((s,a) => s+getMidichlorians(a), 0);

  // Find next active agent for handoff beam
  function findNextActive(fromId: string): {x:number;y:number}|null {
    const idx = seated.findIndex(a => a.id===fromId);
    for (let i=1; i<seated.length; i++) {
      const a = seated[(idx+i)%seated.length];
      if (a.status==="active") return agentPos.get(a.id)??null;
    }
    return null;
  }

  return (
    <div className="chamber-root">

      {/* ── Topbar ── */}
      <div className="topbar">
        <div className="topbar-left">
          <button className="midi-toggle-btn" onClick={()=>setMidiOpen(o=>!o)} title="Midichlorian Rankings">
            ⚡ MIDI
          </button>
          <span className="topbar-divider" />
          <span className="topbar-title">JEDI COUNCIL</span>
          <span className="topbar-sub">Autonomous Agent Network</span>
        </div>
        <div className="topbar-right">
          <button className={`topbar-stat topbar-stat-btn${statusPanel==="active"?" sp-active":""}`}
            onClick={()=>setStatusPanel(p=>p==="active"?null:"active")}>
            <span className="stat-dot active-dot" />{agents.filter(a=>a.status==="active").length} running
          </button>
          <button className={`topbar-stat topbar-stat-btn${statusPanel==="idle"?" sp-active":""}`}
            onClick={()=>setStatusPanel(p=>p==="idle"?null:"idle")}>
            <span className="stat-dot idle-dot" />{agents.filter(a=>a.status==="idle").length} standby
          </button>
          {agents.filter(a=>a.status==="error").length>0 && (
            <button className={`topbar-stat topbar-stat-btn error-stat${statusPanel==="error"?" sp-active":""}`}
              onClick={()=>setStatusPanel(p=>p==="error"?null:"error")}>
              <span className="stat-dot error-dot" />{agents.filter(a=>a.status==="error").length} critical
            </button>
          )}
          <span className="topbar-midi-count" title="Network midichlorian count">
            ⚡ {(totalMidi/1000).toFixed(0)}k M
          </span>
          <span className="topbar-divider" />
          <button className="reset-btn" onClick={()=>setPosOverrides(new Map())}>Reset Layout</button>
          <button className={`mode-toggle ${useMock?"mock-active":"live-active"}`} onClick={()=>setUseMock(m=>!m)}>
            {useMock?"◈ HOLOGRAM":"⬟ LIVE FEED"}
          </button>
          <button className="refresh-btn" onClick={fetchAgents} title="Sync agents">
            <span key={pulseKey} className="refresh-icon">⟳</span>
          </button>
          {lastRefresh && (
            <span className="topbar-time">
              {lastRefresh.toLocaleTimeString([],{hour:"2-digit",minute:"2-digit",second:"2-digit"})}
            </span>
          )}
        </div>
      </div>

      {/* ── Main area (+ floating status panel) ── */}
      <div ref={wrapRef} className="chamber-wrap" style={{ position:"relative" }}>
        {/* Status panel floats over the chamber below the topbar */}
        <div className="status-panel-anchor">
          <AnimatePresence>
            {statusPanel && (
              <StatusPanel
                status={statusPanel}
                agents={agents}
                assignments={assignments}
                onSelectAgent={(agent, char) => { setAssignDrawer({agent, char}); setStatusPanel(null); }}
                onClose={() => setStatusPanel(null)}
              />
            )}
          </AnimatePresence>
        </div>

        <AnimatePresence>
          {showBriefing && <MissionBriefing onDismiss={dismissBriefing} />}
        </AnimatePresence>

        <MidichlorianPanel agents={agents} assignments={assignments} open={midiOpen} onClose={()=>setMidiOpen(false)} />

        <AnimatePresence>
          {assignDrawer && (
            <AgentDrawer
              agent={assignDrawer.agent}
              character={assignDrawer.char}
              onClose={()=>setAssignDrawer(null)}
              onDispatch={dispatchTask}
            />
          )}
        </AnimatePresence>

        <svg ref={svgRef} viewBox={viewBox} className="chamber-svg"
          preserveAspectRatio="xMidYMid meet"
          style={{ display:"block", width:"100%", height:"100%" }}>

          <ChamberRoom offset={offset} totalW={dynVW} />

          {/* Empty pedestals */}
          {Array.from({length:MAX_SEATS},(_,i) => {
            if(i<seated.length) return null;
            const p=seatPos(i); const s=depthScale(p.y);
            return <ellipse key={`emp-${i}`} cx={p.x} cy={p.y} rx={20*s} ry={10*s}
              fill="#141c2a" stroke="#1e2840" strokeWidth={1} opacity={0.45} />;
          })}

          {/* Force beams */}
          {beams.map(([aId,bId]) => {
            const a=agentPos.get(aId)!, b=agentPos.get(bId)!;
            return <ForceBeam key={`${aId}-${bId}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y} />;
          })}

          {/* Planet tethers */}
          {seated.map(agent => {
            const pid=PRIORITY_TO_PLANET[agent.priority];
            const planet=PLANETS.find(p=>p.id===pid);
            if(!planet) return null;
            const ap=agentPos.get(agent.id); const pp=planetPos(planet);
            if(!ap) return null;
            return <PlanetTether key={`tether-${agent.id}`} ax={ap.x} ay={ap.y} px={pp.x} py={pp.y} color={planet.color} />;
          })}

          {/* Handoff beams for recent completions */}
          {completions.map(ev => {
            const from = agentPos.get(ev.agentId);
            const to   = findNextActive(ev.agentId);
            if(!from||!to) return null;
            return <HandoffBeam key={`hb-${ev.id}`} x1={from.x} y1={from.y} x2={to.x} y2={to.y} color={ev.weaponColor} />;
          })}

          {/* Holographic emblem */}
          <motion.g animate={{rotate:360}} transition={{duration:80,repeat:Infinity,ease:"linear"}}
            style={{transformOrigin:`${FCX}px ${FCY}px`}}>
            <JediEmblem />
          </motion.g>
          <JediEmblem />
          <motion.ellipse cx={FCX} cy={FCY} rx={10} ry={5} fill="#c8a84b" opacity={0.5}
            animate={{rx:[8,16,8],ry:[4,8,4],opacity:[0.5,0.15,0.5]}}
            transition={{duration:3.4,repeat:Infinity}} />

          {/* ── Agents ── */}
          {seatedSorted.map(agent => {
            const char=assignments.get(agent.id); if(!char) return null;
            const pos=agentPos.get(agent.id)!;
            const s=depthScale(pos.y);
            const sc=STATUS_COLOR[agent.status];
            const isErr=agent.status==="error";
            const isIdle=agent.status==="idle";
            const isDrg=dragId===agent.id;
            const seatR=32*s;
            const wp=WEAPON_MAP[char.id]??{color:char.color,type:"saber"as WeaponType};
            const justCompleted=completions.some(e=>e.agentId===agent.id);

            return (
              <g key={agent.id} transform={`translate(${pos.x},${pos.y})`}
                style={{ cursor:isDrg?"grabbing":"grab" }}
                onPointerDown={e=>startDrag(e,agent.id,pos)}
                onPointerMove={e=>moveDrag(e,agent.id)}
                onPointerUp={()=>endDrag(agent.id)}
                onClick={()=>handleAgentClick(agent,char)}
                onMouseEnter={e=>{ if(!dragRef.current) setTooltip({agent,character:char,x:e.clientX,y:e.clientY}); }}
                onMouseMove={e =>{ if(!dragRef.current) setTooltip(t=>t?{...t,x:e.clientX,y:e.clientY}:null); }}
                onMouseLeave={()=>{ if(!dragRef.current) setTooltip(null); }}>

                {/* Transparent hit area for reliable pointer events */}
                <rect x={-seatR-12} y={-seatR-28} width={(seatR+12)*2} height={seatR*2+52} fill="transparent" />
                <ellipse cx={0} cy={seatR*0.55} rx={seatR*1.05} ry={seatR*0.38} fill="#05070c" opacity={0.45*s} />
                <motion.circle r={seatR+5*s} fill={sc} opacity={0.08}
                  stroke={sc} strokeWidth={1.8*s}
                  animate={agent.status==="active"||agent.status==="error"
                    ?{r:[seatR+4*s,seatR+10*s,seatR+4*s],opacity:[0.08,0.22,0.08]}
                    :{opacity:0.04}}
                  transition={{duration:isErr?1.1:2.6,repeat:Infinity}}
                  style={isErr?{filter:"drop-shadow(0 0 10px #ef4444)"}:{}} />
                <circle r={seatR} fill="#0f1422" stroke={char.color} strokeWidth={1.5*s} strokeOpacity={0.6} />
                <foreignObject x={-seatR*0.88} y={-seatR*0.88} width={seatR*1.76} height={seatR*1.76}
                  style={{pointerEvents:"none",overflow:"visible"}}>
                  {/* @ts-expect-error xmlns needed */}
                  <div xmlns="http://www.w3.org/1999/xhtml"
                    style={{width:"100%",height:"100%",display:"flex",alignItems:"center",justifyContent:"center"}}>
                    <CharacterSilhouette characterId={char.id} color={char.color} size={seatR*1.6} />
                  </div>
                </foreignObject>

                {/* Weapon flash on completion */}
                {justCompleted && (
                  <WeaponFlash type={wp.type} color={wp.color} r={seatR} />
                )}
                {/* Completion toast */}
                {justCompleted && (
                  <g transform={`translate(0,${-seatR-30})`}>
                    <CompletionToast label={agent.name} />
                  </g>
                )}

                {isIdle && (
                  <motion.g animate={{y:[-4,4,-4],rotate:[0,360]}}
                    transition={{duration:3.8,repeat:Infinity,ease:"easeInOut"}}
                    style={{transformOrigin:`0px ${-seatR-14}px`}}>
                    <polygon points={`0,${-seatR-22} 7,${-seatR-14} 0,${-seatR-6} -7,${-seatR-14}`}
                      fill="#94a3b8" opacity={0.55} />
                  </motion.g>
                )}

                <text y={seatR+14*s} textAnchor="middle"
                  fontSize={9*Math.max(0.8,s)} fill="#cbd5e1"
                  fontFamily="var(--font-mono)" letterSpacing="0.4"
                  style={{pointerEvents:"none",userSelect:"none"}}>
                  {agent.name.length>17?agent.name.slice(0,16)+"…":agent.name}
                </text>
                {agent.priority==="high" && (
                  <g transform={`translate(0,${seatR+24*s})`}>
                    {[-6,0,6].map(dx=><circle key={dx} cx={dx*s} cy={0} r={2*s} fill={char.color} opacity={0.82}/>)}
                  </g>
                )}
                {agent.priority==="medium" && (
                  <g transform={`translate(0,${seatR+24*s})`}>
                    {[-4,4].map(dx=><circle key={dx} cx={dx*s} cy={0} r={2*s} fill={char.color} opacity={0.62}/>)}
                  </g>
                )}
                {agent.priority==="low" && (
                  <circle cx={0} cy={seatR+24*s} r={2*s} fill={char.color} opacity={0.42} />
                )}
              </g>
            );
          })}

          {/* ── Planet nodes ── */}
          {PLANETS.map(p => {
            const pos=planetPos(p); const s=depthScale(pos.y); const pid="planet-"+p.id;
            return <PlanetNode key={p.id} planet={p} pos={pos} scale={s}
              isDragging={dragId===pid}
              onPtrDown={e=>startDrag(e,pid,pos)}
              onPtrMove={e=>moveDrag(e,pid)}
              onPtrUp={()=>endDrag(pid)} />;
          })}
        </svg>

        {tooltip && (
          <AgentTooltip agent={tooltip.agent} character={tooltip.character}
            visible x={tooltip.x} y={tooltip.y} />
        )}
      </div>

      {/* ── Task ticker ── */}
      {agents.some(a=>a.status==="active"&&a.task) && (
        <div className="task-ticker">
          <span className="task-ticker-label">ACTIVE MISSIONS</span>
          <div className="task-ticker-track">
            {agents.filter(a=>a.status==="active"&&a.task).map(a=>{
              const char=assignments.get(a.id);
              return (
                <span key={a.id} className="task-ticker-item"
                  onClick={()=>{ if(char) setAssignDrawer({agent:a,char}); }}>
                  <span className="task-ticker-dot" style={{background:char?.color??"#4ade80"}} />
                  <strong>{char?.name??a.name}</strong>
                  <span className="task-ticker-task">{a.task?.slice(0,70)}{(a.task?.length??0)>70?"…":""}</span>
                  <span className="task-ticker-sep">·</span>
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Legend ── */}
      <div className="legend">
        <div className="legend-group"><span className="legend-dot" style={{background:"#4ade80"}}/>Running</div>
        <div className="legend-group"><span className="legend-dot" style={{background:"#94a3b8"}}/>Standby</div>
        <div className="legend-group"><span className="legend-dot" style={{background:"#ef4444"}}/>Critical</div>
        <div className="legend-group"><span className="legend-dot" style={{background:"#60a5fa"}}/>Done</div>
        <span className="legend-divider"/>
        <div className="legend-group"><span className="priority-dots">●●●</span>Websites → Tatooine</div>
        <div className="legend-group"><span className="priority-dots">●●</span>SaaS → Coruscant</div>
        <div className="legend-group"><span className="priority-dots">●</span>Personal → Dagobah</div>
        <div className="legend-group"><span style={{color:"#c080ff"}}>✦</span>Jedai Councode</div>
        <span className="legend-divider"/>
        <div className="legend-group" style={{color:"var(--text-dim)",fontSize:10}}>
          ◈ Drag agents or planets · ⚡ MIDI for Force rankings
        </div>
      </div>
    </div>
  );
}
