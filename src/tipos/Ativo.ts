export type StatusOperacional = 'Ativo'|'Desativado'|'Fora de Serviço'|'Desconhecido'|'Deleted / Out of Service';
export type OrigemAtivo = 'Planilha'|'Manual'|'Snipe-IT'|'Scan';

export interface Ativo {
 id: string;
 country: string;
 needsReview: string;
 location: string;
 costRegion: string;
 serialNumber: string;
 hostname: string;
 lastHostname: string;
 currentStatus: string;
 caf: string;
 answeringICMP: string;
 ipAddress: string;
 source: string;
 snmpLocated: string;
 isNew: string;
 wasReplaced: string;
 model: string;
 approverGroupBusiness: string;
 subLocation: string;
 vendor: string;
 vendorSupported: string;
 endOfContract: string;
 siteCode: string;
 simpleDeviceCategory: string;
 deviceGroup: string;
 obsoleteYear: string;
 capex: string;
 isObsolete: string;
 plannedReplacementYear: string;
 speedUpPlan: string;
 type: string;
 unitValue: number | null;
 serviceUnitCost: number | null;
 replacementCost: number | null;
 technicalReserve: number | null;
 macAddress: string;
 opex: number | null;
 powerAppsId: string;
 assetId: string;
 assetTag: string;
 snmpStatus: string;
 interfaceInfo: string;
 dupHost: boolean;
 deletedAt: string;
 deletedBy: string;
 origem: OrigemAtivo;
 updatedAt: string;
 createdAt: string;
 createdBy: string;
 deliveryStatus: string;
 installStatus: string;
 invoice: string;
 receivedAt: string;
 supportLevel: string;
 supportProvider: string;
 notes?: string; // Propriedade adicionada para evitar erro TS(2339)
}

export const COLUNAS_SNIPE_IMPORT = [
  'Country', 'NeedsReview', 'Location', 'Cost Region', 'Serial Number', 'Hostname',
  'Last Hostname', 'Current Status', 'CAF', 'AnsweringICMP', 'IP Address', 'Coluna1',
  'SNMPLocated', 'IsNew', 'WasReplaced', 'Model', 'Approver Group Business',
  'Sub Location (Galpão)', 'Vendor', 'Vendor Supported', 'End of Contract',
  'Site Code', 'Simple Device Category', 'Device Group', 'Obsolete Year', 'Capex',
  'Is Obsolete?', 'Planned Replacement Year', 'Speed Up Plan', 'Type',
  'Unit Value', 'Service Unit Cost', 'Replacement Cost', 'Technical Reserve'
] as const;

export const COLUNAS_PLANILHA = COLUNAS_SNIPE_IMPORT;