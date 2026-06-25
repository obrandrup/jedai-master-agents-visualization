"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { AgentRecord, JediCharacter } from "@/lib/types";
import { assignCharacter, resetCharacterAssignments } from "@/lib/characters";
import { CharacterSilhouette } from "./CharacterSilhouette";
import { AgentTooltip } from "./AgentTooltip";

// ─── Layout constants ──────────────────────────────────────────────────────
const VW = 1000, VH = 1000;
const FCX = 500, FCY = 638;
const FRX = 455, FRY = 222;
const SRX = 358, SRY = 175;
const MAX_SEATS = 24;
const PR = 68; // planet base radius

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
  const base = agent.status === "active" ? 14000
    : agent.status === "idle" ? 5000
    : agent.status === "error" ? 9500
    : 2200;
  const prio = agent.priority === "high" ? 1.6 : agent.priority === "medium" ? 1.1 : 0.75;
  return Math.round(base * prio * (1 + hours * 0.08));
}

// ─── Chamber background ─────────────────────────────────────────────────────
function ChamberRoom() {
  const buildings: [number, number, number][] = [
    [22,388,52],[82,418,38],[135,380,62],[212,402,48],[270,372,72],
    [358,398,40],[412,376,58],[488,402,36],[542,380,84],[638,394,46],
    [697,374,64],[778,402,36],[828,378,74],[916,400,50],[978,394,20],
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
      <rect width={VW} height={VH} fill="#030508" />
      <rect width={VW} height={660} fill="url(#skyG)" />
      <ellipse cx={FCX} cy={330} rx={520} ry={200} fill="#c07828" opacity={0.07} />
      {buildings.map(([x, y, w], i) => (
        <rect key={i} x={x} y={y} width={w} height={VH - y}
          fill={`hsl(${215+i*4},20%,${9+(i%3)*3}%)`} opacity={0.88} />
      ))}
      {Array.from({ length: 60 }, (_, i) => (
        <rect key={`wl${i}`}
          x={28 + (i * 163) % 944} y={388 + (i * 47) % 185}
          width={3} height={4} fill={`hsl(${38+(i%28)},72%,62%)`}
          opacity={i % 4 === 0 ? 0.82 : 0.20} />
      ))}
      {[32, 58, 84].map(y => (
        <line key={y} x1={0} y1={y} x2={VW} y2={y} stroke="#18202e" strokeWidth={3.5} />
      ))}
      {Array.from({ length: 13 }, (_, i) => (
        <g key={`lat${i}`}>
          <line x1={i*85} y1={0} x2={i*85+75} y2={92} stroke="#14192a" strokeWidth={2.5} opacity={0.85} />
          <line x1={i*85+75} y1={0} x2={i*85} y2={92} stroke="#14192a" strokeWidth={2.5} opacity={0.85} />
        </g>
      ))}
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
      <path d={`M 0 0 L ${PILLARS[0].x-14} 0 L ${PILLARS[0].x-14} ${PILLARS[0].py} Q 28 ${FCY-FRY+40} 0 ${FCY+10} Z`}
        fill="url(#stoneG)" />
      <path d={`M ${VW} 0 L ${PILLARS[8].x+14} 0 L ${PILLARS[8].x+14} ${PILLARS[8].py} Q 972 ${FCY-FRY+40} ${VW} ${FCY+10} Z`}
        fill="url(#stoneG)" />
      {PILLARS.map((p, i) => {
        const w = i===0||i===8 ? 36 : i===1||i===7 ? 32 : i===2||i===6 ? 29 : 26;
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
  const mx = (x1+x2)/2 + (FCX-(x1+x2)/2)*0.22;
  const my = (y1+y2)/2 + (FCY-(y1+y2)/2)*0.22;
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

// ─── Planet surfaces ────────────────────────────────────────────────────────
function TatooineSurface() {
  return (
    <g>
      <defs>
        <clipPath id="tat-clip"><circle r={PR} /></clipPath>
        <radialGradient id="tat-grad" cx="35%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#f5e080" />
          <stop offset="30%" stopColor="#e09040" />
          <stop offset="65%" stopColor="#c86820" />
          <stop offset="100%" stopColor="#6a2e08" />
        </radialGradient>
      </defs>
      <circle r={PR} fill="url(#tat-grad)" />
      <g clipPath="url(#tat-clip)">
        <ellipse cx={0} cy={-16} rx={PR*0.9} ry={9} fill="#c87030" opacity={0.38} />
        <ellipse cx={4}  cy={0}  rx={PR*0.85} ry={7} fill="#b86020" opacity={0.32} />
        <ellipse cx={-4} cy={15} rx={PR*0.8}  ry={8} fill="#c87840" opacity={0.30} />
        <ellipse cx={0}  cy={30} rx={PR*0.7}  ry={10} fill="#a05010" opacity={0.35} />
        <path d="M -40 -8 Q -20 0 0 -4 Q 22 -8 44 0" fill="none" stroke="#7a3a08" strokeWidth={2.5} opacity={0.55} />
        <path d="M -50 14 Q -25 8 0 13 Q 26 18 52 10" fill="none" stroke="#8a4810" strokeWidth={2} opacity={0.45} />
        <path d="M -35 28 Q -10 22 15 27 Q 35 32 50 24" fill="none" stroke="#904a10" strokeWidth={1.8} opacity={0.38} />
        <ellipse cx={-16} cy={-32} rx={24} ry={9} fill="#f5e090" opacity={0.28} />
        <ellipse cx={20}  cy={-38} rx={16} ry={6} fill="#f5e090" opacity={0.22} />
        <ellipse cx={26} cy={24} rx={38} ry={32} fill="#60280a" opacity={0.32} />
        <ellipse cx={-30} cy={22} rx={20} ry={14} fill="#9a4a10" opacity={0.18} />
      </g>
      <circle r={PR} fill="none" stroke="#f5c842" strokeWidth={6} opacity={0.22} />
      <circle r={PR+8} fill="none" stroke="#f0a020" strokeWidth={3} opacity={0.08} />
      {/* Twin suns orbiting */}
      <motion.g animate={{ rotate: 360 }}
        transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
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
          <stop offset="0%" stopColor="#1e2848" />
          <stop offset="55%" stopColor="#111830" />
          <stop offset="100%" stopColor="#070c1c" />
        </radialGradient>
        <radialGradient id="cor-atm" cx="50%" cy="50%" r="50%">
          <stop offset="65%" stopColor="#e07030" stopOpacity="0" />
          <stop offset="100%" stopColor="#e07030" stopOpacity="0.35" />
        </radialGradient>
      </defs>
      <circle r={PR} fill="url(#cor-grad)" />
      <g clipPath="url(#cor-clip)">
        {lights.map(([x, y, r], i) => (
          <motion.circle key={i} cx={x} cy={y} r={r}
            fill={i%3===0 ? "#ffa030" : i%3===1 ? "#ffcc60" : "#6ab0ff"}
            opacity={0.75}
            animate={{ opacity: [0.45, 1.0, 0.45] }}
            transition={{ duration: 1.4+(i%5)*0.35, repeat: Infinity, delay: (i%9)*0.15 }} />
        ))}
        <ellipse cx={0} cy={0} rx={PR} ry={10} fill="#f08020" opacity={0.07} />
        <ellipse cx={0} cy={20} rx={PR} ry={8} fill="#f06020" opacity={0.06} />
        <ellipse cx={0} cy={-PR+14} rx={28} ry={14} fill="#1a2a58" opacity={0.55} />
        <ellipse cx={0} cy={PR-14} rx={22} ry={12} fill="#1a2a58" opacity={0.45} />
      </g>
      <circle r={PR} fill="url(#cor-atm)" />
      <circle r={PR} fill="none" stroke="#e07030" strokeWidth={7} opacity={0.25} />
      <circle r={PR+9} fill="none" stroke="#d06020" strokeWidth={3} opacity={0.10} />
    </g>
  );
}

function DagobahSurface() {
  return (
    <g>
      <defs>
        <clipPath id="dag-clip"><circle r={PR} /></clipPath>
        <radialGradient id="dag-grad" cx="40%" cy="36%" r="70%">
          <stop offset="0%" stopColor="#2e5e34" />
          <stop offset="50%" stopColor="#1a4024" />
          <stop offset="100%" stopColor="#081810" />
        </radialGradient>
      </defs>
      <circle r={PR} fill="url(#dag-grad)" />
      <g clipPath="url(#dag-clip)">
        <ellipse cx={-18} cy={14}  rx={28} ry={16} fill="#4a2e10" opacity={0.50} />
        <ellipse cx={24}  cy={-8}  rx={22} ry={13} fill="#3a2808" opacity={0.42} />
        <ellipse cx={-6}  cy={34}  rx={30} ry={14} fill="#5a3a14" opacity={0.44} />
        <ellipse cx={26}  cy={28}  rx={18} ry={11} fill="#3a2a0a" opacity={0.38} />
        <ellipse cx={-30} cy={-20} rx={18} ry={11} fill="#3a6030" opacity={0.60} />
        <ellipse cx={10}  cy={-30} rx={16} ry={10} fill="#2e5428" opacity={0.55} />
        <ellipse cx={-12} cy={20}  rx={22} ry={12} fill="#3a6228" opacity={0.50} />
        <ellipse cx={40}  cy={-10} rx={14} ry={9}  fill="#2a5020" opacity={0.45} />
        <ellipse cx={-40} cy={10}  rx={16} ry={10} fill="#346030" opacity={0.48} />
        {/* Murky water */}
        <ellipse cx={-14} cy={18}  rx={24} ry={8}  fill="#60b0b0" opacity={0.15} />
        <ellipse cx={20}  cy={-4}  rx={16} ry={6}  fill="#50a0a8" opacity={0.12} />
        {/* Fog wisps */}
        <ellipse cx={0}   cy={-8}  rx={PR*0.88} ry={16} fill="#a0d0a0" opacity={0.10} />
        <ellipse cx={-10} cy={10}  rx={PR*0.70} ry={10} fill="#80b080" opacity={0.08} />
        <ellipse cx={22}  cy={PR-10} rx={26} ry={10} fill="#60a060" opacity={0.20} />
        <ellipse cx={22} cy={22} rx={36} ry={30} fill="#061008" opacity={0.38} />
      </g>
      <circle r={PR} fill="none" stroke="#60a060" strokeWidth={7} opacity={0.22} />
      <circle r={PR+8} fill="none" stroke="#408040" strokeWidth={3} opacity={0.10} />
      <motion.g animate={{ rotate: [0, 360] }}
        transition={{ duration: 70, repeat: Infinity, ease: "linear" }}
        style={{ transformOrigin: "0px 0px" }}>
        <ellipse cx={0} cy={-PR+6} rx={PR*0.75} ry={8} fill="#80c080" opacity={0.14} />
        <ellipse cx={PR-8} cy={0} rx={7} ry={PR*0.6} fill="#70b070" opacity={0.08} />
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
          <stop offset="0%" stopColor="#2a1060" />
          <stop offset="40%" stopColor="#180840" />
          <stop offset="75%" stopColor="#0e0530" />
          <stop offset="100%" stopColor="#050218" />
        </radialGradient>
        <radialGradient id="jcc-glow" cx="50%" cy="50%" r="50%">
          <stop offset="60%" stopColor="#9040ff" stopOpacity="0" />
          <stop offset="100%" stopColor="#9040ff" stopOpacity="0.45" />
        </radialGradient>
      </defs>
      <circle r={PR} fill="url(#jcc-grad)" />
      <g clipPath="url(#jcc-clip)">
        {/* Crystal grid */}
        {crystals.map(([x, y, r, color], i) => (
          <motion.circle key={i} cx={x} cy={y} r={r}
            fill={color} opacity={0.80}
            animate={{ opacity: [0.5, 1.0, 0.5], r: [r*0.8, r*1.2, r*0.8] }}
            transition={{ duration: 1.8+(i%7)*0.3, repeat: Infinity, delay: (i%11)*0.18 }} />
        ))}
        {/* Force meridian lines */}
        <path d={`M 0 ${-PR} Q 30 0 0 ${PR}`} fill="none" stroke="#b070ff" strokeWidth={0.8} opacity={0.25} />
        <path d={`M 0 ${-PR} Q -30 0 0 ${PR}`} fill="none" stroke="#b070ff" strokeWidth={0.8} opacity={0.25} />
        <ellipse cx={0} cy={0} rx={PR*0.85} ry={PR*0.3} fill="none" stroke="#9050e0" strokeWidth={0.7} opacity={0.20} />
        <ellipse cx={0} cy={0} rx={PR*0.6} ry={PR*0.21} fill="none" stroke="#a060ff" strokeWidth={0.6} opacity={0.18} />
        <ellipse cx={0} cy={0} rx={PR*0.35} ry={PR*0.12} fill="none" stroke="#c080ff" strokeWidth={0.5} opacity={0.22} />
        <ellipse cx={20} cy={28} rx={42} ry={34} fill="#050218" opacity={0.42} />
      </g>
      <circle r={PR} fill="url(#jcc-glow)" />
      <circle r={PR} fill="none" stroke="#a060ff" strokeWidth={7} opacity={0.30} />
      <circle r={PR+10} fill="none" stroke="#8040d0" strokeWidth={3} opacity={0.14} />
      {/* Crystal ring orbiting */}
      <motion.g animate={{ rotate: [-360, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        style={{ transformOrigin: "0px 0px" }}>
        {[0, 60, 120, 180, 240, 300].map((angle, i) => {
          const rad = (angle * Math.PI) / 180;
          const rx2 = PR + 20, ry2 = 9;
          const cx2 = rx2 * Math.cos(rad), cy2 = ry2 * Math.sin(rad);
          return <circle key={i} cx={cx2} cy={cy2} r={3.5}
            fill={i%2===0 ? "#c080ff" : "#8040d0"} opacity={0.75} />;
        })}
      </motion.g>
    </g>
  );
}

// ─── Planet types ───────────────────────────────────────────────────────────
type PlanetId = "tatooine" | "coruscant" | "dagobah" | "jedaicouncode";
type PlanetTier = "high" | "medium" | "low" | "all";
type PlanetData = { id: PlanetId; name: string; tier: PlanetTier; label: string; color: string };

const PLANETS: PlanetData[] = [
  { id: "tatooine",     name: "Tatooine",      tier: "high",   label: "Websites · Grand Masters",  color: "#f5c842" },
  { id: "coruscant",    name: "Coruscant",      tier: "medium", label: "SaaS Tools · Jedi Knights", color: "#818cf8" },
  { id: "dagobah",      name: "Dagobah",        tier: "low",    label: "Personal · Companions",      color: "#4ade80" },
  { id: "jedaicouncode",name: "Jedai Councode", tier: "all",    label: "The Council · All Systems",  color: "#c080ff" },
];

const PRIORITY_TO_PLANET: Record<string, PlanetId> = {
  high: "tatooine",
  medium: "coruscant",
  low: "dagobah",
};

function PlanetNode({
  planet, pos, scale, onPtrDown, onPtrMove, onPtrUp, isDragging,
}: {
  planet: PlanetData; pos: {x:number;y:number}; scale: number;
  onPtrDown: (e: React.PointerEvent) => void;
  onPtrMove: (e: React.PointerEvent) => void;
  onPtrUp: (e: React.PointerEvent) => void;
  isDragging: boolean;
}) {
  const scaledPR = PR * scale;
  return (
    <g
      transform={`translate(${pos.x},${pos.y}) scale(${scale})`}
      style={{ cursor: isDragging ? "grabbing" : "grab" }}
      onPointerDown={onPtrDown}
      onPointerMove={onPtrMove}
      onPointerUp={onPtrUp}
    >
      {/* Floor shadow */}
      <ellipse cx={0} cy={scaledPR/scale + 12} rx={PR * 0.85} ry={PR * 0.20}
        fill="#000" opacity={0.45} />

      <motion.g
        animate={{ y: [-5, 5, -5] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
      >
        {planet.id === "tatooine"      && <TatooineSurface />}
        {planet.id === "coruscant"     && <CoruscantSurface />}
        {planet.id === "dagobah"       && <DagobahSurface />}
        {planet.id === "jedaicouncode" && <JedaiCouncoseSurface />}
      </motion.g>

      <text y={PR + 22} textAnchor="middle" fontSize={13} fill="#e2e8f0"
        fontFamily="var(--font-mono)" letterSpacing="1" fontWeight="bold">
        {planet.name.toUpperCase()}
      </text>
      <text y={PR + 36} textAnchor="middle" fontSize={9} fill={planet.color}
        fontFamily="var(--font-mono)" letterSpacing="0.5" opacity={0.85}>
        {planet.label}
      </text>
    </g>
  );
}

// ─── Planet–agent tether line ───────────────────────────────────────────────
function PlanetTether({ ax, ay, px, py, color }: { ax:number;ay:number;px:number;py:number;color:string }) {
  const mx = (ax + px) / 2;
  const my = (ay + py) / 2 - 18;
  const d = `M ${ax} ${ay} Q ${mx} ${my} ${px} ${py}`;
  return (
    <motion.path d={d} fill="none"
      stroke={color} strokeWidth={0.8} opacity={0.22}
      strokeDasharray="5 8"
      animate={{ strokeDashoffset: [0, -130] }}
      transition={{ duration: 3.5, repeat: Infinity, ease: "linear" }} />
  );
}

// ─── Tooltip type ───────────────────────────────────────────────────────────
type TooltipState = { agent: AgentRecord; character: JediCharacter; x: number; y: number } | null;

// ─── Midichlorian panel ──────────────────────────────────────────────────────
function MidichlorianPanel({ agents, assignments, open, onClose }: {
  agents: AgentRecord[];
  assignments: Map<string, JediCharacter>;
  open: boolean;
  onClose: () => void;
}) {
  const sorted = [...agents].sort((a, b) => getMidichlorians(b) - getMidichlorians(a));
  const max = sorted.length > 0 ? getMidichlorians(sorted[0]) : 1;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="midi-panel"
          initial={{ x: -340 }}
          animate={{ x: 0 }}
          exit={{ x: -340 }}
          transition={{ type: "spring", stiffness: 280, damping: 32 }}
        >
          <div className="midi-header">
            <span className="midi-title">MIDICHLORIAN RANK</span>
            <button className="midi-close" onClick={onClose}>✕</button>
          </div>
          <div className="midi-subtitle">Token + context usage · ranked by The Force</div>
          <div className="midi-list">
            {sorted.map((agent, idx) => {
              const char = assignments.get(agent.id);
              const midi = getMidichlorians(agent);
              const pct  = midi / max;
              const sc   = STATUS_COLOR[agent.status];
              const tierColor = agent.priority === "high" ? "#f5c842"
                : agent.priority === "medium" ? "#818cf8" : "#4ade80";
              return (
                <div key={agent.id} className="midi-row">
                  <span className="midi-rank">#{idx + 1}</span>
                  <div className="midi-info">
                    <div className="midi-agent-name">
                      <span className="midi-status-dot" style={{ background: sc }} />
                      {agent.name}
                    </div>
                    <div className="midi-char-label" style={{ color: char?.color ?? tierColor }}>
                      {char?.name ?? "—"} · {agent.priority.toUpperCase()}
                    </div>
                    <div className="midi-bar-wrap">
                      <motion.div className="midi-bar"
                        style={{ background: tierColor }}
                        initial={{ width: 0 }}
                        animate={{ width: `${pct * 100}%` }}
                        transition={{ delay: idx * 0.04, duration: 0.6, ease: "easeOut" }} />
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

// ─── Main component ─────────────────────────────────────────────────────────
const planetDefaultPos: Record<PlanetId, {x:number;y:number}> = {
  tatooine:      { x: FCX - 205, y: FCY + 55  },
  coruscant:     { x: FCX - 65,  y: FCY - 70  },
  dagobah:       { x: FCX + 165, y: FCY + 55  },
  jedaicouncode: { x: FCX + 80,  y: FCY - 50  },
};

export default function JediChamber() {
  const [agents,      setAgents]      = useState<AgentRecord[]>([]);
  const [useMock,     setUseMock]     = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [tooltip,     setTooltip]     = useState<TooltipState>(null);
  const [assignments, setAssignments] = useState<Map<string, JediCharacter>>(new Map());
  const [pulseKey,    setPulseKey]    = useState(0);
  const [dragId,      setDragId]      = useState<string | null>(null);
  const [midiOpen,    setMidiOpen]    = useState(false);

  const [posOverrides, setPosOverrides] = useState<Map<string, {x:number;y:number}>>(() => {
    if (typeof window === "undefined") return new Map();
    try {
      const s = localStorage.getItem("jedi-pos-v3");
      if (s) return new Map(JSON.parse(s));
    } catch {}
    return new Map();
  });

  useEffect(() => {
    localStorage.setItem("jedi-pos-v3", JSON.stringify([...posOverrides.entries()]));
  }, [posOverrides]);

  const svgRef  = useRef<SVGSVGElement>(null);
  const dragRef = useRef<{ id: string; ox: number; oy: number } | null>(null);

  const fetchAgents = useCallback(async () => {
    try {
      const res  = await fetch(`/api/agents${useMock ? "?mock=true" : ""}`);
      const data: AgentRecord[] = await res.json();
      resetCharacterAssignments();
      const map = new Map<string, JediCharacter>();
      for (const a of data) map.set(a.id, assignCharacter(a.id, a.priority));
      setAgents(data);
      setAssignments(map);
      setLastRefresh(new Date());
      setPulseKey(k => k + 1);
    } catch (e) { console.error("fetch agents failed", e); }
  }, [useMock]);

  useEffect(() => {
    fetchAgents();
    const t = setInterval(fetchAgents, 5000);
    return () => clearInterval(t);
  }, [fetchAgents]);

  const seated = agents.slice(0, MAX_SEATS);
  const agentPos = new Map<string, {x:number;y:number}>();
  seated.forEach((a, i) => {
    agentPos.set(a.id, posOverrides.get(a.id) ?? seatPos(i));
  });

  const planetPos = (p: PlanetData) =>
    posOverrides.get("planet-" + p.id) ?? planetDefaultPos[p.id];

  const beams: Array<[string, string]> = [];
  const seenB = new Set<string>();
  for (const a of seated) {
    for (const cid of a.connections) {
      const key = [a.id, cid].sort().join("--");
      if (!seenB.has(key) && agentPos.has(cid)) {
        seenB.add(key);
        beams.push([a.id, cid]);
      }
    }
  }

  const seatedSorted = [...seated].sort((a, b) =>
    (agentPos.get(a.id)?.y ?? 0) - (agentPos.get(b.id)?.y ?? 0)
  );

  function startDrag(e: React.PointerEvent, id: string, curPos: {x:number;y:number}) {
    e.stopPropagation();
    const svg = svgRef.current;
    if (!svg) return;
    (e.currentTarget as SVGElement).setPointerCapture(e.pointerId);
    const p = getSvgPt(e, svg);
    dragRef.current = { id, ox: p.x - curPos.x, oy: p.y - curPos.y };
    setDragId(id);
    setTooltip(null);
  }

  function moveDrag(e: React.PointerEvent, id: string) {
    const d = dragRef.current;
    if (!d || d.id !== id) return;
    const svg = svgRef.current;
    if (!svg) return;
    const p = getSvgPt(e, svg);
    setPosOverrides(prev => {
      const m = new Map(prev);
      m.set(id, { x: p.x - d.ox, y: p.y - d.oy });
      return m;
    });
  }

  function endDrag(id: string) {
    if (dragRef.current?.id === id) {
      dragRef.current = null;
      setDragId(null);
    }
  }

  const totalMidi = agents.reduce((s, a) => s + getMidichlorians(a), 0);

  return (
    <div className="chamber-root">

      {/* ── Topbar ── */}
      <div className="topbar">
        <div className="topbar-left">
          <button
            className="midi-toggle-btn"
            onClick={() => setMidiOpen(o => !o)}
            title="Open Midichlorian Rankings"
          >
            ⚡ MIDI
          </button>
          <span className="topbar-divider" />
          <span className="topbar-title">JEDI COUNCIL</span>
          <span className="topbar-sub">Autonomous Agent Network</span>
        </div>
        <div className="topbar-right">
          <span className="topbar-stat">
            <span className="stat-dot active-dot" />
            {agents.filter(a => a.status === "active").length} running
          </span>
          <span className="topbar-stat">
            <span className="stat-dot idle-dot" />
            {agents.filter(a => a.status === "idle").length} standby
          </span>
          {agents.filter(a => a.status === "error").length > 0 && (
            <span className="topbar-stat error-stat">
              <span className="stat-dot error-dot" />
              {agents.filter(a => a.status === "error").length} critical
            </span>
          )}
          <span className="topbar-midi-count" title="Total network midichlorian count">
            ⚡ {(totalMidi / 1000).toFixed(0)}k M
          </span>
          <span className="topbar-divider" />
          <button className="reset-btn" onClick={() => setPosOverrides(new Map())}>
            Reset Layout
          </button>
          <button
            className={`mode-toggle ${useMock ? "mock-active" : "live-active"}`}
            onClick={() => setUseMock(m => !m)}>
            {useMock ? "◈ HOLOGRAM" : "⬟ LIVE FEED"}
          </button>
          <button className="refresh-btn" onClick={fetchAgents} title="Sync agents">
            <span key={pulseKey} className="refresh-icon">⟳</span>
          </button>
          {lastRefresh && (
            <span className="topbar-time">
              {lastRefresh.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
            </span>
          )}
        </div>
      </div>

      {/* ── Main area ── */}
      <div className="chamber-wrap" style={{ position: "relative" }}>

        {/* Midichlorian slide panel */}
        <MidichlorianPanel
          agents={agents}
          assignments={assignments}
          open={midiOpen}
          onClose={() => setMidiOpen(false)}
        />

        <svg
          ref={svgRef}
          viewBox={`0 0 ${VW} ${VH}`}
          className="chamber-svg"
          preserveAspectRatio="xMidYMid meet"
          style={{ display: "block", width: "100%", height: "100%" }}
        >
          <ChamberRoom />

          {/* Empty pedestals */}
          {Array.from({ length: MAX_SEATS }, (_, i) => {
            if (i < seated.length) return null;
            const p = seatPos(i);
            const s = depthScale(p.y);
            return (
              <ellipse key={`emp-${i}`} cx={p.x} cy={p.y}
                rx={20*s} ry={10*s} fill="#141c2a" stroke="#1e2840" strokeWidth={1} opacity={0.45} />
            );
          })}

          {/* Force beams (agent–agent) */}
          {beams.map(([aId, bId]) => {
            const a = agentPos.get(aId)!;
            const b = agentPos.get(bId)!;
            return <ForceBeam key={`${aId}-${bId}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y} />;
          })}

          {/* Planet tethers (agent → their home planet) */}
          {seated.map(agent => {
            const targetPlanetId = PRIORITY_TO_PLANET[agent.priority];
            const planet = PLANETS.find(p => p.id === targetPlanetId);
            if (!planet) return null;
            const ap = agentPos.get(agent.id);
            const pp = planetPos(planet);
            if (!ap) return null;
            return (
              <PlanetTether key={`tether-${agent.id}`}
                ax={ap.x} ay={ap.y}
                px={pp.x} py={pp.y}
                color={planet.color} />
            );
          })}

          {/* Holographic emblem */}
          <motion.g animate={{ rotate: 360 }}
            transition={{ duration: 80, repeat: Infinity, ease: "linear" }}
            style={{ transformOrigin: `${FCX}px ${FCY}px` }}>
            <JediEmblem />
          </motion.g>
          <JediEmblem />

          <motion.ellipse cx={FCX} cy={FCY} rx={10} ry={5} fill="#c8a84b" opacity={0.5}
            animate={{ rx: [8,16,8], ry: [4,8,4], opacity: [0.5,0.15,0.5] }}
            transition={{ duration: 3.4, repeat: Infinity }} />

          {/* Agents */}
          {seatedSorted.map((agent) => {
            const char = assignments.get(agent.id);
            if (!char) return null;
            const pos   = agentPos.get(agent.id)!;
            const s     = depthScale(pos.y);
            const sc    = STATUS_COLOR[agent.status];
            const isErr = agent.status === "error";
            const isIdle= agent.status === "idle";
            const isDrg = dragId === agent.id;
            const seatR = 32 * s;

            return (
              <g key={agent.id}
                transform={`translate(${pos.x},${pos.y})`}
                style={{ cursor: isDrg ? "grabbing" : "grab" }}
                onPointerDown={e => startDrag(e, agent.id, pos)}
                onPointerMove={e => moveDrag(e, agent.id)}
                onPointerUp={() => endDrag(agent.id)}
                onMouseEnter={e => { if (!dragRef.current) setTooltip({ agent, character: char, x: e.clientX, y: e.clientY }); }}
                onMouseMove={e  => { if (!dragRef.current) setTooltip(t => t ? { ...t, x: e.clientX, y: e.clientY } : null); }}
                onMouseLeave={() => { if (!dragRef.current) setTooltip(null); }}
              >
                <ellipse cx={0} cy={seatR*0.55} rx={seatR*1.05} ry={seatR*0.38} fill="#05070c" opacity={0.45*s} />
                <motion.circle r={seatR+5*s} fill={sc} opacity={0.08}
                  stroke={sc} strokeWidth={1.8*s}
                  animate={agent.status==="active"||agent.status==="error"
                    ? { r:[seatR+4*s,seatR+10*s,seatR+4*s], opacity:[0.08,0.22,0.08] }
                    : { opacity:0.04 }}
                  transition={{ duration: isErr?1.1:2.6, repeat: Infinity }}
                  style={isErr ? { filter:"drop-shadow(0 0 10px #ef4444)" } : {}} />
                <circle r={seatR} fill="#0f1422" stroke={char.color} strokeWidth={1.5*s} strokeOpacity={0.6} />
                <foreignObject x={-seatR*0.88} y={-seatR*0.88} width={seatR*1.76} height={seatR*1.76}
                  style={{ pointerEvents:"none", overflow:"visible" }}>
                  {/* @ts-expect-error xmlns needed */}
                  <div xmlns="http://www.w3.org/1999/xhtml"
                    style={{ width:"100%", height:"100%", display:"flex", alignItems:"center", justifyContent:"center" }}>
                    <CharacterSilhouette characterId={char.id} color={char.color} size={seatR*1.6} />
                  </div>
                </foreignObject>
                {isIdle && (
                  <motion.g
                    animate={{ y:[-4,4,-4], rotate:[0,360] }}
                    transition={{ duration:3.8, repeat:Infinity, ease:"easeInOut" }}
                    style={{ transformOrigin:`0px ${-seatR-14}px` }}>
                    <polygon points={`0,${-seatR-22} 7,${-seatR-14} 0,${-seatR-6} -7,${-seatR-14}`}
                      fill="#94a3b8" opacity={0.55} />
                  </motion.g>
                )}
                <text y={seatR+14*s} textAnchor="middle"
                  fontSize={9*Math.max(0.8,s)} fill="#cbd5e1"
                  fontFamily="var(--font-mono)" letterSpacing="0.4"
                  style={{ pointerEvents:"none", userSelect:"none" }}>
                  {agent.name.length>17 ? agent.name.slice(0,16)+"…" : agent.name}
                </text>
                {agent.priority==="high" && (
                  <g transform={`translate(0,${seatR+24*s})`}>
                    {[-6,0,6].map(dx => <circle key={dx} cx={dx*s} cy={0} r={2*s} fill={char.color} opacity={0.82} />)}
                  </g>
                )}
                {agent.priority==="medium" && (
                  <g transform={`translate(0,${seatR+24*s})`}>
                    {[-4,4].map(dx => <circle key={dx} cx={dx*s} cy={0} r={2*s} fill={char.color} opacity={0.62} />)}
                  </g>
                )}
                {agent.priority==="low" && (
                  <circle cx={0} cy={seatR+24*s} r={2*s} fill={char.color} opacity={0.42} />
                )}
              </g>
            );
          })}

          {/* Planet nodes */}
          {PLANETS.map(p => {
            const pos = planetPos(p);
            const s   = depthScale(pos.y);
            const pid = "planet-" + p.id;
            return (
              <PlanetNode key={p.id} planet={p} pos={pos} scale={s}
                isDragging={dragId === pid}
                onPtrDown={e => startDrag(e, pid, pos)}
                onPtrMove={e => moveDrag(e, pid)}
                onPtrUp={() => endDrag(pid)} />
            );
          })}
        </svg>

        {tooltip && (
          <AgentTooltip agent={tooltip.agent} character={tooltip.character}
            visible x={tooltip.x} y={tooltip.y} />
        )}
      </div>

      {/* ── Legend ── */}
      <div className="legend">
        <div className="legend-group"><span className="legend-dot" style={{ background:"#4ade80" }} /><span>Running</span></div>
        <div className="legend-group"><span className="legend-dot" style={{ background:"#94a3b8" }} /><span>Standby</span></div>
        <div className="legend-group"><span className="legend-dot" style={{ background:"#ef4444" }} /><span>Critical</span></div>
        <div className="legend-group"><span className="legend-dot" style={{ background:"#60a5fa" }} /><span>Done</span></div>
        <span className="legend-divider" />
        <div className="legend-group"><span className="priority-dots">●●●</span><span>Websites → Tatooine</span></div>
        <div className="legend-group"><span className="priority-dots">●●</span><span>SaaS → Coruscant</span></div>
        <div className="legend-group"><span className="priority-dots">●</span><span>Personal → Dagobah</span></div>
        <div className="legend-group"><span style={{ color:"#c080ff" }}>✦</span><span>Jedai Councode</span></div>
        <span className="legend-divider" />
        <div className="legend-group" style={{ color:"var(--text-dim)", fontSize:10 }}>
          ◈ Drag agents or planets · ⚡ MIDI for Force rankings
        </div>
      </div>
    </div>
  );
}
