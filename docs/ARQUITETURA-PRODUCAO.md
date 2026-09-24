# Arquitetura de produção e rastreabilidade dos requisitos

## Implementado no frontend/protótipo
- RF-01: inventário de rede, cadastro, consulta, edição e soft delete por Admin.
- RF-02: EoS/obsolescência, replacement year, speed-up, CAPEX/OPEX.
- RF-03: módulo de contratos/garantias e campos de suporte/CAF/NF.
- RF-05: recebimento, entrega, instalação, NF e data de recebimento.
- RF-06: consolidação financeira básica; estrutura para moedas.
- RF-09 / RN-01 / RN-05 / RN-06 / RN-07: validação, CIDR, obsolescência, duplicidade, NeedsReview.
- RN-02: soft delete com timestamp/usuário.
- RN-03: campos asset_id/asset_tag e chave de negócio documentada.
- RN-04: fonte da verdade documentada.
- RNF-05: XLSX/CSV.
- RNF-06: campos de país/região/moeda preparados.

## Preparado, mas depende de backend/infra corporativa
- RF-04: scan SNMP/ICMP real.
- RF-07: chamadas reais à API Snipe-IT.
- RF-08: webhook/polling e sincronização bidirecional real.
- RNF-01: 10.000+ ativos requer paginação/virtualização + API/banco.
- RNF-02: SSO/AD, RBAC de servidor, Vault/Secret Manager.
- RNF-03: Redis/RabbitMQ, retry exponencial, idempotência.
- RNF-04: auditoria SOX/ICFR persistente/imutável.
- RF-06: taxa cambial automática auditável.

## Backend recomendado
`Frontend React -> API CMDB -> PostgreSQL/SQL Server`

Serviços laterais:
- `SnipeSyncWorker` para `/api/v1/hardware`, `/models`, `/locations`.
- `DiscoveryWorker` para SNMP/ICMP.
- `Queue` Redis/RabbitMQ para jobs.
- `Secret Manager` para tokens.
- `WebSocket/SSE` para últimas movimentações ao vivo entre usuários.
- `SSO/AD` para autenticação corporativa.

Nunca colocar o Bearer Token do Snipe-IT no código React.
