const SEP_RE = /[～〜\-−—ー]/;
function excelSerialToUTCDate(serial) {
  const epoch = Date.UTC(1899, 11, 30);
  const days = Number(serial);
  if (!Number.isFinite(days)) return null;
  return new Date(epoch + Math.round(days) * 86400000);
}
function ymd(year, month, day) { return new Date(year, month-1, day); }
export function dateKey(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth()+1).padStart(2,"0");
  const day = String(d.getDate()).padStart(2,"0");
  return `${y}-${m}-${day}`;
}
export function parsePeriodFixedYM(val, fixedYear, fixedMonth) {
  if (val === null || val === undefined) return {start:null, end:null, kind:"empty"};
  let s = String(val).trim();
  if (!s) return {start:null, end:null, kind:"empty"};
  s = s.replace(/／/g,"/").replace(/\s+/g,"");
  if (s === `${fixedMonth}月度` || s === `${fixedMonth}月`) {
    const start = ymd(fixedYear, fixedMonth, 1);
    const end = new Date(fixedYear, fixedMonth, 0);
    return {start, end, kind:"month"};
  }
  if (/^\d{4,6}$/.test(s)) {
    const d0 = excelSerialToUTCDate(s);
    if (!d0) return {start:null, end:null, kind:"bad_serial"};
    const mo = d0.getUTCMonth()+1, da = d0.getUTCDate();
    const d = ymd(fixedYear, mo, da);
    return {start:d, end:d, kind:"excel_serial"};
  }
  s = s.replace(/(\d+)月(\d+)日/g, "$1/$2").replace(/(\d+)月(\d+)/g, "$1/$2");
  const parts = s.split(SEP_RE);
  if (parts.length === 1) {
    const m = parts[0].match(/^(\d{1,2})\/(\d{1,2})$/);
    if (!m) return {start:null, end:null, kind:"bad"};
    const d = ymd(fixedYear, Number(m[1]), Number(m[2]));
    return {start:d, end:d, kind:"single"};
  }
  const L = parts[0], R = parts[1];
  const m1 = L.match(/^(\d{1,2})\/(\d{1,2})$/);
  if (!m1) return {start:null, end:null, kind:"bad"};
  const mo1 = Number(m1[1]), d1 = Number(m1[2]);
  let mo2 = mo1, d2 = null;
  const m2 = R.match(/^(\d{1,2})\/(\d{1,2})$/);
  if (m2) { mo2 = Number(m2[1]); d2 = Number(m2[2]); }
  else {
    const m2b = R.match(/^(\d{1,2})$/);
    if (!m2b) return {start:null, end:null, kind:"bad"};
    d2 = Number(m2b[1]);
  }
  let start = ymd(fixedYear, mo1, d1);
  let end = ymd(fixedYear, mo2, d2);
  if (end < start) { const tmp = start; start = end; end = tmp; }
  return {start, end, kind:"range"};
}
export function* iterDatesInclusive(start, end) {
  for (let d = new Date(start); d <= end; d.setDate(d.getDate()+1)) yield new Date(d);
}
