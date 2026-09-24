export const texto = (valor: unknown) => valor === null || valor === undefined || String(valor).trim() === '' ? '—' : String(valor);
export const moeda = (valor: number | null) => valor == null ? '—' : valor.toLocaleString('pt-BR',{style:'currency',currency:'EUR'});
export const sim = (valor: string) => ['yes','sim','true','1'].includes((valor || '').trim().toLowerCase());
export function numeroMoeda(valor: unknown): number | null {
  if (valor === null || valor === undefined || valor === '') return null;
  if (typeof valor === 'number') return valor;
  let s = String(valor).trim().replace(/[€$£R$\s]/g,'');
  if (!s) return null;
  if (s.includes(',') && s.includes('.')) s = s.lastIndexOf(',') > s.lastIndexOf('.') ? s.replace(/\./g,'').replace(',','.') : s.replace(/,/g,'');
  else if (s.includes(',')) s = s.replace(',','.');
  const n = Number(s); return Number.isFinite(n) ? n : null;
}
