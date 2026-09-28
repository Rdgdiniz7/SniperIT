import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode
} from 'react';

import type { Ativo } from '../tipos/Ativo';
import { ativosExemplo } from '../dados/ativosExemplo';
import {
  marcarDuplicados,
  atualizarObsolescencia
} from '../utilitarios/regrasNegocio';
import { useSistema } from './SistemaContext';
import { buscarAtivosSnipe } from '../servicos/snipeService';

const CHAVE = 'sniper-it-inventario-v2';

const C = createContext<any>(null);

function inicial() {
  try {
    return JSON.parse(localStorage.getItem(CHAVE) || '') || ativosExemplo;
  } catch {
    return ativosExemplo;
  }
}

export function InventarioProvider({
  children
}: {
  children: ReactNode;
}) {
  const [ativos, setAtivos] = useState<Ativo[]>(inicial);

  const [sincronizando, setSincronizando] = useState(false);

  const sis = useSistema();

  const salvar = (a: Ativo[]) => {
    const x = marcarDuplicados(
      a.map(atualizarObsolescencia)
    );

    setAtivos(x);

    localStorage.setItem(
      CHAVE,
      JSON.stringify(x)
    );

    return x;
  };

  const sincronizarSnipe = async () => {
    try {
      setSincronizando(true);

      const ativosSnipe = await buscarAtivosSnipe();

      salvar(ativosSnipe);

      sis.registrar({
        tipo: 'SINCRONIZACAO',
        descricao: 'Sincronização com Snipe-IT concluída',
        detalhes: `${ativosSnipe.length} ativos recebidos da API`
      });

      return {
        sucesso: true,
        quantidade: ativosSnipe.length
      };

    } catch (erro: any) {

      console.error(
        'Erro na sincronização:',
        erro
      );

      sis.registrar({
        tipo: 'SINCRONIZACAO',
        descricao: 'Falha na sincronização com Snipe-IT',
        detalhes: erro?.message || 'Erro desconhecido'
      });

      throw erro;

    } finally {
      setSincronizando(false);
    }
  };

  const adicionarUm = (a: Ativo) => {

    const novo = {
      ...a,

      id:
        a.id ||
        crypto.randomUUID(),

      createdAt:
        new Date().toISOString(),

      updatedAt:
        new Date().toISOString(),

      createdBy:
        sis.usuario?.nome ||
        'Sistema',

      origem:
        a.origem ||
        'Manual',

      needsReview:
        a.origem === 'Manual'
          ? 'Yes'
          : a.needsReview
    };

    salvar([
      ...ativos,
      novo
    ]);

    sis.registrar({
      tipo: 'ADICAO',
      ativoId: novo.id,
      hostname: novo.hostname,
      descricao:
        `Ativo ${novo.hostname || novo.serialNumber} adicionado`,
      detalhes:
        `Origem: ${novo.origem}`
    });
  };

  const atualizar = (a: Ativo) => {

    salvar(
      ativos.map(x =>
        x.id === a.id
          ? {
              ...a,
              updatedAt:
                new Date().toISOString()
            }
          : x
      )
    );

    sis.registrar({
      tipo: 'EDICAO',
      ativoId: a.id,
      hostname: a.hostname,
      descricao:
        `Ativo ${a.hostname || a.serialNumber} atualizado`
    });
  };

  const inativar = (id: string) => {

    const a = ativos.find(
      x => x.id === id
    );

    if (!a) return;

    salvar(
      ativos.map(x =>
        x.id === id
          ? {
              ...x,

              currentStatus:
                'Deleted / Out of Service',

              deletedAt:
                new Date().toISOString(),

              deletedBy:
                sis.usuario?.nome ||
                'Sistema',

              updatedAt:
                new Date().toISOString()
            }
          : x
      )
    );

    sis.registrar({
      tipo: 'INATIVACAO',
      ativoId: id,
      hostname: a.hostname,
      descricao:
        `Ativo ${a.hostname || a.serialNumber} inativado (soft delete)`
    });
  };

  const valor = useMemo(
    () => ({
      ativos,

      sincronizando,

      sincronizarSnipe,

      substituir: salvar,

      adicionar: (novos: Ativo[]) =>
        salvar([
          ...ativos,
          ...novos
        ]),

      adicionarUm,

      atualizar,

      inativar,

      restaurarExemplo: () =>
        salvar(ativosExemplo)
    }),

    [
      ativos,
      sincronizando,
      sis.usuario,
      sis.historico
    ]
  );

  return (
    <C.Provider value={valor}>
      {children}
    </C.Provider>
  );
}

export function useInventario() {
  return useContext(C);
}