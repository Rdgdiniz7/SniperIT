import { ArrowLeft, Tag } from 'lucide-react';
import type { Ativo } from '../tipos/Ativo';
import { texto } from '../utilitarios/formatadores';

const Grupo = ({ titulo, linhas }: { titulo: string; linhas: [string, string][] }) => (
  <div className="panel detail-group">
    <h2>{titulo}</h2>
    {linhas.map(([k, v]) => (
      <div className="detail-row" key={k}>
        <span>{k}</span>
        <b>{v}</b>
      </div>
    ))}
  </div>
);

export default function DetalhesAtivo({ ativo, onVoltar }: { ativo: Ativo; onVoltar: () => void }) {
  return (
    <>
      <button className="back" onClick={onVoltar}>
        <ArrowLeft /> Voltar ao inventário
      </button>

      <div className="page-title">
        <div>
          <h1>{texto(ativo.hostname)}</h1>
          <p>{texto(ativo.model)} • {texto(ativo.location)}</p>
        </div>
        <span className="badge ok">{texto(ativo.currentStatus)}</span>
      </div>

      {ativo.notes && (
        <div className="panel" style={{ marginBottom: '16px', background: 'rgba(0,123,255,0.05)', borderColor: '#007bff' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#007bff', fontWeight: 'bold' }}>
            <Tag size={16} /> Observação / Vínculo Operacional
          </div>
          <p style={{ marginTop: '8px', margin: 0 }}>{ativo.notes}</p>
        </div>
      )}

      <div className="grid2">
        <Grupo
          titulo="Identificação e Rede"
          linhas={[
            ['Hostname', texto(ativo.hostname)],
            ['Serial Number', texto(ativo.serialNumber)],
            ['Asset Tag', texto(ativo.assetTag)],
            ['IP Address', texto(ativo.ipAddress)],
            ['MAC Address', texto(ativo.macAddress)],
            ['Modelo', texto(ativo.model)],
            ['Origem', texto(ativo.source)]
          ]}
        />

        <Grupo
          titulo="Localização Operacional"
          linhas={[
            ['País', texto(ativo.country)],
            ['Localização', texto(ativo.location)],
            ['Sub-localização (Galpão)', texto(ativo.subLocation)],
            ['Cost Region', texto(ativo.costRegion)],
            ['Site Code', texto(ativo.siteCode)]
          ]}
        />

        <Grupo
          titulo="Classificação do Ativo"
          linhas={[
            ['Categoria', texto(ativo.simpleDeviceCategory)],
            ['Grupo de Dispositivo', texto(ativo.deviceGroup)],
            ['Tipo de Equipamento', texto(ativo.type)],
            ['Fabricante / Vendor', texto(ativo.vendor)],
            ['Suporte do Vendor', texto(ativo.vendorSupported)]
          ]}
        />

        <Grupo
          titulo="Status de Auditoria"
          linhas={[
            ['Precisa de Revisão?', texto(ativo.needsReview)],
            ['Responde ICMP (Ping)', texto(ativo.answeringICMP)],
            ['SNMP Localizado', texto(ativo.snmpLocated)],
            ['Criado Em', texto(ativo.createdAt)],
            ['Última Atualização', texto(ativo.updatedAt)]
          ]}
        />
      </div>
    </>
  );
}