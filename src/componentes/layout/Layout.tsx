import type { ReactNode } from 'react';
import {
  LayoutDashboard,
  Network,
  Upload,
  CalendarClock,
  Menu,
  X,
  History,
  Tags,
  RefreshCw,
  Users,
  FileCheck,
  ScanLine,
  Truck,
  LogOut,
  PlusCircle
} from 'lucide-react';
import { useState } from 'react';
import { useSistema } from '../../contextos/SistemaContext';

// Importação do logótipo da Stellantis (certifique-se de salvar o ficheiro na pasta src/assets/)
// @ts-ignore
import logoStellantis from '../../assets/logo-stellantis.png';

export type Pagina =
  | 'dashboard'
  | 'inventario'
  | 'novo'
  | 'editor'
  | 'importacao'
  | 'obsolescencia'
  | 'detalhes'
  | 'historico'
  | 'catalogos'
  | 'sincronizacao'
  | 'usuarios'
  | 'contratos'
  | 'descoberta'
  | 'recebimento';

const grupos = [
  ['VISÃO GERAL', [['dashboard', 'Dashboard', LayoutDashboard]]],
  ['INVENTÁRIO', [['inventario', 'Ativos', Network], ['novo', 'Adicionar Ativo', PlusCircle]]],
  ['PLANEJAMENTO', [['obsolescencia', 'Obsolescência / Refresh', CalendarClock]]],
  ['CONTROLE', [['historico', 'Histórico', History], ['contratos', 'Contratos / Garantias', FileCheck], ['recebimento', 'New Devices', Truck]]],
  ['DADOS', [['importacao', 'Importar / Exportar', Upload], ['descoberta', 'Descoberta SNMP/ICMP', ScanLine], ['sincronizacao', 'Sincronização Snipe-IT', RefreshCw], ['catalogos', 'Catálogos', Tags]]]
] as any;

export default function Layout({
  pagina,
  onNavegar,
  children
}: {
  pagina: Pagina;
  onNavegar: (p: Pagina) => void;
  children: ReactNode;
}) {
  const [aberto, setAberto] = useState(false);
  const s = useSistema();

  return (
    <div className="app-shell">
      <aside className={`sidebar ${aberto ? 'aberto' : ''}`}>
        {/* Cabeçalho da Barra Lateral com Logótipo Stellantis */}
        <div className="brand">
          <div className="stellantis-logo-badge">
            <img src={logoStellantis} alt="Stellantis" className="stellantis-logo" />
          </div>
          <div>
            <strong>Sniper IT CMDB</strong>
            <span>Network Asset Management</span>
          </div>
          <button className="icon mobile" onClick={() => setAberto(false)}>
            <X />
          </button>
        </div>

        <nav>
          {grupos.map(([g, itens]: any) => (
            <div className="nav-group" key={g}>
              <small>{g}</small>
              {itens.map(([id, label, Icon]: any) => (
                <button
                  key={id}
                  className={pagina === id ? 'ativo' : ''}
                  onClick={() => {
                    onNavegar(id);
                    setAberto(false);
                  }}
                >
                  <Icon />
                  <span>{label}</span>
                </button>
              ))}
            </div>
          ))}

          {s.usuario?.perfil === 'admin' && (
            <div className="nav-group">
              <small>ADMINISTRAÇÃO</small>
              <button
                className={pagina === 'usuarios' ? 'ativo' : ''}
                onClick={() => onNavegar('usuarios')}
              >
                <Users />
                <span>Usuários</span>
              </button>
            </div>
          )}
        </nav>

        <div className="user-card">
          <div className="avatar">
            {s.usuario?.nome?.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <b>{s.usuario?.nome}</b>
            <span>
              {s.usuario?.perfil === 'admin' ? 'Administrador' : 'Funcionário'}
            </span>
          </div>
          <button className="icon" title="Sair" onClick={s.logout}>
            <LogOut />
          </button>
        </div>
      </aside>

      <main>
        <header className="topbar">
          <button className="icon mobile" onClick={() => setAberto(true)}>
            <Menu />
          </button>
          <div>
            <b>Sniper IT CMDB</b>
            <span>Inventário de infraestrutura de rede</span>
          </div>
          <div className="top-user">{s.usuario?.email}</div>
        </header>

        <div className="conteudo">{children}</div>
      </main>
    </div>
  );
}