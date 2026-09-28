import { useState } from 'react';
import { useSistema } from '../contextos/SistemaContext';
import { useInventario } from '../contextos/InventarioContext';
import { RefreshCw, Shield, Database, CheckCircle } from 'lucide-react';

export default function Sincronizacao() {
  const s = useSistema();

  const {
    ativos,
    sincronizarSnipe,
    sincronizando
  } = useInventario();

  const [mensagem, setMensagem] = useState('');

  const bloqueados = ativos.filter(
    (a: any) =>
      a.dupHost ||
      a.needsReview === 'Yes'
  ).length;

  const executarSincronizacao = async () => {
    setMensagem('');

    try {
      const resultado = await sincronizarSnipe();

      const agora = new Date().toISOString();

      s.setSnipe({
        ...s.snipe,
        ultimaSincronizacao: agora
      });

      setMensagem(
        `Sincronização concluída: ${resultado.quantidade} ativos recebidos do Snipe-IT.`
      );

    } catch (erro: any) {
      console.error(erro);

      setMensagem(
        `Erro na sincronização: ${erro?.message || 'Erro desconhecido'}`
      );
    }
  };

  return (
    <>
      <div className="page-title">
        <div>
          <h1>Sincronização Snipe-IT</h1>

          <p>
            Consulta segura da API REST do Snipe-IT.
          </p>
        </div>
      </div>

      <div className="cards">

        <div className="metric">
          <div className="metric-icon">
            <Database />
          </div>

          <div>
            <span>Ativos no CMDB</span>

            <strong>
              {ativos.length}
            </strong>
          </div>
        </div>

        <div className="metric">
          <div className="metric-icon">
            <RefreshCw />
          </div>

          <div>
            <span>Última sincronização</span>

            <strong>
              {s.snipe.ultimaSincronizacao
                ? new Date(
                    s.snipe.ultimaSincronizacao
                  ).toLocaleString('pt-BR')
                : 'Nunca'}
            </strong>
          </div>
        </div>

        <div className="metric">
          <div className="metric-icon">
            <Shield />
          </div>

          <div>
            <span>Necessitam revisão</span>

            <strong>
              {bloqueados}
            </strong>
          </div>
        </div>

      </div>

      <div className="panel">

        <h2>Conector Snipe-IT</h2>

        <div className="alert warning">
          O token Bearer permanece protegido no backend.
          O navegador não possui acesso direto ao token da API.
        </div>

        <div className="form-grid">

          <label>
            URL do Snipe-IT

            <input
              value={s.snipe.url}
              onChange={e =>
                s.setSnipe({
                  ...s.snipe,
                  url: e.target.value
                })
              }
              placeholder="http://172.20.192.50"
            />
          </label>

          <label>
            Rotina

            <select
              value={s.snipe.modo}
              onChange={e =>
                s.setSnipe({
                  ...s.snipe,
                  modo: e.target.value
                })
              }
            >
              <option value="manual">
                Manual
              </option>

              <option value="agendado">
                Agendado
              </option>
            </select>
          </label>

        </div>

        <button
          className="primary"
          disabled={sincronizando}
          onClick={executarSincronizacao}
        >
          <RefreshCw />

          {sincronizando
            ? ' Sincronizando...'
            : ' Sincronizar com Snipe-IT'}
        </button>

        {mensagem && (
          <div
            className={
              mensagem.startsWith('Erro')
                ? 'alert warning'
                : 'alert success'
            }
            style={{ marginTop: 16 }}
          >
            <CheckCircle />

            {mensagem}
          </div>
        )}

      </div>

      <div className="panel">

        <h2>Mapeamento</h2>

        <div className="mapping">
          <code>Snipe ID → assetId</code>
          <code>Asset Tag → assetTag</code>
          <code>Serial → serialNumber</code>
          <code>Hostname / FQDN → hostname</code>
          <code>Model → model</code>
          <code>Manufacturer → vendor</code>
          <code>Category → categoria</code>
          <code>Location → location</code>
          <code>Status → currentStatus</code>
          <code>IP de Gerência → ipAddress</code>
          <code>Base MAC → macAddress</code>
          <code>Custom Fields → CMDB</code>
        </div>

      </div>
    </>
  );
}