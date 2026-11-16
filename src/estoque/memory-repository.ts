import type { BancoEmMemoria } from '../memory/database.js';
import { ApplicationError } from '../shared/errors.js';
import type { EstoqueRepository, Movimentacao, MovimentacaoDetalhada, MovimentacaoInput, SaldoInsumo } from './movimentacao.js';

export class MemoryEstoqueRepository implements EstoqueRepository {
  private readonly banco: BancoEmMemoria;

  constructor(banco: BancoEmMemoria) {
    this.banco = banco;
  }

  private calcularSaldoEmMilessimos(insumoId: number): number {
    let saldo = 0;

    // Somamos inteiros para evitar erros como 0.1 + 0.2 no JavaScript.
    for (const movimentacao of this.banco.movimentacoes) {
      if (movimentacao.insumoId !== insumoId) {
        continue;
      }

      const quantidade = Math.round(movimentacao.quantidade * 1000);

      if (movimentacao.tipo === 'ENTRADA') {
        saldo += quantidade;
      } else {
        saldo -= quantidade;
      }
    }

    return saldo;
  }

  async listarSaldos(): Promise<SaldoInsumo[]> {
    return this.banco.insumos.map((insumo) => ({
      insumoId: insumo.id,
      nomeInsumo: insumo.nome,
      unidadeMedida: insumo.unidadeMedida,
      quantidade: this.calcularSaldoEmMilessimos(insumo.id) / 1000,
    }));
  }

  async listarMovimentacoes(): Promise<MovimentacaoDetalhada[]> {
    const historico: MovimentacaoDetalhada[] = [];

    for (const movimentacao of this.banco.movimentacoes) {
      const insumo = this.banco.insumos.find((item) => item.id === movimentacao.insumoId);

      if (insumo === undefined) {
        throw new Error('Movimentação sem insumo correspondente.');
      }

      historico.push({
        ...movimentacao,
        nomeInsumo: insumo.nome,
        unidadeMedida: insumo.unidadeMedida,
      });
    }

    return historico.sort((primeira, segunda) => segunda.id - primeira.id);
  }

  async registrar(dados: MovimentacaoInput): Promise<Movimentacao> {
    const insumo = this.banco.insumos.find((item) => item.id === dados.insumoId);

    if (insumo === undefined) {
      throw new ApplicationError('O insumo selecionado não foi encontrado.', 404);
    }

    const saldoAtual = this.calcularSaldoEmMilessimos(insumo.id);
    const quantidadeSolicitada = Math.round(dados.quantidade * 1000);

    if (dados.tipo === 'SAIDA' && quantidadeSolicitada > saldoAtual) {
      throw new ApplicationError('Estoque insuficiente. A saída não pode ser maior que o saldo disponível.', 409);
    }

    const movimentacao: Movimentacao = {
      id: this.banco.proximoIdMovimentacao,
      insumoId: dados.insumoId,
      tipo: dados.tipo,
      quantidade: dados.quantidade,
      observacao: dados.observacao,
      data: new Date().toISOString(),
    };

    // Sem await entre a conferência e a gravação. Outra requisição só executa depois.
    this.banco.proximoIdMovimentacao += 1;
    this.banco.movimentacoes.push(movimentacao);
    return { ...movimentacao };
  }
}
