import { NextRequest, NextResponse } from "next/server";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { task } = await req.json();
  const { id } = params;

  // In live mode: forward to your real agent API here.
  // For now we log and return success so the UI flow works.
  console.log(`[task dispatch] agent=${id} task="${task}"`);

  return NextResponse.json({ ok: true, agentId: id, task });
}
