import { useMemo, useState, useEffect } from 'react';
import {
  Search,
  Eye,
  Pencil,
  Archive,
  FileSpreadsheet,
  FileText,
  Download,
  Upload,
  CheckSquare,
  Tag,
  Layers,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  X,
  Filter
} from 'lucide-react';
import { useInventario } from '../contextos/InventarioContext';
import { useSistema } from '../contextos/SistemaContext';
import { exportarExcel, exportarCsv, exportarPdf } from '../servicos/planilhaService';
import type { Ativo } from '../tipos/Ativo';

type CampoOrdenacao = 'hostname' | 'vendor' | 'model' | 'location' | 'currentStatus' | 'notes';

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

  // Estados locais para a busca com debounce
  const [textoBusca, setTextoBusca] = useState('');
  const [q, setQ] = useState('');

  // Filtros aplicados
  const [vendor, setVendor] = useState('todos');
  const [status, setStatus] = useState('todos');
  const [location, setLocation] = useState('todos');
  const [categoria, setCategoria] = useState('todos');

  // Estados de Ordenação
  const [campoOrdenacao, setCampoOrdenacao] = useState<CampoOrdenacao>('hostname');
  const [ordemAscendente, setOrdemAscendente] = useState<boolean>(true);

  // Configuração de Paginação
  const [paginaAtual, setPaginaAtual] = useState(1);
  const ITENS_POR_PAGINA = 50;

  // Seleção múltipla (IDs como String)
  const [selecionados, setSelecionados] = useState<Set<string>>(new Set());

  // Campos para Ação em Massa
  const [bulkStatus, setBulkStatus] = useState('');
  const [bulkNote, setBulkNote] = useState('');

  // Modo de Exportação (Selecionados, Página Atual ou Todos os Filtrados)
  const [escopoExportacao, setEscopoExportacao] = useState<'selecionados' | 'pagina' | 'todos'>('todos');

  // Debounce no campo de busca (300ms)
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

  // Limpar Filtros
  const limparFiltros = () => {
    setTextoBusca('');
    setQ('');
    setVendor('todos');
    setStatus('todos');
    setLocation('todos');
    setCategoria('todos');
  };

  const temFiltroAtivo = Boolean(q || vendor !== 'todos' || status !== 'todos' || location !== 'todos' || categoria !== 'todos');

  // Otimização dos Dropdowns de Filtro
  const opcoesLocation = useMemo(() => [...new Set(ativos.map((a: any) => a.location).filter(Boolean))].sort(), [ativos]);
  const opcoesVendor = useMemo(() => [...new Set(ativos.map((a: any) => a.vendor).filter(Boolean))].sort(), [ativos]);
  const opcoesCategoria = useMemo(() => [...new Set(ativos.map((a: any) => a.simpleDeviceCategory).filter(Boolean))].sort(), [ativos]);
  const opcoesStatus = useMemo(() => [...new Set(ativos.map((a: any) => a.currentStatus).filter(Boolean))].sort(), [ativos]);

  // Processamento dos Dados: Filtro + Ordenação
  const listaFiltradaESort = useMemo(() => {
    const filtrados = ativos
      .filter((a: any) => !a.deletedAt)
      .filter(
        (a: any) =>
          (!q || [a.hostname, a.serialNumber, a.ipAddress, a.model, a.location, a.siteCode, a.notes].join(' ').toLowerCase().includes(q.toLowerCase())) &&
          (vendor === 'todos' || a.vendor === vendor) &&
          (status === 'todos' || a.currentStatus === status) &&
          (location === 'todos' || a.location === location) &&
          (categoria === 'todos' || a.simpleDeviceCategory === categoria)
      );

    return filtrados.sort((a: any, b: any) => {
      const valA = String(a[campoOrdenacao] || '').toLowerCase();
      const valB = String(b[campoOrdenacao] || '').toLowerCase();

      if (valA < valB) return ordemAscendente ? -1 : 1;
      if (valA > valB) return ordemAscendente ? 1 : -1;
      return 0;
    });
  }, [ativos, q, vendor, status, location, categoria, campoOrdenacao, ordemAscendente]);

  // Alternar coluna ou sentido da ordenação
  const handleSort = (campo: CampoOrdenacao) => {
    if (campoOrdenacao === campo) {
      setOrdemAscendente(!ordemAscendente);
    } else {
      setCampoOrdenacao(campo);
      setOrdemAscendente(true);
    }
  };

  const renderIconeOrdenacao = (campo: CampoOrdenacao) => {
    if (campoOrdenacao !== campo) return <ArrowUpDown size={13} style={{ opacity: 0.3, marginLeft: '4px' }} />;
    return ordemAscendente ? <ArrowUp size={13} style={{ marginLeft: '4px', color: '#60a5fa' }} /> : <ArrowDown size={13} style={{ marginLeft: '4px', color: '#60a5fa' }} />;
  };

  // Cálculo de Paginação
  const totalPaginas = Math.ceil(listaFiltradaESort.length / ITENS_POR_PAGINA) || 1;

  const listaExibida = useMemo(() => {
    const inicio = (paginaAtual - 1) * ITENS_POR_PAGINA;
    return listaFiltradaESort.slice(inicio, inicio + ITENS_POR_PAGINA);
  }, [listaFiltradaESort, paginaAtual]);

  // Gestão de Seleção
  const visiveis = useMemo(() => listaFiltradaESort.map((a: Ativo) => String(a.id)), [listaFiltradaESort]);
  const todosMarcados = visiveis.length > 0 && visiveis.every((id: string) => selecionados.has(id));

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

  // Ação em Massa
 // Ação em Massa (com registo dos dispositivos alterados)
  const handleAplicarEmMassa = async () => {
    if (selecionados.size === 0) return alert('Selecione ao menos um ativo.');
    if (!bulkStatus.trim() && !bulkNote.trim()) return alert('Selecione um status ou informe uma observação/vínculo.');

    // Obtém os Hostnames/Tags dos ativos selecionados
    const listaDispositivos = ativos
      .filter((a: Ativo) => selecionados.has(String(a.id)))
      .map((a: Ativo) => a.hostname || a.assetTag || `ID:${a.id}`);

    const resumoAtivos = listaDispositivos.length <= 3 
      ? listaDispositivos.join(', ') 
      : `${listaDispositivos.slice(0, 3).join(', ')} e mais ${listaDispositivos.length - 3}`;

    try {
      await atualizarEmMassa(Array.from(selecionados), bulkStatus, bulkNote);

      // Regista no histórico identificando os ativos específicos
      registrar({
        tipo: 'EDICAO',
        descricao: `Atualização em massa realizada em ${selecionados.size} ativo(s) [${resumoAtivos}]`
      });

      setSelecionados(new Set());
      setBulkStatus('');
      setBulkNote('');
      alert('Ativos atualizados com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar em massa:', error);
      alert('Ocorreu um erro ao salvar as alterações.');
    }
  };

  // Lógica de Exportação
  const obterDadosParaExportacao = () => {
    if (selecionados.size > 0) {
      return ativos.filter((a: Ativo) => selecionados.has(String(a.id)));
    }
    if (escopoExportacao === 'pagina') {
      return listaExibida;
    }
    return listaFiltradaESort;
  };

  const executarExportacao = (formato: 'XLSX' | 'CSV' | 'PDF') => {
    const dados = obterDadosParaExportacao();
    if (!dados.length) return alert('Nenhum dado para exportar com o filtro atual.');

    if (formato === 'XLSX') exportarExcel(dados);
    if (formato === 'CSV') exportarCsv(dados);
    if (formato === 'PDF') exportarPdf(dados);

    registrar({
      tipo: 'EXPORTACAO',
      descricao: `${dados.length} ativo(s) exportados em ${formato} (${selecionados.size > 0 ? 'Selecionados' : escopoExportacao === 'pagina' ? 'Página Atual' : 'Todos Filtrados'})`
    });
  };

  return (
    <>
      <div className="page-title">
        <div>
          <h1>Primeira Análise / Operações</h1>
          <p>
            Mostrando <b>{listaFiltradaESort.length}</b> de <b>{ativos.length}</b> ativos cadastrados.
          </p>
        </div>
        <div className="page-actions">
          <button onClick={onImportar} aria-label="Importar Lista de Ativos">
            <Upload size={16} /> Importar Lista
          </button>
          <button className="primary" onClick={onNovo} aria-label="Adicionar Novo Ativo">
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
            aria-label="Buscar ativos por texto"
          />
        </div>
        <select value={location} onChange={e => setLocation(e.target.value)} aria-label="Filtrar por Localização">
          <option value="todos">Todas Localizações</option>
          {opcoesLocation.map(v => (
            <option key={String(v)}>{String(v)}</option>
          ))}
        </select>
        <select value={vendor} onChange={e => setVendor(e.target.value)} aria-label="Filtrar por Fabricante">
          <option value="todos">Todos Fabricantes</option>
          {opcoesVendor.map(v => (
            <option key={String(v)}>{String(v)}</option>
          ))}
        </select>
        <select value={categoria} onChange={e => setCategoria(e.target.value)} aria-label="Filtrar por Categoria">
          <option value="todos">Todas Categorias</option>
          {opcoesCategoria.map(v => (
            <option key={String(v)}>{String(v)}</option>
          ))}
        </select>
        <select value={status} onChange={e => setStatus(e.target.value)} aria-label="Filtrar por Status">
          <option value="todos">Todos Status</option>
          {opcoesStatus.map(v => (
            <option key={String(v)}>{String(v)}</option>
          ))}
        </select>

        {/* Botão de Limpar Filtros */}
        {temFiltroAtivo && (
          <button
            onClick={limparFiltros}
            title="Limpar todos os filtros"
            aria-label="Limpar Filtros"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '6px 12px',
              background: 'rgba(239, 68, 68, 0.15)',
              color: '#ef4444',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '6px',
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
          >
            <X size={14} /> Limpar Filtros
          </button>
        )}
      </div>

      {/* Bar de Indicação de Filtro Ativo */}
      {temFiltroAtivo && (
        <div style={{ marginBottom: '12px', fontSize: '0.85em', opacity: 0.9, display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Filter size={14} style={{ color: '#60a5fa' }} />
          <span>
            <b>Filtros ativos:</b> Mostrando {listaFiltradaESort.length} de {ativos.length} ativos.
            {q && ` [Busca: "${q}"]`}
            {vendor !== 'todos' && ` [Fabricante: ${vendor}]`}
            {status !== 'todos' && ` [Status: ${status}]`}
            {location !== 'todos' && ` [Localização: ${location}]`}
            {categoria !== 'todos' && ` [Categoria: ${categoria}]`}
          </span>
        </div>
      )}

      {/* Toolbar de Ações em Massa e Exportação Flexível */}
      <div className="selection-toolbar" style={{ flexDirection: 'column', alignItems: 'stretch', gap: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <CheckSquare />
            <b>{selecionados.size}</b> ativo(s) selecionado(s)
          </div>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            {/* Seletor de Escopo de Exportação */}
            {selecionados.size === 0 && (
              <select
                value={escopoExportacao}
                onChange={e => setEscopoExportacao(e.target.value as any)}
                style={{ padding: '6px 10px', fontSize: '0.85em' }}
                aria-label="Escopo da exportação"
              >
                <option value="todos">Exportar: Todos Filtrados ({listaFiltradaESort.length})</option>
                <option value="pagina">Exportar: Página Atual ({listaExibida.length})</option>
              </select>
            )}

            <button onClick={() => executarExportacao('XLSX')} title="Exportar para Excel (.xlsx)" aria-label="Exportar XLSX">
              <FileSpreadsheet size={16} /> XLSX
            </button>
            <button onClick={() => executarExportacao('CSV')} title="Exportar para CSV (.csv)" aria-label="Exportar CSV">
              <Download size={16} /> CSV
            </button>
            <button onClick={() => executarExportacao('PDF')} title="Exportar para PDF (.pdf)" aria-label="Exportar PDF">
              <FileText size={16} /> PDF
            </button>

            {selecionados.size > 0 && (
              <button onClick={() => setSelecionados(new Set())} aria-label="Limpar Seleção">
                Limpar seleção
              </button>
            )}
          </div>
        </div>

        {/* Formulário de Ação Operacional em Massa */}
        {selecionados.size > 0 && (
          <div style={{ background: 'rgba(255,255,255,0.05)', padding: '12px', borderRadius: '6px', border: '1px dashed #ccc' }}>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
              <select value={bulkStatus} onChange={e => setBulkStatus(e.target.value)} style={{ padding: '6px' }} aria-label="Alterar Status em Lote">
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
                aria-label="Observação ou vínculo em lote"
              />

              <button className="primary" onClick={handleAplicarEmMassa} style={{ whiteSpace: 'nowrap' }} aria-label="Aplicar alterações nos selecionados">
                <Layers size={16} /> Aplicar nos Selecionados
              </button>
            </div>

            {/* Chips de preenchimento rápido */}
            <div style={{ marginTop: '8px', display: 'flex', gap: '8px', fontSize: '0.8em' }}>
              <span style={{ opacity: 0.8 }}>Atalhos:</span>
              <button style={{ padding: '2px 6px', cursor: 'pointer' }} onClick={() => setBulkNote(prev => (prev.startsWith('[CHG-2026]') ? prev : `[CHG-2026] ${prev}`))}>
                + Change
              </button>
              <button style={{ padding: '2px 6px', cursor: 'pointer' }} onClick={() => setBulkNote(prev => (prev.startsWith('[TASK-TSK]') ? prev : `[TASK-TSK] ${prev}`))}>
                + Task
              </button>
              <button style={{ padding: '2px 6px', cursor: 'pointer' }} onClick={() => setBulkStatus('Em Manutenção')}>
                Status Manutenção
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Tabela Operacional com Cabeçalho Ordenável */}
      <div className="panel table-wrap">
        <table>
          <thead>
            <tr>
              <th className="check-col">
                <input type="checkbox" checked={todosMarcados} onChange={marcarTodos} title="Selecionar todos os filtrados" aria-label="Selecionar Todos" />
              </th>
              <th onClick={() => handleSort('hostname')} style={{ cursor: 'pointer', userSelect: 'none' }} title="Clique para ordenar por Hostname">
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  Hostname / Tag {renderIconeOrdenacao('hostname')}
                </div>
              </th>
              <th>IP / MAC</th>
              <th onClick={() => handleSort('vendor')} style={{ cursor: 'pointer', userSelect: 'none' }} title="Clique para ordenar por Fabricante">
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  Fabricante / Modelo {renderIconeOrdenacao('vendor')}
                </div>
              </th>
              <th onClick={() => handleSort('location')} style={{ cursor: 'pointer', userSelect: 'none' }} title="Clique para ordenar por Localização">
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  Localização {renderIconeOrdenacao('location')}
                </div>
              </th>
              <th onClick={() => handleSort('currentStatus')} style={{ cursor: 'pointer', userSelect: 'none' }} title="Clique para ordenar por Status">
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  Status {renderIconeOrdenacao('currentStatus')}
                </div>
              </th>
              <th onClick={() => handleSort('notes')} style={{ cursor: 'pointer', userSelect: 'none' }} title="Clique para ordenar por Observação">
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  Observação / Chamado Vinculado {renderIconeOrdenacao('notes')}
                </div>
              </th>
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
                    <input type="checkbox" checked={estaSelecionado} onChange={() => marcar(idStr)} aria-label={`Selecionar ${a.hostname}`} />
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
                    <button title="Visualizar detalhes do ativo" onClick={() => onDetalhes(a)} aria-label={`Visualizar detalhes de ${a.hostname}`}>
                      <Eye size={16} />
                    </button>
                    <button title="Editar este ativo" onClick={() => onEditar(a)} aria-label={`Editar ${a.hostname}`}>
                      <Pencil size={16} />
                    </button>
                    {usuario?.perfil === 'admin' && (
                      <button
                        title="Inativar este ativo (Soft Delete)"
                        onClick={() => confirm('Inativar este ativo? O histórico será preservado.') && inativar(a.id)}
                        aria-label={`Inativar ${a.hostname}`}
                      >
                        <Archive size={16} />
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {!listaFiltradaESort.length && <div className="empty">Nenhum ativo encontrado com os filtros atuais.</div>}

        {/* Controles de Paginação */}
        {listaFiltradaESort.length > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
            <span style={{ fontSize: '0.9em', opacity: 0.8 }}>
              Mostrando {Math.min((paginaAtual - 1) * ITENS_POR_PAGINA + 1, listaFiltradaESort.length)} a {Math.min(paginaAtual * ITENS_POR_PAGINA, listaFiltradaESort.length)} de <b>{listaFiltradaESort.length}</b> ativos (Página {paginaAtual} de {totalPaginas})
            </span>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <button
                disabled={paginaAtual === 1}
                onClick={() => setPaginaAtual(p => Math.max(1, p - 1))}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '6px 12px', cursor: paginaAtual === 1 ? 'not-allowed' : 'pointer', opacity: paginaAtual === 1 ? 0.5 : 1 }}
                aria-label="Página Anterior"
              >
                <ChevronLeft size={16} /> Anterior
              </button>
              <button
                disabled={paginaAtual >= totalPaginas}
                onClick={() => setPaginaAtual(p => Math.min(totalPaginas, p + 1))}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '6px 12px', cursor: paginaAtual >= totalPaginas ? 'not-allowed' : 'pointer', opacity: paginaAtual >= totalPaginas ? 0.5 : 1 }}
                aria-label="Próxima Página"
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