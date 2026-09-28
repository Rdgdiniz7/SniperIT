import { useMemo, useState } from 'react';
import { Package, Activity, AlertTriangle, ClipboardCheck, RefreshCw, Copy, CalendarClock, CircleDollarSign, RotateCcw } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { useInventario } from '../contextos/InventarioContext';
import { useSistema } from '../contextos/SistemaContext';

const vazio = 'Não informado';
const texto = (v: unknown) => String(v ?? '').trim() || vazio;
const anoAtual = new Date().getFullYear().toString();

function agrupar(lista: any[], campo: (a:any)=>unknown) {
  const mapa = new Map<string, number>();
  lista.forEach(a => { const k=texto(campo(a)); mapa.set(k,(mapa.get(k)||0)+1); });
  return [...mapa.entries()].map(([name,value])=>({name,value})).sort((a,b)=>b.value-a.value);
}
function moeda(v:number){return v.toLocaleString('pt-BR',{style:'currency',currency:'EUR',maximumFractionDigits:0})}

export default function Dashboard(){
  const {ativos}=useInventario(); const {historico}=useSistema();
  const base=useMemo(()=>ativos.filter((a:any)=>!a.deletedAt),[ativos]);
  const [pais,setPais]=useState('todos'),[local,setLocal]=useState('todos'),[grupo,setGrupo]=useState('todos'),[categoria,setCategoria]=useState('todos'),[vendor,setVendor]=useState('todos'),[status,setStatus]=useState('todos'),[ano,setAno]=useState('todos');
  const opcoes = (campo: (a: any) => unknown): string[] =>
  Array.from(new Set<string>(base.map(campo).map(texto))).sort();
  const filtrados=useMemo(()=>base.filter((a:any)=>(pais==='todos'||texto(a.country)===pais)&&(local==='todos'||texto(a.location)===local)&&(grupo==='todos'||texto(a.deviceGroup)===grupo)&&(categoria==='todos'||texto(a.simpleDeviceCategory)===categoria)&&(vendor==='todos'||texto(a.vendor)===vendor)&&(status==='todos'||texto(a.currentStatus)===status)&&(ano==='todos'||texto(a.plannedReplacementYear)===ano)),[base,pais,local,grupo,categoria,vendor,status,ano]);
  const limpar=()=>{setPais('todos');setLocal('todos');setGrupo('todos');setCategoria('todos');setVendor('todos');setStatus('todos');setAno('todos')};
  const ativosOk=filtrados.filter((a:any)=>['ativo','active'].includes(texto(a.currentStatus).toLowerCase())).length;
  const inativos=filtrados.filter((a:any)=>!['ativo','active'].includes(texto(a.currentStatus).toLowerCase())).length;
  const obs=filtrados.filter((a:any)=>texto(a.isObsolete).toLowerCase()==='yes').length;
  const rev=filtrados.filter((a:any)=>texto(a.needsReview).toLowerCase()==='yes').length;
  const dup=filtrados.filter((a:any)=>a.dupHost).length;
  const replAno=filtrados.filter((a:any)=>texto(a.plannedReplacementYear)===anoAtual).length;
  const custo=filtrados.reduce((s:number,a:any)=>s+(Number(a.replacementCost)||0),0);
  const porPais=agrupar(filtrados,a=>a.country).slice(0,10), porLocal=agrupar(filtrados,a=>a.location).slice(0,12), porStatus=agrupar(filtrados,a=>a.currentStatus).slice(0,12), porCat=agrupar(filtrados,a=>a.simpleDeviceCategory).slice(0,12), porGrupo=agrupar(filtrados,a=>a.deviceGroup).slice(0,10), porVendor=agrupar(filtrados,a=>a.vendor).slice(0,10);
  const porAno=agrupar(filtrados,a=>a.plannedReplacementYear).filter(x=>/^20\d{2}$/.test(x.name)).sort((a,b)=>a.name.localeCompare(b.name));
  const financeiroAno=porAno.map(x=>({name:x.name,quantidade:x.value,custo:filtrados.filter((a:any)=>texto(a.plannedReplacementYear)===x.name).reduce((s:number,a:any)=>s+(Number(a.replacementCost)||0),0)}));
  const obsol=[{name:'Obsoleto',value:obs},{name:'Não obsoleto',value:Math.max(0,filtrados.length-obs)}];
  const qualidade=[{name:'Needs Review',value:rev},{name:'Duplicados',value:dup},{name:'Sem IP',value:filtrados.filter((a:any)=>!String(a.ipAddress||'').trim()).length},{name:'Sem Serial',value:filtrados.filter((a:any)=>!String(a.serialNumber||'').trim()).length},{name:'Sem Modelo',value:filtrados.filter((a:any)=>!String(a.model||'').trim()).length},{name:'Sem Location',value:filtrados.filter((a:any)=>!String(a.location||'').trim()).length}];
  const BarPanel=({titulo,dados}:{titulo:string,dados:any[]})=><div className="panel"><h2>{titulo}</h2><div className="chart"><ResponsiveContainer width="100%" height="100%"><BarChart data={dados} layout="vertical" margin={{left:10,right:20}}><CartesianGrid strokeDasharray="3 3" horizontal={false}/><XAxis type="number" allowDecimals={false}/><YAxis dataKey="name" type="category" width={125} tick={{fontSize:11}}/><Tooltip formatter={(v:any)=>[v,'Equipamentos']}/><Bar dataKey="value" fill="#2563eb" radius={[0,5,5,0]}/></BarChart></ResponsiveContainer></div></div>;
  return <>
    <div className="page-title"><div><h1>Dashboard CMDB</h1><p>Visão executiva e operacional do inventário de rede.</p></div><div className="live"><span></span> Dados recalculados em tempo real</div></div>
    <div className="panel dashboard-filters"><div className="filter-head"><div><b>Filtros globais</b><small>Todos os indicadores e gráficos abaixo seguem estes filtros.</small></div><button onClick={limpar}><RotateCcw/> Limpar filtros</button></div><div className="dashboard-filter-grid">
      <select value={pais} onChange={e=>setPais(e.target.value)}><option value="todos">Todos os países</option>{opcoes(a=>a.country).map(x=><option key={x}>{x}</option>)}</select>
      <select value={local} onChange={e=>setLocal(e.target.value)}><option value="todos">Todas as locations</option>{opcoes(a=>a.location).map(x=><option key={x}>{x}</option>)}</select>
      <select value={grupo} onChange={e=>setGrupo(e.target.value)}><option value="todos">Todos Device Groups</option>{opcoes(a=>a.deviceGroup).map(x=><option key={x}>{x}</option>)}</select>
      <select value={categoria} onChange={e=>setCategoria(e.target.value)}><option value="todos">Todas as categorias</option>{opcoes(a=>a.simpleDeviceCategory).map(x=><option key={x}>{x}</option>)}</select>
      <select value={vendor} onChange={e=>setVendor(e.target.value)}><option value="todos">Todos fabricantes</option>{opcoes(a=>a.vendor).map(x=><option key={x}>{x}</option>)}</select>
      <select value={status} onChange={e=>setStatus(e.target.value)}><option value="todos">Todos os status</option>{opcoes(a=>a.currentStatus).map(x=><option key={x}>{x}</option>)}</select>
      <select value={ano} onChange={e=>setAno(e.target.value)}><option value="todos">Todos Planned Years</option>{opcoes(a=>a.plannedReplacementYear).map(x=><option key={x}>{x}</option>)}</select>
    </div><div className="filter-result">Exibindo <b>{filtrados.length.toLocaleString('pt-BR')}</b> de {base.length.toLocaleString('pt-BR')} ativos.</div></div>
    <div className="cards cards-8">
      <div className="metric"><div className="metric-icon"><Package/></div><div><span>Total filtrado</span><strong>{filtrados.length.toLocaleString('pt-BR')}</strong></div></div>
      <div className="metric"><div className="metric-icon"><Activity/></div><div><span>Ativos</span><strong>{ativosOk.toLocaleString('pt-BR')}</strong></div></div>
      <div className="metric"><div className="metric-icon"><RefreshCw/></div><div><span>Outros status</span><strong>{inativos.toLocaleString('pt-BR')}</strong></div></div>
      <div className="metric"><div className="metric-icon danger-icon"><AlertTriangle/></div><div><span>Obsoletos</span><strong>{obs.toLocaleString('pt-BR')}</strong></div></div>
      <div className="metric"><div className="metric-icon warn-icon"><ClipboardCheck/></div><div><span>Needs Review</span><strong>{rev.toLocaleString('pt-BR')}</strong></div></div>
      <div className="metric"><div className="metric-icon warn-icon"><Copy/></div><div><span>Duplicados</span><strong>{dup.toLocaleString('pt-BR')}</strong></div></div>
      <div className="metric"><div className="metric-icon"><CalendarClock/></div><div><span>Replacement {anoAtual}</span><strong>{replAno.toLocaleString('pt-BR')}</strong></div></div>
      <div className="metric"><div className="metric-icon"><CircleDollarSign/></div><div><span>Replacement Cost</span><strong className="money-metric">{moeda(custo)}</strong></div></div>
    </div>
    <div className="grid2"><BarPanel titulo="Equipamentos por Location" dados={porLocal}/><BarPanel titulo="Status operacional" dados={porStatus}/></div>
    <div className="grid2"><BarPanel titulo="Simple Device Category" dados={porCat}/><BarPanel titulo="Device Group" dados={porGrupo}/></div>
    <div className="grid2"><BarPanel titulo="Equipamentos por País / Região" dados={porPais}/><BarPanel titulo="Fabricantes" dados={porVendor}/></div>
    <div className="panel"><h2>Planejamento de Replacement</h2><p className="panel-subtitle">Quantidade de equipamentos e custo de substituição por Planned Replacement Year.</p><div className="chart replacement-chart"><ResponsiveContainer width="100%" height="100%"><BarChart data={financeiroAno}><CartesianGrid strokeDasharray="3 3"/><XAxis dataKey="name"/><YAxis yAxisId="qtd" allowDecimals={false}/><YAxis yAxisId="custo" orientation="right" tickFormatter={(v)=>`${Math.round(v/1000)}k`}/><Tooltip formatter={(v:any,n:any)=>n==='custo'?[moeda(Number(v)),'Replacement Cost']:[v,'Equipamentos']}/><Legend/><Bar yAxisId="qtd" dataKey="quantidade" name="Equipamentos" fill="#2563eb" radius={[5,5,0,0]}/><Bar yAxisId="custo" dataKey="custo" name="Replacement Cost" fill="#7c3aed" radius={[5,5,0,0]}/></BarChart></ResponsiveContainer></div></div>
    <div className="grid2"><div className="panel"><h2>Obsolescência</h2><div className="chart pequeno"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={obsol} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={3}>{obsol.map((_,i)=><Cell key={i} fill={i===0?'#dc2626':'#16a34a'}/>)}</Pie><Tooltip/><Legend/></PieChart></ResponsiveContainer></div></div><div className="panel"><h2>Qualidade da base</h2><div className="quality-list">{qualidade.map(q=><div key={q.name}><span>{q.name}</span><b className={q.value?'q-warn':'q-ok'}>{q.value.toLocaleString('pt-BR')}</b></div>)}</div></div></div>
    <div className="panel"><h2>Últimas movimentações</h2><p className="panel-subtitle">Eventos mais recentes de inclusão, edição, importação, inativação e sincronização.</p><div className="timeline dashboard-history">{historico.slice(0,10).map((h:any)=><div className="event" key={h.id}><div><b>{h.descricao}</b><p>{h.usuario}{h.hostname?` • ${h.hostname}`:''}</p><small>{new Date(h.data).toLocaleString('pt-BR')}</small></div></div>)}{!historico.length&&<div className="empty">As movimentações aparecerão aqui automaticamente.</div>}</div></div>
  </>;
}
