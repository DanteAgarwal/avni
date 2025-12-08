import { state } from "./state.js";
import { apiPost, uploadSelfieToSupabase } from "./supabase.js";
import { renderWall } from "./wall.js";
import { compressImage, validateImage } from "./imageUtils.js";

// DOM elements
const verifyGate = document.getElementById("verifyGate");
const gateName = document.getElementById("gateName");
const locBtn = document.getElementById("locBtn");
const locStatus = document.getElementById("locStatus");
const camBtn = document.getElementById("camBtn");
const camStatus = document.getElementById("camStatus");
const enterBtn = document.getElementById("enterBtn");
const camPreview = document.getElementById("camPreview");
const nicknameDisplay = document.getElementById("nicknameDisplay");

// Session management - check if user already verified
const SESSION_KEY = "wall_verified";
const SESSION_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours

function checkExistingSession() {
  const session = localStorage.getItem(SESSION_KEY);
  if (session) {
    try {
      const data = JSON.parse(session);
      const now = Date.now();
      
      // Check if session is still valid
      if (data.expiry && data.expiry > now) {
        console.log("Valid session found, skipping gate");
        nicknameDisplay.textContent = `"${data.name}"`;
        verifyGate.style.display = "none";
        return true;
      } else {
        // Session expired
        localStorage.removeItem(SESSION_KEY);
      }
    } catch (e) {
      console.error("Session parse error:", e);
      localStorage.removeItem(SESSION_KEY);
    }
  }
  return false;
}

function saveSession(name) {
  const sessionData = {
    name: name,
    timestamp: Date.now(),
    expiry: Date.now() + SESSION_EXPIRY
  };
  localStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
}

function updateGate() {
  const nameOK = gateName.value.trim().length > 0;

  if (nameOK && state.hasLocation && state.hasSelfie) {
    enterBtn.disabled = false;
    enterBtn.style.background = "#d4af37";
  } else {
    enterBtn.disabled = true;
    enterBtn.style.background = "#888";
  }
}

// Location handler
locBtn.onclick = () => {
  locStatus.textContent = "Detecting…";

  navigator.geolocation.getCurrentPosition(
    (pos) => {
      state.hasLocation = true;
      state.lastLatitude = pos.coords.latitude;
      state.lastLongitude = pos.coords.longitude;
      locStatus.textContent = `✔️ ${pos.coords.latitude.toFixed(
        4
      )}, ${pos.coords.longitude.toFixed(4)}`;
      locStatus.style.color = "green";
      updateGate();
    },
    (err) => {
      console.error("Location error:", err);
      locStatus.textContent = "❌ Permission denied";
      locStatus.style.color = "red";
      state.hasLocation = false;
      updateGate();
    }
  );
};

// Camera handler
camBtn.onclick = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "user" },
      audio: false,
    });
    camPreview.srcObject = stream;
    camStatus.textContent = "Camera active… capturing natural frame";
    camStatus.style.color = "#555";

    setTimeout(() => {
      const video = camPreview;
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const ctx = canvas.getContext("2d");
      ctx.drawImage(video, 0, 0);

      state.selfieData = canvas.toDataURL("image/jpeg");
      state.hasSelfie = true;

      camStatus.textContent = "✔️ Face captured";
      camStatus.style.color = "green";

      stream.getTracks().forEach((t) => t.stop());
      updateGate();
    }, 1500);
  } catch (err) {
    console.error("Camera error:", err);
    camStatus.textContent = "❌ Camera denied";
    camStatus.style.color = "red";
    state.hasSelfie = false;
    updateGate();
  }
};

// Enter button handler
enterBtn.onclick = async () => {
  const nameOK = gateName.value.trim().length > 0;

  if (!nameOK || !state.hasLocation || !state.hasSelfie) {
    alert("Please complete all verification steps");
    return;
  }

  enterBtn.disabled = true;
  enterBtn.textContent = "Saving...";

  const name = gateName.value.trim();
  const lat = state.lastLatitude;
  const lon = state.lastLongitude;

  try {
    // Validate image
    const validation = validateImage(state.selfieData);
    if (!validation.valid) {
      alert(validation.error);
      return;
    }

    // Compress image before upload (HUGE savings!)
    enterBtn.textContent = "Compressing...";
    const compressed = await compressImage(state.selfieData, 800, 0.7);
    
    // Upload compressed selfie
    enterBtn.textContent = "Uploading...";
    let selfieURL = await uploadSelfieToSupabase(compressed, name, lat, lon);

    // Save visitor log
    const visitorData = {
      name,
      selfie_url: selfieURL,
      latitude: lat,
      longitude: lon,
    };

    const result = await apiPost("?route=visitor", visitorData);

    if (result.error) {
      console.error("Visitor save error:", result.error);
      alert("Failed to save visitor record. Check console.");
    } else {
      console.log("Visitor saved successfully");
      
      // Save session to avoid re-verification
      saveSession(name);
      
      nicknameDisplay.textContent = `"${name}"`;
      verifyGate.style.display = "none";
      await renderWall(true);
    }
  } catch (err) {
    console.error("Enter error:", err);
    alert("An error occurred. Check console.");
  } finally {
    enterBtn.disabled = false;
    enterBtn.textContent = "🔒 Enter";
  }
};

export function initGate() {
  gateName.addEventListener("input", updateGate);
  
  // Check if user already has a valid session
  const hasSession = checkExistingSession();
  
  if (!hasSession) {
    // show as flex so centering rules apply
    verifyGate.style.display = "flex";
  }
}

// Export function to clear session (for logout/reset)
export function clearSession() {
  localStorage.removeItem(SESSION_KEY);
  window.location.reload();
}