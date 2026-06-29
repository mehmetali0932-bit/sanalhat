const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const DATA_DIR = path.join(__dirname, "..", "data");
const DB_FILE = path.join(DATA_DIR, "db.json");

function defaultData() {
  return {
    users: [],
    services: [
      { id: "whatsapp", name: "WhatsApp", basePrice: 12 },
      { id: "telegram", name: "Telegram", basePrice: 9 },
      { id: "instagram", name: "Instagram", basePrice: 15 },
      { id: "google", name: "Google", basePrice: 18 },
      { id: "discord", name: "Discord", basePrice: 10 },
      { id: "tiktok", name: "TikTok", basePrice: 14 },
      { id: "facebook", name: "Facebook", basePrice: 13 },
      { id: "tinder", name: "Tinder", basePrice: 20 }
    ],
    countries: [
      { id: "tr", name: "Turkiye", dialCode: "90", multiplier: 1.4 },
      { id: "us", name: "ABD", dialCode: "1", multiplier: 1.8 },
      { id: "gb", name: "Ingiltere", dialCode: "44", multiplier: 1.7 },
      { id: "de", name: "Almanya", dialCode: "49", multiplier: 1.6 },
      { id: "id", name: "Endonezya", dialCode: "62", multiplier: 0.7 },
      { id: "ru", name: "Rusya", dialCode: "7", multiplier: 0.6 }
    ],
    orders: [],
    meta: { nextOrderSeq: 1 }
  };
}

let cache = null;

function ensureLoaded() {
  if (cache) return cache;
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(DB_FILE)) {
    cache = defaultData();
    persist();
  } else {
    try {
      cache = JSON.parse(fs.readFileSync(DB_FILE, "utf8"));
    } catch (err) {
      console.error("db.json hatasi:", err.message);
      cache = defaultData();
      persist();
    }
  }
  return cache;
}

function persist() {
  const tmp = DB_FILE + ".tmp";
  fs.writeFileSync(tmp, JSON.stringify(cache, null, 2), "utf8");
  fs.renameSync(tmp, DB_FILE);
}

function snapshot() {
  ensureLoaded();
  return cache;
}

function save() {
  ensureLoaded();
  persist();
}

function id() {
  return crypto.randomUUID();
}

module.exports = { snapshot, save, id, DATA_DIR, DB_FILE };