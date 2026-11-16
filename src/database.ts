import { createPool } from 'mysql2/promise';
import { criarRepositoriosEmMemoria } from './repositories.js';
import { MysqlInsumoRepository } from './insumos/mysql-repository.js';
import { MysqlFornecedorRepository } from './fornecedores/mysql-repository.js';
import { MysqlEstoqueRepository } from './estoque/mysql-repository.js';

export async function conectarDados() {
  const modo = process.env.DB_DRIVER ?? 'memory';

  // Este é o modo usado para a conferência das telas nesta etapa.
  if (modo === 'memory') {
    return {
      repositorios: criarRepositoriosEmMemoria(),
      modoMemoria: true,
      fechar: async () => {},
    };
  }

  if (modo !== 'mysql') {
    throw new Error('DB_DRIVER deve ser memory ou mysql.');
  }

  if (!process.env.DB_USER || !process.env.DB_NAME) {
    throw new Error('Preencha DB_USER e DB_NAME no arquivo .env.');
  }

  const porta = Number(process.env.DB_PORT ?? 3306);

  if (!Number.isInteger(porta) || porta < 1 || porta > 65535) {
    throw new Error('DB_PORT inválida.');
  }

  // Um pool reaproveita as conexões com o MySQL.
  const pool = createPool({
    host: process.env.DB_HOST ?? '127.0.0.1',
    port: porta,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD ?? '',
    database: process.env.DB_NAME,
    charset: 'utf8mb4',
    timezone: 'Z',
    connectionLimit: 5,
    connectTimeout: 5000,
  });

  try {
    await pool.query('SELECT 1');
  } catch (erro) {
    await pool.end();
    throw erro;
  }

  return {
    repositorios: {
      insumos: new MysqlInsumoRepository(pool),
      fornecedores: new MysqlFornecedorRepository(pool),
      estoque: new MysqlEstoqueRepository(pool),
    },
    modoMemoria: false,
    fechar: () => pool.end(),
  };
}
