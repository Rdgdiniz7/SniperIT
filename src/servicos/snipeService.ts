import type { Ativo } from '../tipos/Ativo';

const valorCustom = (item: any, nome: string): string => {
  const campo = item?.custom_fields?.[nome];
  return campo?.value != null ? String(campo.value) : '';
};

const numero = (valor: any): number | null => {
  if (valor === null || valor === undefined || valor === '') return null;

  const convertido = Number(
    String(valor)
      .replace(/\./g, '')
      .replace(',', '.')
  );

  return Number.isFinite(convertido) ? convertido : null;
};

export function converterAtivoSnipe(item: any): Ativo {
  return {
    id: String(item.id),
    country: valorCustom(item, 'Country'),
    needsReview: valorCustom(item, 'NeedsReview'),
    location: item?.location?.name || item?.rtd_location?.name || '',
    costRegion: valorCustom(item, 'Cost Region'),
    serialNumber: item?.serial || '',
    hostname: valorCustom(item, 'Hostname / FQDN') || item?.name || item?.asset_tag || '',
    lastHostname: valorCustom(item, 'Last Hostname') || valorCustom(item, 'Last Name'),
    currentStatus: item?.status_label?.name || valorCustom(item, 'Current Status') || '',
    caf: valorCustom(item, 'CAF'),
    answeringICMP: valorCustom(item, 'AnsweringICMP'),
    ipAddress: valorCustom(item, 'IP de Gerência (OOB / Mgmt IP)'),
    source: 'Snipe-IT',
    snmpLocated: valorCustom(item, 'SNMPLocated'),
    isNew: valorCustom(item, 'IsNew'),
    wasReplaced: valorCustom(item, 'WasReplaced'),
    model: item?.model?.name || valorCustom(item, 'Model') || '',
    approverGroupBusiness: valorCustom(item, 'Approver Group Business'),
    subLocation: valorCustom(item, 'Sub Location'),
    vendor: item?.manufacturer?.name || valorCustom(item, 'Vendor') || '',
    vendorSupported: valorCustom(item, 'Vendor Supported'),
    endOfContract: valorCustom(item, 'End of Contract'),
    siteCode: valorCustom(item, 'Site Code'),
    simpleDeviceCategory: item?.category?.name || valorCustom(item, 'Simple Device Category') || '',
    deviceGroup: valorCustom(item, 'Device Group'),
    obsoleteYear: valorCustom(item, 'Obsolete Year'),
    capex: valorCustom(item, 'Capex'),
    isObsolete: valorCustom(item, 'Is Obsolete'),
    plannedReplacementYear: valorCustom(item, 'Planned Replacement Year'),
    speedUpPlan: valorCustom(item, 'Speed Up Plan'),
    type: valorCustom(item, 'Type') || valorCustom(item, 'Papel / Tipo de Equipamento'),
    unitValue: numero(valorCustom(item, 'Unit Value')),
    serviceUnitCost: numero(valorCustom(item, 'Service Unit Cost')),
    replacementCost: numero(valorCustom(item, 'Replacement Cost')),
    technicalReserve: numero(valorCustom(item, 'Technical Reserve')),
    macAddress: valorCustom(item, 'Base MAC Address'),
    opex: null,
    powerAppsId: valorCustom(item, 'PowerAppsId'),
    assetId: String(item.id),
    assetTag: item?.asset_tag || '',
    snmpStatus: '',
    interfaceInfo: '',
    dupHost: false,
    deletedAt: item?.deleted_at?.datetime || '',
    deletedBy: '',
    origem: 'Snipe-IT',
    updatedAt: item?.updated_at?.datetime || '',
    createdAt: item?.created_at?.datetime || '',
    createdBy: item?.created_by?.name || 'Snipe-IT',
    deliveryStatus: '',
    installStatus: item?.status_label?.name || '',
    invoice: '',
    receivedAt: '',
    supportLevel: '',
    supportProvider: ''
  };
}

export async function buscarAtivosSnipe(): Promise<Ativo[]> {
  const todos: Ativo[] = [];

  const limit = 500;
  let offset = 0;
  let total = 0;

  do {
    const resposta = await fetch(`/api/assets?limit=${limit}&offset=${offset}`);

    if (!resposta.ok) {
      throw new Error(`Erro ao consultar Snipe-IT: HTTP ${resposta.status}`);
    }

    const dados = await resposta.json();
    total = Number(dados.total || 0);

    const pagina = Array.isArray(dados.rows) ? dados.rows : [];

    todos.push(...pagina.map(converterAtivoSnipe));

    offset += pagina.length;

    if (pagina.length === 0) {
      break;
    }
  } while (todos.length < total);

  return todos;
}

export async function atualizarAtivoSnipe(id: string, dadosAtualizados: Partial<Ativo>): Promise<boolean> {
  const resposta = await fetch(`/api/assets/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify(dadosAtualizados)
  });

  if (!resposta.ok) {
    throw new Error(`Erro ao atualizar no Snipe-IT: HTTP ${resposta.status}`);
  }

  return true;
}