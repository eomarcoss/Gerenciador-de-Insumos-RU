import type { Pool, ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { ApplicationError } from '../shared/errors.js';
import type { Fornecedor, FornecedorInput, FornecedorRepository } from './fornecedor.js';

type LinhaFornecedor = RowDataPacket & Fornecedor;
const colunasFornecedor = "id_fornecedor AS id, nome, COALESCE(email, '') AS email, COALESCE(telefone, '') AS telefone";

export class MysqlFornecedorRepository implements FornecedorRepository {
  private readonly pool: Pool;

  constructor(pool: Pool) {
    this.pool = pool;
  }

  async listar(busca: string): Promise<Fornecedor[]> {
    const sql = 'SELECT ' + colunasFornecedor
      + " FROM fornecedor WHERE LOCATE(?, nome) > 0 OR LOCATE(?, COALESCE(email, '')) > 0"
      + " OR LOCATE(?, COALESCE(telefone, '')) > 0 ORDER BY id_fornecedor";
    const [linhas] = await this.pool.execute<LinhaFornecedor[]>(sql, [busca, busca, busca]);
    return linhas;
  }

  async buscarPorId(id: number): Promise<Fornecedor | null> {
    const sql = 'SELECT ' + colunasFornecedor + ' FROM fornecedor WHERE id_fornecedor = ?';
    const [linhas] = await this.pool.execute<LinhaFornecedor[]>(sql, [id]);
    return linhas[0] ?? null;
  }

  async criar(dados: FornecedorInput): Promise<Fornecedor> {
    const [resultado] = await this.pool.execute<ResultSetHeader>(
      'INSERT INTO fornecedor (nome, email, telefone) VALUES (?, ?, ?)',
      [dados.nome, dados.email, dados.telefone],
    );
    return { id: resultado.insertId, ...dados };
  }

  async atualizar(id: number, dados: FornecedorInput): Promise<Fornecedor | null> {
    await this.pool.execute(
      'UPDATE fornecedor SET nome = ?, email = ?, telefone = ? WHERE id_fornecedor = ?',
      [dados.nome, dados.email, dados.telefone, id],
    );
    return this.buscarPorId(id);
  }

  async excluir(id: number): Promise<boolean> {
    try {
      const [resultado] = await this.pool.execute<ResultSetHeader>(
        'DELETE FROM fornecedor WHERE id_fornecedor = ?', [id],
      );
      return resultado.affectedRows > 0;
    } catch (erro) {
      if (typeof erro === 'object' && erro !== null && 'code' in erro && erro.code === 'ER_ROW_IS_REFERENCED_2') {
        throw new ApplicationError('Este fornecedor possui compras vinculadas e não pode ser excluído.', 409);
      }

      throw erro;
    }
  }
}
