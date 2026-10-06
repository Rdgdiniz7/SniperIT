import { useMemo, useState, useEffect } from 'react';
import { Search, Eye, Pencil, Archive, Truck, ChevronLeft, ChevronRight } from 'lucide-react';
import { useInventario } from '../contextos/InventarioContext';
import { useSistema } from '../contextos/SistemaContext';
import type { Ativo } from '../tipos/Ativo';

export default function Recebimento({
  onDetalhes,
  onEditar
}: {
  onDetalhes: (a: Ativo) => void;
  onEditar: (a: Ativo) => void;
}) {
  const { ativos, inativar } = useInventario();
  const { usuario } = useSistema();

  // Estados locais de busca e filtros
  const [textoBusca, setTextoBusca] = useState('');
  const [q, setQ] = useState('');
  const [vendor, setVendor] = useState('todos');
  const [location, setLocation] = useState('todos');

  // Configuração de Paginação
  const [paginaAtual, setPaginaAtual] = useState(1);
  const ITENS_POR_PAGINA = 50;

  // Debounce na busca (300ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setQ(textoBusca);
    }, 300);
    return () => clearTimeout(timer);
  }, [textoBusca]);

  // Reseta para a primeira página sempre que qualquer filtro mudar
  useEffect(() => {
    setPaginaAtual(1);
  }, [q, vendor, location]);

  // Filtragem dos novos dispositivos
  const lista = useMemo(() => {
    return ativos
      .filter((a: any) => !a.deletedAt)
      .filter(
        (a: any) =>
          (!q || [a.hostname, a.serialNumber, a.ipAddress, a.model, a.location, a.notes].join(' ').toLowerCase().includes(q.toLowerCase())) &&
          (vendor === 'todos' || a.vendor === vendor) &&
          (location === 'todos' || a.location === location)
      );
  }, [ativos, q, vendor, location]);

  // Cálculo e fatia para paginação
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
          <h1>New Devices / Recebimento</h1>
          <p>{lista.length} novos dispositivos registrados no sistema.</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="panel filtros inventory-filters">
        <div className="search">
          <Search />
          <input
            placeholder="Buscar por Hostname, Serial, IP, Modelo..."
            value={textoBusca}
            onChange={e => setTextoBusca(e.target.value)}
          />
        </div>
        <select value={location} onChange={e => setLocation(e.target.value)}>
          <option value="todos">Todas Localizações</option>
          {valores('location').map((v: any) => (
            <option key={String(v)}>{String(v)}</option>
          ))}
        </select>
        <select value={vendor} onChange={e => setVendor(e.target.value)}>
          <option value="todos">Todos Fabricantes</option>
          {valores('vendor').map((v: any) => (
            <option key={String(v)}>{String(v)}</option>
          ))}
        </select>
      </div>

      {/* Tabela de Dispositivos */}
      <div className="panel table-wrap">
        <table>
          <thead>
            <tr>
              <th>Hostname / Tag</th>
              <th>Fabricante / Modelo</th>
              <th>Localização</th>
              <th>Status</th>
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
                  <span className={`badge ${a.currentStatus === 'Ativo' || a.currentStatus === 'Disponível' ? 'ok' : 'warning'}`}>
                    {a.currentStatus || 'Novo'}
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

        {!lista.length && <div className="empty">Nenhum dispositivo encontrado com os filtros atuais.</div>}

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