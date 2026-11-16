import { ApplicationError } from './errors.js';

// Só aceitamos texto nos campos dos formulários.
export function lerCampoTexto(formulario: unknown, nomeCampo: string): string {
  if (typeof formulario !== 'object' || formulario === null) {
    return '';
  }

  const campos = formulario as Record<string, unknown>;
  const valor = campos[nomeCampo];

  if (typeof valor !== 'string') {
    return '';
  }

  return valor.trim();
}

export function lerId(valor: unknown): number {
  if (typeof valor !== 'string' || !/^[1-9]\d*$/.test(valor)) {
    throw new ApplicationError('Identificador inválido.', 400);
  }

  const id = Number(valor);

  if (!Number.isSafeInteger(id)) {
    throw new ApplicationError('Identificador inválido.', 400);
  }

  return id;
}

export function normalizarTexto(texto: string): string {
  // Assim, "feijao" também encontra "Feijão".
  return texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}
