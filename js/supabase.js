import { createClient } from "https://esm.sh/@supabase/supabase-js@2";


const supabaseUrl = "https://gwpydutbemgxxxbtxgmj.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd3cHlkdXRiZW1neHh4YnR4Z21qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ1ODM1NTUsImV4cCI6MjA4MDE1OTU1NX0.PmIMiIsQtigqSUUeaAcKtmsYfE5ake6dvQMRO4YV91w";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

const API = "https://gwpydutbemgxxxbtxgmj.supabase.co/functions/v1/smart-action";

export async function apiGet(path) {
  try {
    const res = await fetch(`${API}${path}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${supabaseAnonKey}`,
        "Content-Type": "application/json",
        apikey: supabaseAnonKey,
      },
    });

    if (!res.ok) {
      console.error(`API GET ${path} failed:`, res.status, res.statusText);
      const text = await res.text();
      console.error("Response:", text);
      return {
        data: null,
        error: { message: `Request failed: ${res.status}` },
      };
    }

    const json = await res.json();
    console.log(`API GET ${path} success:`, json);
    return json;
  } catch (err) {
    console.error(`API GET ${path} error:`, err);
    return { data: null, error: err };
  }
}

export async function apiPost(path, body) {
  try {
    const res = await fetch(`${API}${path}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${supabaseAnonKey}`,
        "Content-Type": "application/json",
        apikey: supabaseAnonKey,
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      console.error(`API POST ${path} failed:`, res.status, res.statusText);
      const text = await res.text();
      console.error("Response:", text);
      return {
        data: null,
        error: { message: `Request failed: ${res.status}` },
      };
    }

    const json = await res.json();
    console.log(`API POST ${path} success:`, json);
    return json;
  } catch (err) {
    console.error(`API POST ${path} error:`, err);
    return { data: null, error: err };
  }
}

export function base64ToBlob(base64, type = "image/jpeg") {
  const byteCharacters = atob(base64.split(",")[1]);
  const byteArrays = [];

  for (let offset = 0; offset < byteCharacters.length; offset += 512) {
    const slice = byteCharacters.slice(offset, offset + 512);
    const byteNumbers = new Array(slice.length);
    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    byteArrays.push(byteArray);
  }
  return new Blob(byteArrays, { type });
}

export async function uploadSelfieToSupabase(base64, name, latitude, longitude) {
  try {
    const clean = name.replace(/\s+/g, "_");
    const filename = `${Date.now()}_${clean}.jpg`;
    const blob = base64ToBlob(base64);

    const { data, error } = await supabase.storage
      .from("Selfies")
      .upload(filename, blob, {
        contentType: "image/jpeg",
        upsert: false,
      });

    if (error) {
      console.error("Upload error:", error);
      return null;
    }

    const { data: urlData } = supabase.storage
      .from("Selfies")
      .getPublicUrl(filename);

    console.log("Upload success:", urlData.publicUrl);
    return urlData.publicUrl;
  } catch (e) {
    console.error("Selfie upload exception:", e);
    return null;
  }
}