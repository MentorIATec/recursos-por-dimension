export function number(value, max = Infinity) {
  if (value === '' || value === null || value === undefined || typeof value === 'boolean') return null;
  if (typeof value === 'string' && !value.trim()) return null;
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 && n <= max ? n : null;
}
export function courseResult(rows) {
  const weights = rows.map(r => number(r.weight, 100));
  const total = weights.reduce((sum, n) => sum + (n ?? 0), 0);
  const valid = rows.length > 0 && rows.every((r, i) => String(r.name || '').trim() && weights[i] !== null && number(r.grade, 100) !== null && ['obtained', 'expected'].includes(r.kind));
  const complete = valid && Math.abs(total - 100) < 0.000001;
  return { total, complete, value: complete ? rows.reduce((sum, r) => sum + Number(r.weight) * Number(r.grade) / 100, 0) : null, expected: rows.filter(r => r.kind === 'expected').length };
}
export function semesterResult(rows) {
  const credits = rows.reduce((sum, r) => sum + (number(r.credits, 100) ?? 0), 0);
  const valid = rows.length > 0 && rows.every(r => String(r.name || '').trim() && String(r.code || '').trim() && number(r.credits, 100) !== null && (Number(r.credits) === 0 || (number(r.grade, 100) !== null && ['obtained', 'expected'].includes(r.kind))));
  return { credits, complete: valid && credits > 0, value: valid && credits > 0 ? rows.reduce((sum, r) => sum + (Number(r.credits) === 0 ? 0 : Number(r.credits) * Number(r.grade)), 0) / credits : null, expected: rows.filter(r => Number(r.credits) > 0 && r.kind === 'expected').length };
}
