import type { Pool, ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { ApplicationError } from '../shared/errors.js';
import type { Insumo, InsumoInput, InsumoRepository } from './insumo.js';

type LinhaInsumo = RowDataPacket & Insumo;

// Estes nomes SQL serão alinhados com o modelo relacional do grupo.
const colunasInsumo = "id_insumo AS id, nome, COALESCE(descricao, '') AS descricao, unidade_medida AS unidadeMedida";

export class MysqlInsumoRepository implements InsumoRepository {
  private readonly pool: Pool;

  constructor(pool: Pool) {
    this.pool = pool;
  }

  async listar(busca: string): Promise<Insumo[]> {
    const sql = 'SELECT ' + colunasInsumo
      + " FROM insumo WHERE LOCATE(?, nome) > 0 OR LOCATE(?, COALESCE(descricao, '')) > 0"
      + ' ORDER BY id_insumo';

    // Os valores são enviados separadamente dos comandos SQL.
    const [linhas] = await this.pool.execute<LinhaInsumo[]>(sql, [busca, busca]);
    return linhas;
  }

  async buscarPorId(id: number): Promise<Insumo | null> {
    const sql = 'SELECT ' + colunasInsumo + ' FROM insumo WHERE id_insumo = ?';
    const [linhas] = await this.pool.execute<LinhaInsumo[]>(sql, [id]);

    if (linhas.length === 0) {
      return null;
    }

    return linhas[0] ?? null;
  }

  async criar(dados: InsumoInput): Promise<Insumo> {
    const sql = 'INSERT INTO insumo (nome, descricao, unidade_medida) VALUES (?, ?, ?)';
    const valores = [dados.nome, dados.descricao, dados.unidadeMedida];
    const [resultado] = await this.pool.execute<ResultSetHeader>(sql, valores);
    return { id: resultado.insertId, ...dados };
  }

  async atualizar(id: number, dados: InsumoInput): Promise<Insumo | null> {
    const conexao = await this.pool.getConnection();

    try {
      await conexao.beginTransaction();

      // O mesmo bloqueio é usado pelo registro de movimentações.
      const [insumos] = await conexao.execute<LinhaInsumo[]>(
        'SELECT ' + colunasInsumo + ' FROM insumo WHERE id_insumo = ? FOR UPDATE',
        [id],
      );
      const insumo = insumos[0];

      if (insumo === undefined) {
        await conexao.commit();
        return null;
      }

      if (insumo.unidadeMedida !== dados.unidadeMedida) {
        const [vinculos] = await conexao.execute<RowDataPacket[]>(
          'SELECT id_insumo FROM item_compra WHERE id_insumo = ?'
          + ' UNION ALL SELECT id_insumo FROM movimentacao_estoque WHERE id_insumo = ? LIMIT 1',
          [id, id],
        );

        if (vinculos.length > 0) {
          throw new ApplicationError('A unidade de medida não pode ser alterada porque o insumo possui registros vinculados.', 409);
        }
      }

      await conexao.execute(
        'UPDATE insumo SET nome = ?, descricao = ?, unidade_medida = ? WHERE id_insumo = ?',
        [dados.nome, dados.descricao, dados.unidadeMedida, id],
      );
      await conexao.commit();
      return { id, ...dados };
    } catch (erro) {
      await conexao.rollback();
      throw erro;
    } finally {
      conexao.release();
    }
  }

  async excluir(id: number): Promise<boolean> {
    try {
      const [resultado] = await this.pool.execute<ResultSetHeader>(
        'DELETE FROM insumo WHERE id_insumo = ?', [id],
      );
      return resultado.affectedRows > 0;
    } catch (erro) {
      if (
        typeof erro === 'object' && erro !== null && 'code' in erro
        && (erro.code === 'ER_ROW_IS_REFERENCED' || erro.code === 'ER_ROW_IS_REFERENCED_2')
      ) {
        throw new ApplicationError('Este insumo possui registros vinculados e não pode ser excluído.', 409);
      }

      throw erro;
    }
  }
}
