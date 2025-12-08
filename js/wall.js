import { state } from "./state.js";
import { apiGet } from "./supabase.js";

const wall = document.getElementById("wall");

// Cache management
const CACHE_KEY = "wall_cache";
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

function getCachedData() {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      const data = JSON.parse(cached);
      const now = Date.now();
      
      if (data.expiry && data.expiry > now) {
        console.log("Using cached wall data");
        return data.items;
      } else {
        localStorage.removeItem(CACHE_KEY);
      }
    }
  } catch (e) {
    console.error("Cache read error:", e);
  }
  return null;
}

function setCachedData(items) {
  try {
    const cacheData = {
      items: items,
      timestamp: Date.now(),
      expiry: Date.now() + CACHE_DURATION
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
  } catch (e) {
    console.error("Cache write error:", e);
  }
}

function clearCache() {
  localStorage.removeItem(CACHE_KEY);
}

function createNoteCard(item) {
  const card = document.createElement("div");
  card.className = "card";

  if (item.type === "silent")
    card.style.background = "rgba(249, 247, 243, 0.9)";
  else if (item.type === "night")
    card.style.background = "rgba(245, 242, 236, 0.9)";
  else if (item.type === "sealed")
    card.style.background = "rgba(252, 250, 244, 0.9)";

  if (item.type !== "normal") {
    const badge = document.createElement("div");
    badge.className = `type-badge badge-${item.type}`;
    badge.textContent =
      item.type === "silent" ? "🤫" : item.type === "night" ? "🌙" : "🔒";
    card.appendChild(badge);
  }

  if (item.type === "sealed") {
    const today = new Date();
    const unlock = new Date(item.unlock_date);
    if (unlock > today) {
      const div = document.createElement("div");
      div.className = "sealed-placeholder";
      const dateStr = new Date(item.unlock_date).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
      });
      div.innerHTML = `<i>🔒</i><div>Is sandesh ko kholne ke liye<br>${dateStr} ka intezaar hai</div>`;
      card.appendChild(div);
    } else {
      const content = document.createElement("div");
      content.className = "note-content";
      content.textContent = item.message;
      card.appendChild(content);
    }
  } else {
    const content = document.createElement("div");
    content.className = "note-content";
    content.textContent = item.message;
    card.appendChild(content);
  }
  return card;
}

function createPoetryCard(item) {
  const card = document.createElement("div");
  card.className = "card poetry-card";
  card.textContent = item.lines;
  return card;
}

export async function renderWall(reset = false, useCache = true) {
  if (state.isLoading || (!reset && !state.hasMore)) return;
  state.isLoading = true;

  if (reset) {
    state.offset = 0;
    state.hasMore = true;
    wall.innerHTML = "";
    
    // Try to use cached data for initial load
    if (useCache) {
      const cached = getCachedData();
      if (cached && cached.length > 0) {
        cached.forEach((item) => {
          const card =
            item.source === "poetry"
              ? createPoetryCard(item)
              : createNoteCard(item);
          wall.appendChild(card);
        });
        state.isLoading = false;
        state.offset = cached.length;
        return;
      }
    }
  }

  try {
    const notesResult = await apiGet(
      `?route=notes&offset=${state.offset}&limit=${state.PAGE_SIZE}`
    );
    const poetryResult = await apiGet(
      `?route=poetry&offset=${state.offset}&limit=${state.PAGE_SIZE}`
    );

    const notes = notesResult.data || [];
    const poetry = poetryResult.data || [];

    const notesMapped = notes.map((n) => ({ ...n, source: "note" }));
    const poetryMapped = poetry.map((p) => ({ ...p, source: "poetry" }));

    const all = [...notesMapped, ...poetryMapped].sort(
      (a, b) => new Date(b.created_at) - new Date(a.created_at)
    );

    if (reset && all.length === 0) {
      wall.innerHTML = `
        <div class="empty-state">
          <i>🕯️</i>
          <p>यहाँ अभी खामोशी है...<br>पर तुम्हारी पहली बात इसे जीवंत कर देगी</p>
        </div>`;
      state.isLoading = false;
      return;
    }

    if (all.length < state.PAGE_SIZE) {
      state.hasMore = false;
    }

    all.forEach((item) => {
      const card =
        item.source === "poetry"
          ? createPoetryCard(item)
          : createNoteCard(item);
      wall.appendChild(card);
    });

    // Cache the first page of results
    if (reset && all.length > 0) {
      setCachedData(all);
    }

    state.offset += state.PAGE_SIZE;
  } catch (err) {
    console.error("Render error:", err);
  } finally {
    state.isLoading = false;
  }
}

// Debounce scroll events to reduce API calls
let scrollTimeout;
function handleScroll() {
  clearTimeout(scrollTimeout);
  scrollTimeout = setTimeout(() => {
    const nearBottom =
      window.innerHeight + window.scrollY >= document.body.offsetHeight - 200;

    if (nearBottom && !state.isLoading && state.hasMore) {
      renderWall(false, false);
    }
  }, 150); // Wait 150ms after scroll stops
}

export function initInfiniteScroll() {
  window.addEventListener("scroll", handleScroll, { passive: true });
}

// Export cache clearing function for realtime updates
export { clearCache };