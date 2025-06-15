
export function safeParseJson(str: any, fallback: any) {
  if (typeof str === "object" && str !== null) return str;
  if (typeof str !== "string") return fallback;
  try {
    const obj = JSON.parse(str);
    if (typeof obj === "object" && obj !== null) return obj;
    return fallback;
  } catch {
    return fallback;
  }
}

export function sanitize(str: any): string {
  return typeof str === "string" ? str.trim() : "";
}
