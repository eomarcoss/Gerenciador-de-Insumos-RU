import { Router } from 'express';
import type { Response } from 'express';
import { ApplicationError, ValidationError } from '../shared/errors.js';
import { lerCampoTexto } from '../shared/forms.js';
import type { EstoqueRepository } from './movimentacao.js';
import { EstoqueService, valoresFormulario } from './service.js';

export function criarRotasEstoque(repositorio: EstoqueRepository) {
  const rotas = Router();
  const servico = new EstoqueService(repositorio);

  async function mostrarFormulario(
    resposta: Response,
    valores: Record<string, string>,
    campos: Record<string, string> = {},
    erroGeral = '',
    status = 200,
  ) {
    const saldos = await servico.listarSaldos();
    resposta.status(status).render('estoque/form', {
      saldos, valores, campos, erroGeral, title: 'Registrar movimentação',
    });
  }

  rotas.get('/', async (requisicao, resposta) => {
    const saldos = await servico.listarSaldos();
    const movimentacoes = await servico.listarMovimentacoes();
    let mensagem = '';

    if (lerCampoTexto(requisicao.query, 'status') === 'registrado') {
      mensagem = 'Movimentação registrada com sucesso.';
    }

    resposta.render('estoque/index', {
      saldos, movimentacoes, mensagem, title: 'Movimentações de estoque',
    });
  });

  rotas.get('/nova', async (_requisicao, resposta) => {
    await mostrarFormulario(resposta, { insumoId: '', tipo: 'ENTRADA', quantidade: '', observacao: '' });
  });

  rotas.post('/', async (requisicao, resposta) => {
    try {
      await servico.registrar(requisicao.body);
      resposta.redirect(303, '/movimentacoes?status=registrado');
    } catch (erro) {
      const valores = valoresFormulario(requisicao.body);

      if (erro instanceof ValidationError) {
        await mostrarFormulario(resposta, valores, erro.campos, '', erro.status);
        return;
      }

      if (erro instanceof ApplicationError) {
        await mostrarFormulario(resposta, valores, {}, erro.message, erro.status);
        return;
      }

      throw erro;
    }
  });

  return rotas;
}
