import type { Pool, RowDataPacket, ResultSetHeader } from 'mysql2/promise';
import { ApplicationError } from '../shared/errors.js';
import type { EstoqueRepository, Movimentacao, MovimentacaoDetalhada, MovimentacaoInput, SaldoInsumo } from './movimentacao.js';
import type { UnidadeMedida } from '../insumos/insumo.js';

interface LinhaMovimentacao extends RowDataPacket {
  id: number;
  insumoId: number;
  tipo: 'ENTRADA' | 'SAIDA';
  quantidade: string;
  observacao: string;
  data: Date;
  nomeInsumo: string;
  unidadeMedida: UnidadeMedida;
}

interface LinhaSaldo extends RowDataPacket {
  insumoId: number;
  nomeInsumo: string;
  unidadeMedida: UnidadeMedida;
  quantidade: string;
}

export class MysqlEstoqueRepository implements EstoqueRepository {
  private readonly pool: Pool;

  constructor(pool: Pool) {
    this.pool = pool;
  }

  async listarSaldos(): Promise<SaldoInsumo[]> {
    const sql = [
      'SELECT i.id_insumo AS insumoId, i.nome AS nomeInsumo, i.unidade_medida AS unidadeMedida,',
      "COALESCE(SUM(CASE WHEN m.tipo = 'ENTRADA' THEN m.quantidade ELSE -m.quantidade END), 0) AS quantidade",
      'FROM insumo i LEFT JOIN movimentacao_estoque m ON m.id_insumo = i.id_insumo',
      'GROUP BY i.id_insumo, i.nome, i.unidade_medida ORDER BY i.id_insumo',
    ].join(' ');
    const [linhas] = await this.pool.query<LinhaSaldo[]>(sql);

    // O MySQL devolve DECIMAL como texto para preservar sua precisão.
    return linhas.map((linha) => ({
      insumoId: linha.insumoId,
      nomeInsumo: linha.nomeInsumo,
      unidadeMedida: linha.unidadeMedida,
      quantidade: Number(linha.quantidade),
    }));
  }

  async listarMovimentacoes(): Promise<MovimentacaoDetalhada[]> {
    const sql = [
      'SELECT m.id_movimentacao AS id, m.id_insumo AS insumoId, m.tipo, m.quantidade,',
      "COALESCE(m.observacao, '') AS observacao, m.data_movimentacao AS data,",
      'i.nome AS nomeInsumo, i.unidade_medida AS unidadeMedida',
      'FROM movimentacao_estoque m JOIN insumo i ON i.id_insumo = m.id_insumo',
      'ORDER BY m.id_movimentacao DESC',
    ].join(' ');
    const [linhas] = await this.pool.query<LinhaMovimentacao[]>(sql);

    return linhas.map((linha) => ({
      id: linha.id,
      insumoId: linha.insumoId,
      tipo: linha.tipo,
      quantidade: Number(linha.quantidade),
      observacao: linha.observacao,
      data: linha.data.toISOString(),
      nomeInsumo: linha.nomeInsumo,
      unidadeMedida: linha.unidadeMedida,
    }));
  }

  async registrar(dados: MovimentacaoInput): Promise<Movimentacao> {
    const conexao = await this.pool.getConnection();

    try {
      await conexao.beginTransaction();

      // Uma movimentação por vez pode conferir e alterar o estoque deste insumo.
      const [insumos] = await conexao.execute<RowDataPacket[]>(
        'SELECT id_insumo FROM insumo WHERE id_insumo = ? FOR UPDATE',
        [dados.insumoId],
      );

      if (insumos.length === 0) {
        throw new ApplicationError('O insumo selecionado não foi encontrado.', 404);
      }

      const [saldos] = await conexao.execute<RowDataPacket[]>(
        "SELECT COALESCE(SUM(CASE WHEN tipo = 'ENTRADA' THEN quantidade ELSE -quantidade END), 0) AS quantidade"
        + ' FROM movimentacao_estoque WHERE id_insumo = ?',
        [dados.insumoId],
      );
      const saldoAtual = Math.round(Number(saldos[0]?.quantidade ?? 0) * 1000);
      const quantidadeSolicitada = Math.round(dados.quantidade * 1000);

      if (dados.tipo === 'SAIDA' && quantidadeSolicitada > saldoAtual) {
        throw new ApplicationError('Estoque insuficiente. A saída não pode ser maior que o saldo disponível.', 409);
      }

      const data = new Date();
      const [resultado] = await conexao.execute<ResultSetHeader>(
        'INSERT INTO movimentacao_estoque (id_insumo, tipo, quantidade, data_movimentacao, observacao)'
        + ' VALUES (?, ?, ?, ?, ?)',
        [dados.insumoId, dados.tipo, dados.quantidade, data, dados.observacao],
      );

      await conexao.commit();
      return { id: resultado.insertId, ...dados, data: data.toISOString() };
    } catch (erro) {
      // Se qualquer etapa falhar, nada da movimentação é gravado.
      await conexao.rollback();
      throw erro;
    } finally {
      conexao.release();
    }
  }
}
