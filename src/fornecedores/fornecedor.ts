export interface FornecedorInput {
  nome: string;
  email: string;
  telefone: string;
}

export interface Fornecedor extends FornecedorInput {
  id: number;
}

export interface FornecedorRepository {
  listar(busca: string): Promise<Fornecedor[]>;
  buscarPorId(id: number): Promise<Fornecedor | null>;
  criar(dados: FornecedorInput): Promise<Fornecedor>;
  atualizar(id: number, dados: FornecedorInput): Promise<Fornecedor | null>;
  excluir(id: number): Promise<boolean>;
}
