// unlighthouse.config.js

import { defineUnlighthouseConfig } from "unlighthouse/config";

export default defineUnlighthouseConfig({
  site: "http://localhost:3000", // адрес вашего локального сервера
  lighthouseOptions: {
    locale: "es", // язык отчёта
  },
  puppeteer: {
    executablePath: "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
    args: ["--no-sandbox", "--disable-setuid-sandbox"], // для стабильного запуска на Windows
  },
});