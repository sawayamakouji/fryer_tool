export async function readJson(path) {
  const res = await fetch(path, {cache:"no-store"});
  if (!res.ok) throw new Error(`Failed to load ${path}: ${res.status}`);
  return await res.json();
}
export function downloadText(filename, text, mime="text/plain;charset=utf-8") {
  const blob = new Blob([text], {type:mime});
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}
export function downloadCSV(filename, rows) {
  const esc = (v) => {
    if (v === null || v === undefined) return "";
    const s = String(v);
    return /[,"\n]/.test(s) ? `"${s.replace(/"/g,'""')}"` : s;
  };
  const headers = Object.keys(rows[0] || {});
  const csv = [headers.join(",")].concat(rows.map(r => headers.map(h => esc(r[h])).join(","))).join("\n");
  downloadText(filename, csv, "text/csv;charset=utf-8");
}
export function appendLog(el, msg) {
  el.textContent += (el.textContent ? "\n" : "") + msg;
  el.scrollTop = el.scrollHeight;
}
