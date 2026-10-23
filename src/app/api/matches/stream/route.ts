import {
  getEventsSince,
  getTournamentState,
  subscribeClient,
  unsubscribeClient,
} from "@/lib/server/stateStore";
import { NextRequest } from "next/server";


export async function GET(request: NextRequest) {
  const encoder = new TextEncoder();
  const searchParams = request.nextUrl.searchParams;

  const headerLastId = request.headers.get("last-event-id");
  const queryLastId = searchParams.get("lastEventId");
  const lastEventId = headerLastId
    ? parseInt(headerLastId, 10)
    : queryLastId
    ? parseInt(queryLastId, 10)
    : null;

  let heartbeatInterval: NodeJS.Timeout | null = null;

  const stream = new ReadableStream({
    start(controller) {
      subscribeClient(controller);

      const currentState = getTournamentState();

      // If client provided a Last-Event-ID, replay any events since then
      if (lastEventId !== null && !isNaN(lastEventId)) {
        const missedEvents = getEventsSince(lastEventId);
        if (missedEvents.length > 0) {
          for (const ev of missedEvents) {
            const raw = `id: ${ev.id}\nevent: ${ev.type}\ndata: ${JSON.stringify(ev.data)}\n\n`;
            controller.enqueue(encoder.encode(raw));
          }
        } else {
          // Send snapshot
          const snapshotMsg = `id: ${currentState.lastEventId}\nevent: STATE_SNAPSHOT\ndata: ${JSON.stringify(currentState)}\n\n`;
          controller.enqueue(encoder.encode(snapshotMsg));
        }
      } else {
        // Send initial full snapshot
        const snapshotMsg = `id: ${currentState.lastEventId}\nevent: STATE_SNAPSHOT\ndata: ${JSON.stringify(currentState)}\n\n`;
        controller.enqueue(encoder.encode(snapshotMsg));
      }

      // Heartbeat every 15s to prevent cloud proxy timeouts
      heartbeatInterval = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(`: keep-alive\n\n`));
        } catch {
          if (heartbeatInterval) clearInterval(heartbeatInterval);
        }
      }, 15000);
    },
    cancel(controller) {
      if (heartbeatInterval) clearInterval(heartbeatInterval);
      unsubscribeClient(controller);
    },
  });

  request.signal.addEventListener("abort", () => {
    if (heartbeatInterval) clearInterval(heartbeatInterval);
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform, no-store",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
