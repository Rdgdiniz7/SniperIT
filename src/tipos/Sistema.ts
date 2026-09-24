export type Perfil='admin'|'funcionario';
export interface Usuario{id:string;nome:string;email:string;perfil:Perfil;ativo:boolean;senha:string;}
export type TipoEvento='ADICAO'|'EDICAO'|'INATIVACAO'|'IMPORTACAO'|'EXPORTACAO'|'SINCRONIZACAO'|'VALIDACAO'|'LOGIN'|'RECEBIMENTO';
export interface EventoHistorico{id:string;tipo:TipoEvento;data:string;usuario:string;usuarioId:string;ativoId?:string;hostname?:string;descricao:string;detalhes?:string;}
export interface ErroValidacao{id:string;linha:number;coluna:string;valorOriginal:string;mensagem:string;nivel:'Warning'|'Error';}
export interface Contrato{id:string;fornecedor:string;nivelSuporte:string;inicio:string;fim:string;caf:string;notaFiscal:string;valor:number;moeda:'BRL'|'USD'|'EUR'|'ARS';modelos:string[];}
export interface ConfigSnipe{url:string;tokenConfigurado:boolean;ultimaSincronizacao:string;modo:'manual'|'agendado';intervaloMinutos:number;}
