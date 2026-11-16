import type { InsumoRepository } from './insumos/insumo.js';
import type { FornecedorRepository } from './fornecedores/fornecedor.js';
import type { EstoqueRepository } from './estoque/movimentacao.js';
import { BancoEmMemoria } from './memory/database.js';
import { MemoryInsumoRepository } from './insumos/memory-repository.js';
import { MemoryFornecedorRepository } from './fornecedores/memory-repository.js';
import { MemoryEstoqueRepository } from './estoque/memory-repository.js';

export interface Repositorios {
  insumos: InsumoRepository;
  fornecedores: FornecedorRepository;
  estoque: EstoqueRepository;
}

export function criarRepositoriosEmMemoria(): Repositorios {
  const banco = new BancoEmMemoria();

  // Os três repositórios compartilham os mesmos dados e relacionamentos.
  return {
    insumos: new MemoryInsumoRepository(banco),
    fornecedores: new MemoryFornecedorRepository(banco),
    estoque: new MemoryEstoqueRepository(banco),
  };
}
