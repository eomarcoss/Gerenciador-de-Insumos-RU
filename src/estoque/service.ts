import { ValidationError } from '../shared/errors.js';
import { lerCampoTexto } from '../shared/forms.js';
import type { EstoqueRepository, MovimentacaoInput, TipoMovimentacao } from './movimentacao.js';

export function valoresFormulario(formulario: unknown) {
  return {
    insumoId: lerCampoTexto(formulario, 'insumoId'),
    tipo: lerCampoTexto(formulario, 'tipo'),
    quantidade: lerCampoTexto(formulario, 'quantidade'),
    observacao: lerCampoTexto(formulario, 'observacao'),
  };
}

function validarMovimentacao(formulario: unknown): MovimentacaoInput {
  const valores = valoresFormulario(formulario);
  const erros: Record<string, string> = {};
  const insumoId = Number(valores.insumoId);

  if (!/^[1-9]\d*$/.test(valores.insumoId) || !Number.isSafeInteger(insumoId)) {
    erros.insumoId = 'Selecione um insumo válido.';
  }

  if (valores.tipo !== 'ENTRADA' && valores.tipo !== 'SAIDA') {
    erros.tipo = 'Selecione entrada ou saída.';
  }

  // Aceitamos vírgula ou ponto e até três casas decimais.
  const formatoQuantidadeValido = /^\d+([.,]\d{1,3})?$/.test(valores.quantidade);
  const quantidade = Number(valores.quantidade.replace(',', '.'));

  if (
    !formatoQuantidadeValido
    || !Number.isFinite(quantidade)
    || quantidade <= 0
    || quantidade > 999999999.999
  ) {
    erros.quantidade = 'Informe uma quantidade maior que zero, com até 3 casas decimais e no máximo 999999999,999.';
  }

  if (valores.observacao.length > 500) {
    erros.observacao = 'A observação deve ter até 500 caracteres.';
  }

  if (Object.keys(erros).length > 0) {
    throw new ValidationError(erros);
  }

  return {
    insumoId,
    tipo: valores.tipo as TipoMovimentacao,
    quantidade,
    observacao: valores.observacao,
  };
}

export class EstoqueService {
  private readonly repositorio: EstoqueRepository;

  constructor(repositorio: EstoqueRepository) {
    this.repositorio = repositorio;
  }

  listarSaldos() {
    return this.repositorio.listarSaldos();
  }

  listarMovimentacoes() {
    return this.repositorio.listarMovimentacoes();
  }

  registrar(formulario: unknown) {
    const dados = validarMovimentacao(formulario);
    return this.repositorio.registrar(dados);
  }
}
