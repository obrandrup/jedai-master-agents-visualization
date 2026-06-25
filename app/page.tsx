"use client";

import dynamic from "next/dynamic";

const JediChamber = dynamic(() => import("@/components/JediChamber"), { ssr: false });

export default function Home() {
  return (
    <main style={{ width: "100vw", height: "100vh", overflow: "hidden" }}>
      <JediChamber />
    </main>
  );
}
