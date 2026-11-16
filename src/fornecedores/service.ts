import { ApplicationError, ValidationError } from '../shared/errors.js';
import { lerCampoTexto } from '../shared/forms.js';
import type { FornecedorInput, FornecedorRepository } from './fornecedor.js';

export function valoresFormulario(formulario: unknown): FornecedorInput {
  return {
    nome: lerCampoTexto(formulario, 'nome'),
    email: lerCampoTexto(formulario, 'email'),
    telefone: lerCampoTexto(formulario, 'telefone'),
  };
}

function validarFornecedor(formulario: unknown): FornecedorInput {
  const valores = valoresFormulario(formulario);
  const erros: Record<string, string> = {};

  if (valores.nome.length === 0 || valores.nome.length > 120) {
    erros.nome = 'Informe um nome com até 120 caracteres.';
  }

  const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valores.email);

  if (valores.email.length > 254 || (valores.email !== '' && !emailValido)) {
    erros.email = 'Informe um e-mail válido com até 254 caracteres.';
  }

  if (valores.telefone.length > 30) {
    erros.telefone = 'O telefone deve ter até 30 caracteres.';
  }

  if (Object.keys(erros).length > 0) {
    throw new ValidationError(erros);
  }

  return valores;
}

export class FornecedorService {
  private readonly repositorio: FornecedorRepository;

  constructor(repositorio: FornecedorRepository) {
    this.repositorio = repositorio;
  }

  listar(busca: string) {
    return this.repositorio.listar(busca);
  }

  async buscarPorId(id: number) {
    const fornecedor = await this.repositorio.buscarPorId(id);

    if (fornecedor === null) {
      throw new ApplicationError('Fornecedor não encontrado.', 404);
    }

    return fornecedor;
  }

  criar(formulario: unknown) {
    const dados = validarFornecedor(formulario);
    return this.repositorio.criar(dados);
  }

  async atualizar(id: number, formulario: unknown) {
    const dados = validarFornecedor(formulario);
    const fornecedor = await this.repositorio.atualizar(id, dados);

    if (fornecedor === null) {
      throw new ApplicationError('Fornecedor não encontrado.', 404);
    }

    return fornecedor;
  }

  async excluir(id: number) {
    const excluido = await this.repositorio.excluir(id);

    if (!excluido) {
      throw new ApplicationError('Fornecedor não encontrado.', 404);
    }
  }
}
