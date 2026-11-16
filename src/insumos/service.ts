import { ApplicationError, ValidationError } from '../shared/errors.js';
import { lerCampoTexto } from '../shared/forms.js';
import { unidadesMedida } from './insumo.js';
import type { InsumoInput, InsumoRepository, UnidadeMedida } from './insumo.js';

export function valoresFormulario(formulario: unknown) {
  return {
    nome: lerCampoTexto(formulario, 'nome'),
    descricao: lerCampoTexto(formulario, 'descricao'),
    unidadeMedida: lerCampoTexto(formulario, 'unidadeMedida'),
  };
}

function validarInsumo(formulario: unknown): InsumoInput {
  const valores = valoresFormulario(formulario);
  const erros: Record<string, string> = {};

  if (valores.nome.length === 0 || valores.nome.length > 120) {
    erros.nome = 'Informe um nome com até 120 caracteres.';
  }

  if (valores.descricao.length > 500) {
    erros.descricao = 'A descrição deve ter até 500 caracteres.';
  }

  const unidadeValida = unidadesMedida.includes(valores.unidadeMedida as UnidadeMedida);

  if (!unidadeValida) {
    erros.unidadeMedida = 'Selecione uma unidade válida.';
  }

  if (Object.keys(erros).length > 0) {
    throw new ValidationError(erros);
  }

  return {
    nome: valores.nome,
    descricao: valores.descricao,
    unidadeMedida: valores.unidadeMedida as UnidadeMedida,
  };
}

export class InsumoService {
  private readonly repositorio: InsumoRepository;

  constructor(repositorio: InsumoRepository) {
    this.repositorio = repositorio;
  }

  listar(busca: string) {
    return this.repositorio.listar(busca);
  }

  async buscarPorId(id: number) {
    const insumo = await this.repositorio.buscarPorId(id);

    if (insumo === null) {
      throw new ApplicationError('Insumo não encontrado.', 404);
    }

    return insumo;
  }

  criar(formulario: unknown) {
    const dados = validarInsumo(formulario);
    return this.repositorio.criar(dados);
  }

  async atualizar(id: number, formulario: unknown) {
    const dados = validarInsumo(formulario);
    const insumo = await this.repositorio.atualizar(id, dados);

    if (insumo === null) {
      throw new ApplicationError('Insumo não encontrado.', 404);
    }

    return insumo;
  }

  async excluir(id: number) {
    const excluido = await this.repositorio.excluir(id);

    if (!excluido) {
      throw new ApplicationError('Insumo não encontrado.', 404);
    }
  }
}
