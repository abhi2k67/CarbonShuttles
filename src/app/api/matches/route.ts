import { getTournamentState, handleMatchAction } from "@/lib/server/stateStore";
import { MatchAction, SyncMutation } from "@/types/tournament";
import { NextRequest, NextResponse } from "next/server";


export async function GET() {
  const state = getTournamentState();
  return NextResponse.json(state);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Check if it's a batch of offline mutations or a single action
    if (Array.isArray(body.mutations)) {
      const mutations = body.mutations as SyncMutation[];
      // Sort mutations in chronological order
      mutations.sort((a, b) => a.timestamp - b.timestamp);
      for (const m of mutations) {
        handleMatchAction(m.action);
      }
      return NextResponse.json({
        success: true,
        syncedCount: mutations.length,
        state: getTournamentState(),
      });
    }

    if (body.action) {
      const action = body.action as MatchAction;
      const updatedState = handleMatchAction(action);
      return NextResponse.json({ success: true, state: updatedState });
    }

    return NextResponse.json(
      { error: "Invalid request payload. Expected 'action' or 'mutations'." },
      { status: 400 }
    );
  } catch (error: unknown) {
    console.error("Error in /api/matches POST:", error);
    const message = error instanceof Error ? error.message : "Failed to process match action";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
