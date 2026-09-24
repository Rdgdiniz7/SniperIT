import type { Ativo } from '../tipos/Ativo';
import { sim } from './formatadores';
export const totalAtivos=(a:Ativo[])=>a.length;
export const ativosAtivos=(a:Ativo[])=>a.filter(x=>x.currentStatus.trim().toLowerCase()==='active').length;
export const obsoletos=(a:Ativo[])=>a.filter(x=>sim(x.isObsolete)).length;
export const precisaRevisao=(a:Ativo[])=>a.filter(x=>sim(x.needsReview)).length;
export const custoReposicao=(a:Ativo[])=>a.reduce((s,x)=>s+(x.replacementCost??0),0);
export function agrupar(a:Ativo[], campo:keyof Ativo){const m=new Map<string,number>();a.forEach(x=>{const k=String(x[campo]??'').trim()||'Não informado';m.set(k,(m.get(k)||0)+1)});return [...m].map(([name,value])=>({name,value})).sort((x,y)=>y.value-x.value)}
export function porAnoReposicao(a:Ativo[]){return agrupar(a,'plannedReplacementYear').filter(x=>x.name!=='Não informado').sort((x,y)=>x.name.localeCompare(y.name));}
