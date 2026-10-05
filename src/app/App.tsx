import { useState } from 'react';
import Layout, { type Pagina } from '../componentes/layout/Layout';
import Dashboard from '../paginas/Dashboard';
import Inventario from '../paginas/Inventario';
import ImportarExportar from '../paginas/ImportarExportar';
import Obsolescencia from '../paginas/Obsolescencia';
import DetalhesAtivo from '../paginas/DetalhesAtivo';
import Historico from '../paginas/Historico';
import Catalogos from '../paginas/Catalogos';
import Sincronizacao from '../paginas/Sincronizacao';
import Usuarios from '../paginas/Usuarios';
import Contratos from '../paginas/Contratos';
import Descoberta from '../paginas/Descoberta';
import Recebimento from '../paginas/Recebimento';
import EditorAtivo from '../paginas/EditorAtivo';
import Login from '../paginas/Login';
import { InventarioProvider } from '../contextos/InventarioContext';
import { SistemaProvider, useSistema } from '../contextos/SistemaContext';
import type { Ativo } from '../tipos/Ativo';

function Sistema() {
  const s = useSistema();
  const [pagina, setPagina] = useState<Pagina>('dashboard');
  const [sel, setSel] = useState<Ativo | null>(null);

  if (!s.usuario) return <Login />;

  let c: any;
  switch (pagina) {
    case 'inventario':
      c = (
        <Inventario
          onDetalhes={a => {
            setSel(a);
            setPagina('detalhes');
          }}
          onEditar={a => {
            setSel(a);
            setPagina('editor');
          }}
          onNovo={() => {
            setSel(null);
            setPagina('novo');
          }}
          onImportar={() => setPagina('importacao')}
        />
      );
      break;
    case 'novo':
      c = <EditorAtivo onFim={() => setPagina('inventario')} />;
      break;
    case 'editor':
      c = <EditorAtivo ativo={sel} onFim={() => setPagina('inventario')} />;
      break;
    case 'importacao':
      c = <ImportarExportar />;
      break;
    case 'obsolescencia':
      c = <Obsolescencia />;
      break;
    case 'detalhes':
      c = sel ? (
        <DetalhesAtivo ativo={sel} onVoltar={() => setPagina('inventario')} />
      ) : (
        <Dashboard />
      );
      break;
    case 'historico':
      c = <Historico />;
      break;
    case 'catalogos':
      c = <Catalogos />;
      break;
    case 'sincronizacao':
      c = <Sincronizacao />;
      break;
    case 'usuarios':
      c = s.usuario.perfil === 'admin' ? <Usuarios /> : <Dashboard />;
      break;
    case 'contratos':
      c = <Contratos />;
      break;
    case 'descoberta':
      c = <Descoberta />;
      break;
    case 'recebimento':
      c = <Recebimento />;
      break;
    default:
      c = <Dashboard />;
  }

  return (
    <Layout pagina={pagina} onNavegar={setPagina}>
      {c}
    </Layout>
  );
}

export default function App() {
  return (
    <SistemaProvider>
      <InventarioProvider>
        <Sistema />
      </InventarioProvider>
    </SistemaProvider>
  );
}