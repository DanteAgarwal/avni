import { supabase } from "./supabase.js";
import { renderWall, clearCache } from "./wall.js";

// Debounce realtime updates to avoid excessive re-renders
let updateTimeout;
const UPDATE_DELAY = 2000; // Wait 2 seconds before updating

function scheduleUpdate() {
  clearTimeout(updateTimeout);
  updateTimeout = setTimeout(() => {
    console.log("Realtime update triggered");
    clearCache(); // Clear cache so we fetch fresh data
    renderWall(true, false); // Don't use cache for realtime updates
  }, UPDATE_DELAY);
}

export function initRealtime() {
  supabase
    .channel("wall-updates")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "notes" },
      (payload) => {
        console.log("Notes change detected:", payload.eventType);
        scheduleUpdate();
      }
    )
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "poetry" },
      (payload) => {
        console.log("Poetry change detected:", payload.eventType);
        scheduleUpdate();
      }
    )
    .subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        console.log("Realtime subscriptions active");
      }
    });
}