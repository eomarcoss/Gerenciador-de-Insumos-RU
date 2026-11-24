import type { InsumoRepository } from './insumos/insumo.js';
import type { FornecedorRepository } from './fornecedores/fornecedor.js';
import type { EstoqueRepository } from './estoque/movimentacao.js';

export interface Repositorios {
  insumos: InsumoRepository;
  fornecedores: FornecedorRepository;
  estoque: EstoqueRepository;
}
