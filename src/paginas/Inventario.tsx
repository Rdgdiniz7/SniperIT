import{useMemo,useState}from'react';
import{Search,Eye,Pencil,Archive,FileSpreadsheet,FileText,Download,Upload,CheckSquare}from'lucide-react';
import{useInventario}from'../contextos/InventarioContext';
import{useSistema}from'../contextos/SistemaContext';
import{exportarExcel,exportarCsv,exportarPdf}from'../servicos/planilhaService';
import type{Ativo}from'../tipos/Ativo';

export default function Inventario({onDetalhes,onEditar,onNovo,onImportar}:{onDetalhes:(a:Ativo)=>void,onEditar:(a:Ativo)=>void,onNovo:()=>void,onImportar:()=>void}){
 const{ativos,inativar}=useInventario();const{usuario,registrar}=useSistema();
 const[q,setQ]=useState('');const[vendor,setVendor]=useState('todos');const[status,setStatus]=useState('todos');const[location,setLocation]=useState('todos');const[categoria,setCategoria]=useState('todos');
 const[selecionados,setSelecionados]=useState<Set<string>>(new Set());
 const lista=useMemo(()=>ativos.filter((a:any)=>!a.deletedAt).filter((a:any)=>(!q||[a.hostname,a.serialNumber,a.ipAddress,a.model,a.location,a.siteCode].join(' ').toLowerCase().includes(q.toLowerCase()))&&(vendor==='todos'||a.vendor===vendor)&&(status==='todos'||a.currentStatus===status)&&(location==='todos'||a.location===location)&&(categoria==='todos'||a.simpleDeviceCategory===categoria)),[ativos,q,vendor,status,location,categoria]);
 const valores=(campo:keyof Ativo)=>[...new Set(ativos.map((a:any)=>a[campo]).filter(Boolean))].sort();
 const visiveis=lista.map((a:Ativo)=>a.id);const todosMarcados=visiveis.length>0&&visiveis.every((id:string)=>selecionados.has(id));
 const selecionadosAtivos=ativos.filter((a:Ativo)=>selecionados.has(a.id));
 const marcar=(id:string)=>setSelecionados(s=>{const n=new Set(s);n.has(id)?n.delete(id):n.add(id);return n});
 const marcarTodos=()=>setSelecionados(s=>{
  const n=new Set(s);

  if(todosMarcados){
    visiveis.forEach((id:string)=>n.delete(id));
  }else{
    visiveis.forEach((id:string)=>n.add(id));
  }

  return n;
});
 const log=(formato:string)=>registrar({tipo:'EXPORTACAO',descricao:`${selecionadosAtivos.length} ativo(s) selecionado(s) exportados em ${formato}`});
 return <>
  <div className="page-title"><div><h1>Inventário CMDB</h1><p>{lista.length} equipamentos exibidos • selecione registros para exportação personalizada.</p></div><div className="page-actions"><button onClick={onImportar}><Upload/> Adicionar em massa</button><button className="primary" onClick={onNovo}>+ Adicionar ativo</button></div></div>
  <div className="panel filtros inventory-filters"><div className="search"><Search/><input placeholder="Hostname, serial, IP, modelo..." value={q} onChange={e=>setQ(e.target.value)}/></div><select value={location} onChange={e=>setLocation(e.target.value)}><option value="todos">Todas locations</option>{valores('location').map(v=><option key={String(v)}>{String(v)}</option>)}</select><select value={vendor} onChange={e=>setVendor(e.target.value)}><option value="todos">Todos fabricantes</option>{valores('vendor').map(v=><option key={String(v)}>{String(v)}</option>)}</select><select value={categoria} onChange={e=>setCategoria(e.target.value)}><option value="todos">Todas categorias</option>{valores('simpleDeviceCategory').map(v=><option key={String(v)}>{String(v)}</option>)}</select><select value={status} onChange={e=>setStatus(e.target.value)}><option value="todos">Todos status</option>{valores('currentStatus').map(v=><option key={String(v)}>{String(v)}</option>)}</select></div>
  <div className="selection-toolbar"><div><CheckSquare/><b>{selecionados.size}</b> selecionado(s)<span>Você pode filtrar, selecionar somente o necessário e extrair.</span></div><div><button disabled={!selecionados.size} onClick={()=>{exportarExcel(selecionadosAtivos);log('XLSX')}}><FileSpreadsheet/> XLSX</button><button disabled={!selecionados.size} onClick={()=>{exportarCsv(selecionadosAtivos);log('CSV')}}><Download/> CSV</button><button disabled={!selecionados.size} onClick={()=>{exportarPdf(selecionadosAtivos);log('PDF')}}><FileText/> PDF</button>{selecionados.size>0&&<button onClick={()=>setSelecionados(new Set())}>Limpar seleção</button>}</div></div>
  <div className="panel table-wrap"><table><thead><tr><th className="check-col"><input type="checkbox" checked={todosMarcados} onChange={marcarTodos} title="Selecionar todos os itens filtrados"/></th><th>Hostname</th><th>IP / MAC</th><th>Fabricante / Modelo</th><th>Categoria</th><th>Localização</th><th>Status</th><th>Review</th><th>Ações</th></tr></thead><tbody>{lista.map((a:any)=><tr key={a.id} className={selecionados.has(a.id)?'row-selected':''}><td className="check-col"><input type="checkbox" checked={selecionados.has(a.id)} onChange={()=>marcar(a.id)}/></td><td><b>{a.hostname||'-'}</b><small>{a.serialNumber}</small></td><td>{a.ipAddress||'-'}<small>{a.macAddress||'-'}</small></td><td>{a.vendor}<small>{a.model}</small></td><td>{a.simpleDeviceCategory||'-'}<small>{a.deviceGroup}</small></td><td>{a.location}<small>{a.country} • {a.siteCode}</small></td><td><span className={`badge ${a.currentStatus==='Ativo'||a.currentStatus==='Active'?'ok':''}`}>{a.currentStatus}</span></td><td>{a.dupHost?<span className="badge danger">DupHost</span>:<span className={`badge ${a.needsReview==='Yes'?'danger':'ok'}`}>{a.needsReview}</span>}</td><td className="acoes"><button title="Visualizar" onClick={()=>onDetalhes(a)}><Eye/></button><button title="Editar" onClick={()=>onEditar(a)}><Pencil/></button>{usuario?.perfil==='admin'&&<button title="Inativar (soft delete)" onClick={()=>confirm('Inativar este ativo? O histórico será preservado.')&&inativar(a.id)}><Archive/></button>}</td></tr>)}</tbody></table>{!lista.length&&<div className="empty">Nenhum ativo encontrado com os filtros atuais.</div>}</div>
 </>
}
