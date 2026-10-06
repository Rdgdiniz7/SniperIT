import { useMemo, useState, useEffect } from 'react';
import { Search, Eye, Pencil, Archive, AlertTriangle, ChevronLeft, ChevronRight } from 'lucide-react';
import { useInventario } from '../contextos/InventarioContext';
import { useSistema } from '../contextos/SistemaContext';
import type { Ativo } from '../tipos/Ativo';

export default function Obsolescencia({
  onDetalhes,
  onEditar
}: {
  onDetalhes: (a: Ativo) => void;
  onEditar: (a: Ativo) => void;
}) {
  const { ativos, inativar } = useInventario();
  const { usuario } = useSistema();

  // Estados de busca e filtros
  const [textoBusca, setTextoBusca] = useState('');
  const [q, setQ] = useState('');
  const [vendor, setVendor] = useState('todos');
  const [status, setStatus] = useState('todos');

  // Configuração da Paginação
  const [paginaAtual, setPaginaAtual] = useState(1);
  const ITENS_POR_PAGINA = 50;

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
  }, [q, vendor, status]);

  // Lista de ativos obsoletos / críticos
  const lista = useMemo(() => {
    return ativos
      .filter((a: any) => !a.deletedAt)
      .filter((a: any) => a.isObsolete || a.obsolescenciaStatus || a.needsReview === 'Yes')
      .filter(
        (a: any) =>
          (!q || [a.hostname, a.serialNumber, a.ipAddress, a.model, a.location, a.notes].join(' ').toLowerCase().includes(q.toLowerCase())) &&
          (vendor === 'todos' || a.vendor === vendor) &&
          (status === 'todos' || a.currentStatus === status)
      );
  }, [ativos, q, vendor, status]);

  // Cálculo da paginação
  const totalPaginas = Math.ceil(lista.length / ITENS_POR_PAGINA) || 1;

  const listaExibida = useMemo(() => {
    const inicio = (paginaAtual - 1) * ITENS_POR_PAGINA;
    return lista.slice(inicio, inicio + ITENS_POR_PAGINA);
  }, [lista, paginaAtual]);

  const valores = (campo: string) =>
    [...new Set(ativos.map((a: any) => a[campo]).filter(Boolean))].sort();

  return (
    <>
      <div className="page-title">
        <div>
          <h1>Análise de Obsolescência</h1>
          <p>{lista.length} ativos em atenção ou próximos do ciclo de fim de vida (EOL/EOS).</p>
        </div>
      </div>

      {/* Painel de Filtros */}
      <div className="panel filtros inventory-filters">
        <div className="search">
          <Search />
          <input
            placeholder="Buscar hostname, serial, modelo..."
            value={textoBusca}
            onChange={e => setTextoBusca(e.target.value)}
          />
        </div>
        <select value={vendor} onChange={e => setVendor(e.target.value)}>
          <option value="todos">Todos Fabricantes</option>
          {valores('vendor').map((v: any) => (
            <option key={String(v)}>{String(v)}</option>
          ))}
        </select>
        <select value={status} onChange={e => setStatus(e.target.value)}>
          <option value="todos">Todos Status</option>
          {valores('currentStatus').map((v: any) => (
            <option key={String(v)}>{String(v)}</option>
          ))}
        </select>
      </div>

      {/* Tabela de Obsolescência */}
      <div className="panel table-wrap">
        <table>
          <thead>
            <tr>
              <th>Hostname / Tag</th>
              <th>Fabricante / Modelo</th>
              <th>Localização</th>
              <th>Status</th>
              <th>Diagnóstico / Fim de Vida</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {listaExibida.map((a: any) => (
              <tr key={String(a.id)}>
                <td>
                  <b>{a.hostname || '-'}</b>
                  <small>{a.serialNumber || a.assetTag}</small>
                </td>
                <td>
                  {a.vendor}
                  <small>{a.model}</small>
                </td>
                <td>{a.location}</td>
                <td>
                  <span className="badge warning">{a.currentStatus}</span>
                </td>
                <td>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#f59e0b', fontWeight: 500 }}>
                    <AlertTriangle size={14} />
                    {a.obsolescenciaStatus || 'Revisão Necessária'}
                  </span>
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
                      title="Inativar"
                      onClick={() => confirm('Inativar este ativo?') && inativar(a.id)}
                    >
                      <Archive />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {!lista.length && <div className="empty">Nenhum ativo obsoleto encontrado com os filtros atuais.</div>}

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