import type { BancoEmMemoria } from '../memory/database.js';
import { ApplicationError } from '../shared/errors.js';
import { normalizarTexto } from '../shared/forms.js';
import type { Insumo, InsumoInput, InsumoRepository } from './insumo.js';

export class MemoryInsumoRepository implements InsumoRepository {
  private readonly banco: BancoEmMemoria;

  constructor(banco: BancoEmMemoria) {
    this.banco = banco;
  }

  async listar(busca: string): Promise<Insumo[]> {
    const termo = normalizarTexto(busca);
    const encontrados = this.banco.insumos.filter((insumo) => {
      const texto = normalizarTexto(insumo.nome + ' ' + insumo.descricao);
      return texto.includes(termo);
    });

    return encontrados.map((insumo) => ({ ...insumo }));
  }

  async buscarPorId(id: number): Promise<Insumo | null> {
    const insumo = this.banco.insumos.find((item) => item.id === id);

    if (insumo === undefined) {
      return null;
    }

    return { ...insumo };
  }

  async criar(dados: InsumoInput): Promise<Insumo> {
    const insumo: Insumo = {
      id: this.banco.proximoIdInsumo,
      nome: dados.nome,
      descricao: dados.descricao,
      unidadeMedida: dados.unidadeMedida,
    };

    this.banco.proximoIdInsumo += 1;
    this.banco.insumos.push(insumo);
    return { ...insumo };
  }

  async atualizar(id: number, dados: InsumoInput): Promise<Insumo | null> {
    const insumo = this.banco.insumos.find((item) => item.id === id);

    if (insumo === undefined) {
      return null;
    }

    if (insumo.unidadeMedida !== dados.unidadeMedida && this.possuiVinculos(id)) {
      throw new ApplicationError('A unidade de medida não pode ser alterada porque o insumo possui registros vinculados.', 409);
    }

    insumo.nome = dados.nome;
    insumo.descricao = dados.descricao;
    insumo.unidadeMedida = dados.unidadeMedida;
    return { ...insumo };
  }

  async excluir(id: number): Promise<boolean> {
    const indice = this.banco.insumos.findIndex((insumo) => insumo.id === id);

    if (indice === -1) {
      return false;
    }

    if (this.possuiVinculos(id)) {
      throw new ApplicationError('Este insumo possui registros vinculados e não pode ser excluído.', 409);
    }

    this.banco.insumos.splice(indice, 1);
    return true;
  }

  private possuiVinculos(id: number): boolean {
    const possuiCompras = this.banco.itensCompra.some((item) => item.insumoId === id);
    const possuiMovimentacoes = this.banco.movimentacoes.some((movimentacao) => movimentacao.insumoId === id);
    return possuiCompras || possuiMovimentacoes;
  }
}
