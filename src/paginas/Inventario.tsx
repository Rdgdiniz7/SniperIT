import { useMemo, useState, useEffect } from 'react';
import { Search, Eye, Pencil, Archive, FileSpreadsheet, FileText, Download, Upload, CheckSquare, Tag, Layers, ChevronLeft, ChevronRight } from 'lucide-react';
import { useInventario } from '../contextos/InventarioContext';
import { useSistema } from '../contextos/SistemaContext';
import { exportarExcel, exportarCsv, exportarPdf } from '../servicos/planilhaService';
import type { Ativo } from '../tipos/Ativo';

export default function Inventario({
  onDetalhes,
  onEditar,
  onNovo,
  onImportar
}: {
  onDetalhes: (a: Ativo) => void;
  onEditar: (a: Ativo) => void;
  onNovo: () => void;
  onImportar: () => void;
}) {
  const { ativos, inativar, atualizarEmMassa } = useInventario();
  const { usuario, registrar } = useSistema();

  // Estado local para a digitação fluida (Debounce)
  const [textoBusca, setTextoBusca] = useState('');
  
  // Filtros aplicados
  const [q, setQ] = useState('');
  const [vendor, setVendor] = useState('todos');
  const [status, setStatus] = useState('todos');
  const [location, setLocation] = useState('todos');
  const [categoria, setCategoria] = useState('todos');

  // Configuração de Paginação
  const [paginaAtual, setPaginaAtual] = useState(1);
  const ITENS_POR_PAGINA = 50;

  // Seleção múltipla (IDs como String)
  const [selecionados, setSelecionados] = useState<Set<string>>(new Set());

  // Campos para Ação em Massa
  const [bulkStatus, setBulkStatus] = useState('');
  const [bulkNote, setBulkNote] = useState('');

  // Item 2: Debounce no campo de busca (300ms de atraso após parar de digitar)
  useEffect(() => {
    const timer = setTimeout(() => {
      setQ(textoBusca);
    }, 300);
    return () => clearTimeout(timer);
  }, [textoBusca]);

  // Reseta para a primeira página sempre que qualquer filtro mudar
  useEffect(() => {
    setPaginaAtual(1);
  }, [q, vendor, status, location, categoria]);

  const lista = useMemo(
    () =>
      ativos
        .filter((a: any) => !a.deletedAt)
        .filter(
          (a: any) =>
            (!q || [a.hostname, a.serialNumber, a.ipAddress, a.model, a.location, a.siteCode, a.notes].join(' ').toLowerCase().includes(q.toLowerCase())) &&
            (vendor === 'todos' || a.vendor === vendor) &&
            (status === 'todos' || a.currentStatus === status) &&
            (location === 'todos' || a.location === location) &&
            (categoria === 'todos' || a.simpleDeviceCategory === categoria)
        ),
    [ativos, q, vendor, status, location, categoria]
  );

  // Item 1: Cálculo e fatia dos dados para a página visível
  const totalPaginas = Math.ceil(lista.length / ITENS_POR_PAGINA) || 1;

  const listaExibida = useMemo(() => {
    const inicio = (paginaAtual - 1) * ITENS_POR_PAGINA;
    return lista.slice(inicio, inicio + ITENS_POR_PAGINA);
  }, [lista, paginaAtual]);

  const valores = (campo: keyof Ativo) => [...new Set(ativos.map((a: any) => a[campo]).filter(Boolean))].sort();

  // Normalização para Strings para evitar falhas de comparação
  const visiveis = useMemo(() => lista.map((a: Ativo) => String(a.id)), [lista]);
  const todosMarcados = visiveis.length > 0 && visiveis.every((id: string) => selecionados.has(id));
  const selecionadosAtivos = useMemo(
    () => ativos.filter((a: Ativo) => selecionados.has(String(a.id))),
    [ativos, selecionados]
  );

  const marcar = (id: string | number) => {
    const idStr = String(id);
    setSelecionados(s => {
      const n = new Set(s);
      n.has(idStr) ? n.delete(idStr) : n.add(idStr);
      return n;
    });
  };

  const marcarTodos = () => {
    setSelecionados(s => {
      const n = new Set(s);
      if (todosMarcados) {
        visiveis.forEach((id: string) => n.delete(id));
      } else {
        visiveis.forEach((id: string) => n.add(id));
      }
      return n;
    });
  };

  const handleAplicarEmMassa = async () => {
    if (selecionados.size === 0) return alert('Selecione ao menos um ativo.');
    if (!bulkStatus.trim() && !bulkNote.trim()) return alert('Selecione um status ou informe uma observação/vínculo.');

    try {
      await atualizarEmMassa(Array.from(selecionados), bulkStatus, bulkNote);
      
      // Limpar formulário de massa e seleções
      setSelecionados(new Set());
      setBulkStatus('');
      setBulkNote('');
      alert('Ativos atualizados com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar em massa:', error);
      alert('Ocorreu um erro ao salvar as alterações.');
    }
  };

  const log = (formato: string) =>
    registrar({
      tipo: 'EXPORTACAO',
      descricao: `${selecionadosAtivos.length} ativo(s) selecionado(s) exportados em ${formato}`
    });

  return (
    <>
      <div className="page-title">
        <div>
          <h1>Primeira Análise / Operações</h1>
          <p>{lista.length} ativos exibidos • Selecione múltiplos itens para vincular a Changes ou Tasks.</p>
        </div>
        <div className="page-actions">
          <button onClick={onImportar}>
            <Upload /> Importar Lista
          </button>
          <button className="primary" onClick={onNovo}>
            + Adicionar Ativo
          </button>
        </div>
      </div>

      {/* Painel de Filtros Operacionais */}
      <div className="panel filtros inventory-filters">
        <div className="search">
          <Search />
          <input
            placeholder="Hostname, Serial, IP, Change, Modelo..."
            value={textoBusca}
            onChange={e => setTextoBusca(e.target.value)}
          />
        </div>
        <select value={location} onChange={e => setLocation(e.target.value)}>
          <option value="todos">Todas Localizações</option>
          {valores('location').map(v => (
            <option key={String(v)}>{String(v)}</option>
          ))}
        </select>
        <select value={vendor} onChange={e => setVendor(e.target.value)}>
          <option value="todos">Todos Fabricantes</option>
          {valores('vendor').map(v => (
            <option key={String(v)}>{String(v)}</option>
          ))}
        </select>
        <select value={categoria} onChange={e => setCategoria(e.target.value)}>
          <option value="todos">Todas Categorias</option>
          {valores('simpleDeviceCategory').map(v => (
            <option key={String(v)}>{String(v)}</option>
          ))}
        </select>
        <select value={status} onChange={e => setStatus(e.target.value)}>
          <option value="todos">Todos Status</option>
          {valores('currentStatus').map(v => (
            <option key={String(v)}>{String(v)}</option>
          ))}
        </select>
      </div>

      {/* Toolbar de Ações em Massa */}
      <div className="selection-toolbar" style={{ flexDirection: 'column', alignItems: 'stretch', gap: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <CheckSquare />
            <b>{selecionados.size}</b> ativo(s) selecionado(s)
          </div>
          <div>
            <button disabled={!selecionados.size} onClick={() => { exportarExcel(selecionadosAtivos); log('XLSX'); }}>
              <FileSpreadsheet /> XLSX
            </button>
            <button disabled={!selecionados.size} onClick={() => { exportarCsv(selecionadosAtivos); log('CSV'); }}>
              <Download /> CSV
            </button>
            <button disabled={!selecionados.size} onClick={() => { exportarPdf(selecionadosAtivos); log('PDF'); }}>
              <FileText /> PDF
            </button>
            {selecionados.size > 0 && <button onClick={() => setSelecionados(new Set())}>Limpar seleção</button>}
          </div>
        </div>

        {/* Formulário de Ação Operacional em Massa */}
        {selecionados.size > 0 && (
          <div style={{ background: 'rgba(255,255,255,0.05)', padding: '12px', borderRadius: '6px', border: '1px dashed #ccc' }}>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
              <select value={bulkStatus} onChange={e => setBulkStatus(e.target.value)} style={{ padding: '6px' }}>
                <option value="">-- Alterar Status em Lote --</option>
                <option value="Em Change">Participando de Change</option>
                <option value="Em Manutenção">Em Manutenção</option>
                <option value="Reservado para Task">Reservado para Task</option>
                <option value="Disponível">Disponível</option>
                <option value="Ativo">Ativo</option>
              </select>

              <input
                type="text"
                placeholder="Observação / Vínculo (ex: CHG-2026-001 ou TASK-992)"
                value={bulkNote}
                onChange={e => setBulkNote(e.target.value)}
                style={{ flex: 1, minWidth: '240px', padding: '6px' }}
              />

              <button className="primary" onClick={handleAplicarEmMassa} style={{ whiteSpace: 'nowrap' }}>
                <Layers /> Aplicar nos Selecionados
              </button>
            </div>

            {/* Chips de preenchimento rápido */}
            <div style={{ marginTop: '8px', display: 'flex', gap: '8px', fontSize: '0.8em' }}>
              <span style={{ opacity: 0.8 }}>Atalhos:</span>
              <button style={{ padding: '2px 6px', cursor: 'pointer' }} onClick={() => setBulkNote(prev => prev.startsWith('[CHG-2026]') ? prev : `[CHG-2026] ${prev}`)}>
                + Change
              </button>
              <button style={{ padding: '2px 6px', cursor: 'pointer' }} onClick={() => setBulkNote(prev => prev.startsWith('[TASK-TSK]') ? prev : `[TASK-TSK] ${prev}`)}>
                + Task
              </button>
              <button style={{ padding: '2px 6px', cursor: 'pointer' }} onClick={() => setBulkStatus('Em Manutenção')}>
                Status Manutenção
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Tabela Operacional */}
      <div className="panel table-wrap">
        <table>
          <thead>
            <tr>
              <th className="check-col">
                <input type="checkbox" checked={todosMarcados} onChange={marcarTodos} title="Selecionar todos os filtrados" />
              </th>
              <th>Hostname / Tag</th>
              <th>IP / MAC</th>
              <th>Fabricante / Modelo</th>
              <th>Localização</th>
              <th>Status</th>
              <th>Observação / Chamado Vinculado</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {listaExibida.map((a: Ativo) => {
              const idStr = String(a.id);
              const estaSelecionado = selecionados.has(idStr);

              return (
                <tr key={idStr} className={estaSelecionado ? 'row-selected' : ''}>
                  <td className="check-col">
                    <input type="checkbox" checked={estaSelecionado} onChange={() => marcar(idStr)} />
                  </td>
                  <td>
                    <b>{a.hostname || '-'}</b>
                    <small>{a.serialNumber || a.assetTag}</small>
                  </td>
                  <td>
                    {a.ipAddress || '-'}
                    <small>{a.macAddress || '-'}</small>
                  </td>
                  <td>
                    {a.vendor}
                    <small>{a.model}</small>
                  </td>
                  <td>
                    {a.location}
                    <small>{a.siteCode ? `${a.country || ''} ${a.siteCode}` : a.country}</small>
                  </td>
                  <td>
                    <span className={`badge ${a.currentStatus === 'Ativo' || a.currentStatus === 'Disponível' ? 'ok' : 'warning'}`}>
                      {a.currentStatus}
                    </span>
                  </td>
                  <td>
                    {a.notes ? (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <Tag size={12} /> {a.notes}
                      </span>
                    ) : (
                      <small style={{ opacity: 0.5 }}>— Sem nota —</small>
                    )}
                  </td>
                  <td className="acoes">
                    <button title="Visualizar" onClick={() => onDetalhes(a)}>
                      <Eye />
                    </button>
                    <button title="Editar" onClick={() => onEditar(a)}>
                      <Pencil />
                    </button>
                    {usuario?.perfil === 'admin' && (
                      <button
                        title="Inativar (soft delete)"
                        onClick={() => confirm('Inativar este ativo? O histórico será preservado.') && inativar(a.id)}
                      >
                        <Archive />
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {!lista.length && <div className="empty">Nenhum ativo encontrado com os filtros atuais.</div>}

        {/* Controles de Paginação */}
        {lista.length > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
            <span style={{ fontSize: '0.9em', opacity: 0.8 }}>
              Mostrando {Math.min((paginaAtual - 1) * ITENS_POR_PAGINA + 1, lista.length)} a {Math.min(paginaAtual * ITENS_POR_PAGINA, lista.length)} de <b>{lista.length}</b> ativos (Página {paginaAtual} de {totalPaginas})
            </span>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <button
                disabled={paginaAtual === 1}
                onClick={() => setPaginaAtual(p => Math.max(1, p - 1))}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '6px 12px', cursor: paginaAtual === 1 ? 'not-allowed' : 'pointer', opacity: paginaAtual === 1 ? 0.5 : 1 }}
              >
                <ChevronLeft size={16} /> Anterior
              </button>
              <button
                disabled={paginaAtual >= totalPaginas}
                onClick={() => setPaginaAtual(p => Math.min(totalPaginas, p + 1))}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '6px 12px', cursor: paginaAtual >= totalPaginas ? 'not-allowed' : 'pointer', opacity: paginaAtual >= totalPaginas ? 0.5 : 1 }}
              >
                Próxima <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}