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

const InventarioContext = createContext<any>(null);

function carregarInicial(): Ativo[] {
  try {
    const dadosSalvos = localStorage.getItem(CHAVE);
    if (!dadosSalvos) return ativosExemplo;
    const parseados = JSON.parse(dadosSalvos);
    return Array.isArray(parseados) && parseados.length > 0 ? parseados : ativosExemplo;
  } catch {
    return ativosExemplo;
  }
}

export function InventarioProvider({ children }: { children: ReactNode }) {
  const [ativos, setAtivos] = useState<Ativo[]>(carregarInicial);
  const [sincronizando, setSincronizando] = useState(false);
  const sis = useSistema();

  // Função interna para persistir o array completo com validação de segurança
  const salvarArrayCompleto = (listaCompleta: Ativo[]): Ativo[] => {
    if (!Array.isArray(listaCompleta)) {
      console.error('Erro de segurança: tentativa de salvar dados não em formato de lista.');
      return ativos;
    }

    const comObsolescencia = listaCompleta.map(atualizarObsolescencia);
    const processados = marcarDuplicados(comObsolescencia);

    setAtivos(processados);
    localStorage.setItem(CHAVE, JSON.stringify(processados));
    return processados;
  };

  // Atualiza pontualmente apenas 1 ativo mantendo todos os outros intactos
  const atualizarAtivo = (ativoAtualizado: Ativo) => {
    const novaLista = ativos.map(a =>
      String(a.id) === String(ativoAtualizado.id)
        ? { ...ativoAtualizado, updatedAt: new Date().toISOString() }
        : a
    );
    salvarArrayCompleto(novaLista);

    if (sis?.registrar) {
      sis.registrar({
        tipo: 'EDICAO',
        ativoId: ativoAtualizado.id,
        hostname: ativoAtualizado.hostname,
        descricao: `Ativo ${ativoAtualizado.hostname || ativoAtualizado.serialNumber} atualizado`
      });
    }
  };

  // Atualiza múltiplos ativos selecionados em lote
  const atualizarEmMassa = async (ids: string[], status: string, notes: string) => {
    const idsSet = new Set(ids.map(String));

    const novaLista = ativos.map(a => {
      if (idsSet.has(String(a.id))) {
        return {
          ...a,
          ...(status ? { currentStatus: status } : {}),
          ...(notes ? { notes } : {}),
          updatedAt: new Date().toISOString()
        };
      }
      return a;
    });

    salvarArrayCompleto(novaLista);

    if (sis?.registrar) {
      sis.registrar({
        tipo: 'EDICAO',
        descricao: `Atualização em massa realizada em ${ids.length} ativo(s)`
      });
    }
  };

  const adicionarUm = (a: Ativo) => {
    const novo: Ativo = {
      ...a,
      id: a.id || crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: sis?.usuario?.nome || 'Sistema',
      origem: a.origem || 'Manual',
      needsReview: a.origem === 'Manual' ? 'Yes' : a.needsReview
    };

    salvarArrayCompleto([...ativos, novo]);

    if (sis?.registrar) {
      sis.registrar({
        tipo: 'ADICAO',
        ativoId: novo.id,
        hostname: novo.hostname,
        descricao: `Ativo ${novo.hostname || novo.serialNumber} adicionado`
      });
    }
  };

  const inativar = (id: string) => {
    const ativo = ativos.find(x => String(x.id) === String(id));
    if (!ativo) return;

    const novaLista = ativos.map(x =>
      String(x.id) === String(id)
        ? {
            ...x,
            currentStatus: 'Deleted / Out of Service',
            deletedAt: new Date().toISOString(),
            deletedBy: sis?.usuario?.nome || 'Sistema',
            updatedAt: new Date().toISOString()
          }
        : x
    );

    salvarArrayCompleto(novaLista);

    if (sis?.registrar) {
      sis.registrar({
        tipo: 'INATIVACAO',
        ativoId: id,
        hostname: ativo.hostname,
        descricao: `Ativo ${ativo.hostname || ativo.serialNumber} inativado`
      });
    }
  };

  const sincronizarSnipe = async () => {
    try {
      setSincronizando(true);
      const ativosSnipe = await buscarAtivosSnipe();
      salvarArrayCompleto(ativosSnipe);

      if (sis?.registrar) {
        sis.registrar({
          tipo: 'SINCRONIZACAO',
          descricao: 'Sincronização com Snipe-IT concluída',
          detalhes: `${ativosSnipe.length} ativos recebidos da API`
        });
      }

      return { sucesso: true, quantidade: ativosSnipe.length };
    } catch (erro: any) {
      console.error('Erro na sincronização:', erro);
      if (sis?.registrar) {
        sis.registrar({
          tipo: 'SINCRONIZACAO',
          descricao: 'Falha na sincronização com Snipe-IT',
          detalhes: erro?.message || 'Erro desconhecido'
        });
      }
      throw erro;
    } finally {
      setSincronizando(false);
    }
  };

  const valor = useMemo(
    () => ({
      ativos,
      sincronizando,
      sincronizarSnipe,
      salvarAtivos: salvarArrayCompleto,
      substituir: salvarArrayCompleto,
      adicionar: (novos: Ativo[]) => salvarArrayCompleto([...ativos, ...novos]),
      adicionarUm,
      atualizar: atualizarAtivo,
      atualizarAtivo,
      atualizarEmMassa,
      inativar,
      restaurarExemplo: () => salvarArrayCompleto(ativosExemplo)
    }),
    [ativos, sincronizando, sis?.usuario]
  );

  return (
    <InventarioContext.Provider value={valor}>
      {children}
    </InventarioContext.Provider>
  );
}

export function useInventario() {
  return useContext(InventarioContext);
}