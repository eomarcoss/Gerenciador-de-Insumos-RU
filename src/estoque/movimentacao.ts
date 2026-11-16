import type { UnidadeMedida } from '../insumos/insumo.js';

export type TipoMovimentacao = 'ENTRADA' | 'SAIDA';

export interface MovimentacaoInput {
  insumoId: number;
  tipo: TipoMovimentacao;
  quantidade: number;
  observacao: string;
}

export interface Movimentacao extends MovimentacaoInput {
  id: number;
  data: string;
}

export interface MovimentacaoDetalhada extends Movimentacao {
  nomeInsumo: string;
  unidadeMedida: UnidadeMedida;
}

export interface SaldoInsumo {
  insumoId: number;
  nomeInsumo: string;
  unidadeMedida: UnidadeMedida;
  quantidade: number;
}

export interface EstoqueRepository {
  listarSaldos(): Promise<SaldoInsumo[]>;
  listarMovimentacoes(): Promise<MovimentacaoDetalhada[]>;

  // Conferir o saldo e salvar a saída precisam formar uma única operação.
  registrar(dados: MovimentacaoInput): Promise<Movimentacao>;
}
