# Formato oficial de importação Snipe-IT

Esta versão foi adaptada ao arquivo `SniperIT_IMPORT` fornecido para teste.

## 34 colunas preservadas na ordem do arquivo
Country, NeedsReview, Location, Cost Region, Serial Number, Hostname, Last Hostname, Current Status, CAF, AnsweringICMP, IP Address, Coluna1, SNMPLocated, IsNew, WasReplaced, Model, Approver Group Business, Sub Location (Galpão), Vendor, Vendor Supported, End of Contract, Site Code, Simple Device Category, Device Group, Obsolete Year, Capex, Is Obsolete?, Planned Replacement Year, Speed Up Plan, Type, Unit Value, Service Unit Cost, Replacement Cost, Technical Reserve.

## Regras
- Importação aceita CSV/XLS/XLSX.
- `Last Hostname`, `AnsweringICMP`, `SNMPLocated`, `IsNew` e `WasReplaced` agora são campos nativos do modelo.
- `IsNew=Yes` alimenta a visão New Devices.
- Exportação XLSX/CSV usa as mesmas 34 colunas e ordem, para facilitar testes de ida e volta com o Snipe-IT.
- Campos internos do CMDB (asset_id, logs, soft delete etc.) não são inseridos no arquivo de importação oficial.
