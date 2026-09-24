# Sniper IT CMDB — versão didática

Sistema React/Vite para controle de inventário de rede, preparado para planilha e futura integração segura com Snipe-IT.

## Executar
```bash
npm install
npm run dev
```

## Logins de demonstração
- Admin: `admin@empresa.com` / `admin123`
- Funcionário: `funcionario@empresa.com` / `rede123`

> Estes logins usam localStorage e servem apenas para protótipo/aprendizado. Produção deve usar SSO/Active Directory no backend.

## Pastas
- `src/tipos`: contratos de dados (Ativo, Usuário, Histórico, Contrato).
- `src/dados`: dados iniciais de demonstração.
- `src/contextos`: estado do inventário, autenticação e auditoria.
- `src/servicos`: importação/exportação e, futuramente, adaptadores de API.
- `src/utilitarios`: regras de negócio (CIDR, obsolescência, duplicidade, validação).
- `src/paginas`: telas do sistema.
- `src/componentes/layout`: menu e estrutura visual.

## Regras implementadas no protótipo
- CRUD com inativação/soft delete para Admin.
- Funcionário consulta, adiciona e edita; não inativa.
- Histórico de adição, edição, importação, exportação, inativação e sincronização simulada.
- Catálogos automáticos derivados do inventário: fabricantes, modelos, tipos, categorias, grupos, localizações, países e site codes.
- Importação XLSX/XLS/CSV e exportação XLSX/CSV.
- Normalização de IP CIDR e log de Warning.
- NeedsReview para cadastro manual e importações com sanitização.
- DupHost/Serial por país e bloqueio da sincronização simulada.
- Is Obsolete calculado a partir do ano EoS configurado.
- Campos de Snipe asset_id/asset_tag, recebimento, suporte, CAPEX/OPEX.
- Módulos de contratos, recebimento, financeiro, descoberta e Snipe-IT.

## O que exige backend para produção
O navegador NÃO deve armazenar token Snipe-IT nem executar SNMP/ICMP. Para atender integralmente RNF-02/03/04 e RF-04/07/08, criar um backend com:
1. SSO/AD + RBAC real.
2. Secret Manager/Vault para Bearer Token.
3. API REST interna para o frontend.
4. Worker SNMP/ICMP dentro da rede.
5. Redis/RabbitMQ para filas, retry exponencial e idempotência.
6. Banco SQL para CMDB, auditoria e soft delete.
7. Webhook/polling do Snipe-IT.
8. Logs SOX/ICFR imutáveis e política de retenção.

## Fonte da verdade
- Dados técnicos de rede: CMDB/Scan.
- Estado físico/ciclo de vida: pode ser Snipe-IT.
- Chave principal: Serial Number; fallback Hostname + Location.

## Novidades da versão 4
- Adição em massa por XLSX/XLS/CSV, com modo "Acrescentar registros" como padrão.
- Seleção individual ou de todos os ativos filtrados no Inventário.
- Exportação apenas dos ativos selecionados em XLSX, CSV ou PDF (via janela de impressão / Salvar como PDF).
- A exportação completa continua disponível em Importar / Exportar.
- "Recebimento" foi reformulado como **New Devices**: mostra ativos já cadastrados que ainda não estão instalados/em produção.
- Novos fabricantes, modelos, locations e categorias vindos da planilha entram automaticamente nos catálogos derivados do inventário.
