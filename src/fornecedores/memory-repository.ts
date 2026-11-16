import type { BancoEmMemoria } from '../memory/database.js';
import { ApplicationError } from '../shared/errors.js';
import { normalizarTexto } from '../shared/forms.js';
import type { Fornecedor, FornecedorInput, FornecedorRepository } from './fornecedor.js';

export class MemoryFornecedorRepository implements FornecedorRepository {
  private readonly banco: BancoEmMemoria;

  constructor(banco: BancoEmMemoria) {
    this.banco = banco;
  }

  async listar(busca: string): Promise<Fornecedor[]> {
    const termo = normalizarTexto(busca);
    const encontrados = this.banco.fornecedores.filter((fornecedor) => {
      const texto = fornecedor.nome + ' ' + fornecedor.email + ' ' + fornecedor.telefone;
      return normalizarTexto(texto).includes(termo);
    });

    return encontrados.map((fornecedor) => ({ ...fornecedor }));
  }

  async buscarPorId(id: number): Promise<Fornecedor | null> {
    const fornecedor = this.banco.fornecedores.find((item) => item.id === id);

    if (fornecedor === undefined) {
      return null;
    }

    return { ...fornecedor };
  }

  async criar(dados: FornecedorInput): Promise<Fornecedor> {
    const fornecedor: Fornecedor = {
      id: this.banco.proximoIdFornecedor,
      nome: dados.nome,
      email: dados.email,
      telefone: dados.telefone,
    };

    this.banco.proximoIdFornecedor += 1;
    this.banco.fornecedores.push(fornecedor);
    return { ...fornecedor };
  }

  async atualizar(id: number, dados: FornecedorInput): Promise<Fornecedor | null> {
    const fornecedor = this.banco.fornecedores.find((item) => item.id === id);

    if (fornecedor === undefined) {
      return null;
    }

    fornecedor.nome = dados.nome;
    fornecedor.email = dados.email;
    fornecedor.telefone = dados.telefone;
    return { ...fornecedor };
  }

  async excluir(id: number): Promise<boolean> {
    const indice = this.banco.fornecedores.findIndex((fornecedor) => fornecedor.id === id);

    if (indice === -1) {
      return false;
    }

    const possuiCompras = this.banco.compras.some((compra) => compra.fornecedorId === id);

    if (possuiCompras) {
      throw new ApplicationError('Este fornecedor possui compras vinculadas e não pode ser excluído.', 409);
    }

    this.banco.fornecedores.splice(indice, 1);
    return true;
  }
}
