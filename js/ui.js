import { state, nicknames } from "./state.js";

// DOM elements
const fab = document.getElementById("fab");
const inputPanel = document.getElementById("inputPanel");
const entryText = document.getElementById("entryText");
const cancelBtn = document.getElementById("cancelBtn");
const nicknameDisplay = document.getElementById("nicknameDisplay");

// Nickname generator
function generateNickname() {
  const name = nicknames[Math.floor(Math.random() * nicknames.length)];
  nicknameDisplay.textContent = `"${name}"`;
}

// Panel controls
fab.addEventListener("click", () => {
  inputPanel.classList.add("active");
  if (window.innerWidth <= 767) {
    setTimeout(() => entryText.focus(), 300);
  }
});

cancelBtn.addEventListener("click", () => {
  inputPanel.classList.remove("active");
});

document.addEventListener("click", (e) => {
  if (
    window.innerWidth > 767 &&
    inputPanel.classList.contains("active") &&
    !inputPanel.contains(e.target) &&
    e.target !== fab
  ) {
    inputPanel.classList.remove("active");
  }
});

// Particles
function createParticles() {
  for (let i = 0; i < 10; i++) {
    const p = document.createElement("div");
    p.className = "particle";
    p.style.left = `${Math.random() * 100}%`;
    p.style.animationDelay = `${Math.random() * 20}s`;
    p.style.animationDuration = `${20 + Math.random() * 10}s`;
    document.body.appendChild(p);
  }
}

export function initUI() {
  nicknameDisplay.addEventListener("click", generateNickname);
  generateNickname();
  createParticles();
}