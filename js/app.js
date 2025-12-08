import { initGate } from "./gate.js";
import { initUI } from "./ui.js";
import { renderWall, initInfiniteScroll } from "./wall.js";
import { initRealtime } from "./realtime.js";
import "./notes.js"; // Notes module has self-contained event listeners

// Initialize app
console.log("Initializing app...");

initUI();
initGate();
initRealtime();
initInfiniteScroll();
renderWall();