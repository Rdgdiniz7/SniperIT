import { useMemo, useState } from 'react';
import { History, Search, Cpu, RefreshCw, AlertTriangle, CheckCircle, Edit3 } from 'lucide-react';
import { useSistema } from '../contextos/SistemaContext';

export default function Historico() {
  const { historico } = useSistema();
  const [busca, setTextoBusca] = useState('');

  // Filtra logs por busca
  const logsFiltrados = useMemo(() => {
    return historico.filter((item: any) =>
      [item.descricao, item.usuario, item.tipo].join(' ').toLowerCase().includes(busca.toLowerCase())
    );
  }, [historico, busca]);

  // Renderiza ícone de acordo com o tipo de operação
  const getIcone = (tipo: string, descricao: string) => {
    if (descricao?.toLowerCase().includes('erro') || descricao?.toLowerCase().includes('falha')) {
      return <AlertTriangle size={18} style={{ color: '#ef4444' }} />;
    }
    switch (tipo) {
      case 'SINCRONIZACAO':
        return <RefreshCw size={18} style={{ color: '#3b82f6' }} />;
      case 'EDICAO':
        return <Edit3 size={18} style={{ color: '#f59e0b' }} />;
      default:
        return <History size={18} style={{ color: '#64748b' }} />;
    }
  };

  // Extrai o texto padrão e os Hostnames/Identificadores marcados com [...]
  const formatarDescricao = (descricao: string) => {
    const match = descricao.match(/(.*?)\[(.*?)\](.*)/);
    if (!match) return <span>{descricao}</span>;

    const [, textoInicial, dispositivos, textoFinal] = match;
    const listaTags = dispositivos.split(',').map(d => d.trim());

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '2px' }}>
        <span>{textoInicial} {textoFinal}</span>
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '2px' }}>
          {listaTags.map((tag, idx) => (
            <span
              key={idx}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '2px 8px',
                borderRadius: '4px',
                fontSize: '0.78rem',
                fontWeight: 600,
                background: 'rgba(59, 130, 246, 0.1)',
                color: '#2563eb',
                border: '1px solid rgba(59, 130, 246, 0.2)'
              }}
            >
              <Cpu size={12} /> {tag}
            </span>
          ))}
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="page-title">
        <div>
          <h1>Histórico e Auditoria</h1>
          <p>Trilha de movimentações e edições registradas no CMDB.</p>
        </div>
      </div>

      {/* Busca no Histórico */}
      <div className="panel filtros inventory-filters" style={{ marginBottom: '16px' }}>
        <div className="search">
          <Search size={16} />
          <input
            placeholder="Buscar por dispositivo, usuário ou ação..."
            value={busca}
            onChange={e => setTextoBusca(e.target.value)}
          />
        </div>
      </div>

      {/* Lista de Registros */}
      <div className="panel" style={{ padding: '0' }}>
        {logsFiltrados.length === 0 ? (
          <div className="empty" style={{ padding: '32px' }}>
            Nenhum registro encontrado no histórico.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {logsFiltrados.map((item: any, index: number) => (
              <div
                key={item.id || index}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '14px',
                  padding: '16px 20px',
                  borderBottom: index < logsFiltrados.length - 1 ? '1px solid rgba(226, 232, 240, 0.8)' : 'none'
                }}
              >
                <div
                  style={{
                    padding: '8px',
                    borderRadius: '8px',
                    background: 'rgba(241, 245, 249, 0.8)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  {getIcone(item.tipo, item.descricao)}
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.95rem', color: '#1e293b' }}>
                    {formatarDescricao(item.descricao)}
                  </div>
                  <div style={{ fontSize: '0.8rem', opacity: 0.75, marginTop: '4px' }}>
                    <b style={{ color: '#475569' }}>{item.tipo}</b> • {item.usuario || 'Sistema'}
                  </div>
                </div>

                <div style={{ fontSize: '0.8rem', opacity: 0.6, whiteSpace: 'nowrap' }}>
                  {item.data || item.timestamp || item.created_at}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}