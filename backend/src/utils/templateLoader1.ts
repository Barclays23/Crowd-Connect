// src/utils/templateLoader1.ts

import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Templates root folder (change if needed)
const TEMPLATES_DIR = path.join(__dirname, "../templates");

// Simple in-memory cache: templateName -> template string
const templateCache = new Map();

// Safe HTML escape to avoid injection when you render user data.
function escapeHtml(str) {
  if (str === null || str === undefined) return "";
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

/**
 * Resolve dotted path from object, e.g. "user.name"
 */
function getByPath(obj, pathStr) {
  if (!pathStr) return undefined;
  return pathStr.split(".").reduce((acc, key) => {
    if (acc === undefined || acc === null) return undefined;
    return acc[key];
  }, obj);
}

/**
 * Load template contents from disk (with optional caching).
 * @param {string} name filename (e.g. "otpEmail.html")
 * @param {object} opts { cache: true | false } default cache=true
 */
async function loadTemplate(name, opts = { cache: true }) {
  if (!name) throw new Error("Template name required");
  const cacheKey = name;

  if (opts.cache !== false && templateCache.has(cacheKey)) {
    return templateCache.get(cacheKey);
  }

  const filePath = path.join(TEMPLATES_DIR, name);
  const content = await fs.readFile(filePath, "utf8");

  if (opts.cache !== false) {
    templateCache.set(cacheKey, content);
  }
  return content;
}

/**
 * Render a template with a data object.
 * Replaces occurrences of {{key}} or {{nested.key}}.
 * @param {string} templateName filename inside templates dir
 * @param {object} data replacement map
 * @param {object} opts { cache: true, escape: true }
 */
export async function renderTemplate(templateName, data = {}, opts = {}) {
  const { cache = true, escape = true } = opts;
  const raw = await loadTemplate(templateName, { cache });

  // Regex matches {{ key }} where key is letters, numbers, underscores, dots
  const result = raw.replace(/{{\s*([a-zA-Z0-9_.]+)\s*}}/g, (_, token) => {
    const value = getByPath(data, token);
    if (value === undefined || value === null) return "";
    return escape ? escapeHtml(value) : String(value);
  });

  return result;
}

/**
 * Utilities to manage cache (optional)
 */
export function clearTemplateCache() {
  templateCache.clear();
}
export function preloadTemplate(name) {
  return loadTemplate(name, { cache: true });
}
