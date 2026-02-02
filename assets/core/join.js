import {dateKey, iterDatesInclusive} from "./period.js";

export function buildPosMap(posRows, colMap) {
  const map = new Map();
  let n = 0;
  for (const r of posRows) {
    const dateStr = (r[colMap.date] ?? "").toString().trim();
    const m = dateStr.match(/^(\d{4})年(\d{1,2})月(\d{1,2})日/);
    if (!m) continue;
    const d = new Date(Number(m[1]), Number(m[2])-1, Number(m[3]));
    const kDate = dateKey(d);
    const store_id = (r[colMap.store_id] ?? "").toString().replace(/\D/g,"").replace(/^0+/,"");
    const jan = (r[colMap.jan] ?? "").toString().replace(/\D/g,"");
    if (!store_id || !jan) continue;
    const qty = Number(String(r[colMap.sales_qty] ?? "0").replace(/,/g,"")) || 0;
    const amt = Number(String(r[colMap.sales_amt] ?? "0").replace(/,/g,"")) || 0;
    const k = `${store_id}|${jan}|${kDate}`;
    map.set(k, {qty, amt});
    n++;
  }
  return {map, scannedRows:n, keys: map.size};
}

export function aggregateByPeriod(periodRows, posMap) {
  const out = [];
  for (const r of periodRows) {
    const start = new Date(r.active_start);
    const end = new Date(r.active_end);
    if (isNaN(start) || isNaN(end)) continue;
    let days = 0, matched = 0, qtySum = 0, amtSum = 0;
    for (const d of iterDatesInclusive(start, end)) {
      days++;
      const dk = dateKey(d);
      const k = `${r.store_id}|${r.jan}|${dk}`;
      const hit = posMap.get(k);
      if (hit) { matched++; qtySum += hit.qty; amtSum += hit.amt; }
    }
    out.push({
      flyer_id: r.flyer_id,
      flyer_type: r.flyer_type,
      store_id: r.store_id,
      store_name: r.store_name,
      store_format: r.store_format,
      jan: r.jan,
      商品名: r.product_name ?? "",
      セールテーマ: r.sale_theme ?? "",
      period_start: r.active_start,
      period_end: r.active_end,
      days,
      matched_days: matched,
      sales_qty: qtySum,
      sales_amt: amtSum
    });
  }
  return out;
}
