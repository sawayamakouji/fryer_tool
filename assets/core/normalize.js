export function digitsOnly(v) {
  if (v === null || v === undefined) return "";
  const s = String(v).trim().replace(/\.0+$/,"");
  return s.replace(/\D/g,"");
}
export function normalizeStoreId(v) {
  const d = digitsOnly(v);
  return d.replace(/^0+/,"");
}
export function normalizeJan(v) {
  return digitsOnly(v);
}
export function nfkc(s) {
  try { return s.normalize("NFKC"); } catch { return String(s); }
}
export function stripAffixes(name, prefixes=[], suffixes=[]) {
  let t = nfkc(String(name||"")).trim();
  for (const p of prefixes) if (t.startsWith(p)) t = t.slice(p.length);
  for (const suf of suffixes) if (t.endsWith(suf)) t = t.slice(0, -suf.length);
  return t.trim();
}
