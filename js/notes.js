import { state } from "./state.js";
import { apiPost } from "./supabase.js";
import { renderWall } from "./wall.js";

// DOM elements
const inputPanel = document.getElementById("inputPanel");
const entryText = document.getElementById("entryText");
const unlockDate = document.getElementById("unlockDate");
const saveBtn = document.getElementById("saveBtn");
const modeTabs = document.querySelectorAll(".mode-tab");
const typeBtns = document.querySelectorAll(".type-btn");
const noteTypes = document.getElementById("noteTypes");

// Mode tabs handler
modeTabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    modeTabs.forEach((t) => t.classList.remove("active"));
    tab.classList.add("active");
    state.currentMode = tab.dataset.mode;

    if (state.currentMode === "note") {
      noteTypes.style.display = "flex";
      updateNoteType("normal");
    } else {
      noteTypes.style.display = "none";
      entryText.placeholder = "कुछ लिखो... जो दिल ने कहा, पर ज़ुबान ने नहीं";
      unlockDate.style.display = "none";
      entryText.disabled = false;
    }
  });
});

// Note types handler
export function updateNoteType(type) {
  typeBtns.forEach((btn) => {
    if (btn.dataset.type === type) btn.classList.add("active");
    else btn.classList.remove("active");
  });
  state.currentNoteType = type;

  if (type === "sealed") {
    unlockDate.style.display = "block";
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    unlockDate.min = tomorrow.toISOString().split("T")[0];
  } else {
    unlockDate.style.display = "none";
  }

  if (type === "night") {
    const now = new Date();
    const hour = now.getHours();
    if (hour < 20 && hour >= 6) {
      entryText.placeholder = "🌙 Raat ki diary sirf 8PM–6AM likhi jaati hai";
      entryText.disabled = true;
    } else {
      entryText.placeholder = "आज रात का ख्याल...";
      entryText.disabled = false;
    }
  } else {
    entryText.disabled = false;
    entryText.placeholder = "जो दिल ने कहा...";
  }
}

typeBtns.forEach((btn) => {
  btn.addEventListener("click", () => updateNoteType(btn.dataset.type));
});

// Save handler
saveBtn.addEventListener("click", async () => {
  const text = entryText.value.trim();
  if (!text) return;

  saveBtn.disabled = true;
  saveBtn.textContent = "Saving...";

  try {
    let result;

    if (state.currentMode === "note") {
      if (state.currentNoteType === "night") {
        const now = new Date();
        const hour = now.getHours();
        if (hour < 20 && hour >= 6) {
          alert("🌙 Raat ki diary sirf raat mein (8PM–6AM) likhi ja sakti hai.");
          return;
        }
      }

      let insertData = { message: text, type: state.currentNoteType };
      if (state.currentNoteType === "sealed") {
        const date = unlockDate.value;
        if (!date) {
          alert("🔒 Kripya kholne ki tarikh chunen.");
          return;
        }
        insertData.unlock_date = date;
      }
      result = await apiPost("?route=notes", insertData);
    } else {
      result = await apiPost("?route=notes", { lines: text });
    }

    if (!result.error) {
      entryText.value = "";
      inputPanel.classList.remove("active");
      showSaved();
      await renderWall(true);
    } else {
      console.error("Save error:", result.error);
      alert("Failed to save. Check console.");
    }
  } catch (err) {
    console.error("Save exception:", err);
    alert("An error occurred. Check console.");
  } finally {
    saveBtn.disabled = false;
    saveBtn.textContent = "Save";
  }
});

function showSaved() {
  const el = document.getElementById("savedIndicator");
  el.classList.add("show");
  setTimeout(() => el.classList.remove("show"), 2200);
}