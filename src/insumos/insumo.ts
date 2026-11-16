export const unidadesMedida = ['kg', 'g', 'L', 'mL', 'un'] as const;
export type UnidadeMedida = 'kg' | 'g' | 'L' | 'mL' | 'un';

export interface InsumoInput {
  nome: string;
  descricao: string;
  unidadeMedida: UnidadeMedida;
}

export interface Insumo extends InsumoInput {
  id: number;
}

// O serviço usa este contrato sem precisar saber onde os dados são salvos.
export interface InsumoRepository {
  listar(busca: string): Promise<Insumo[]>;
  buscarPorId(id: number): Promise<Insumo | null>;
  criar(dados: InsumoInput): Promise<Insumo>;
  atualizar(id: number, dados: InsumoInput): Promise<Insumo | null>;
  excluir(id: number): Promise<boolean>;
}
