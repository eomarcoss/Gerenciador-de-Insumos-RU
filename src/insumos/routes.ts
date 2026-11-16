import { Router } from 'express';
import type { Response } from 'express';
import { ApplicationError, ValidationError } from '../shared/errors.js';
import { lerCampoTexto, lerId } from '../shared/forms.js';
import { unidadesMedida } from './insumo.js';
import type { InsumoRepository } from './insumo.js';
import { InsumoService, valoresFormulario } from './service.js';

function mostrarFormulario(
  resposta: Response,
  id: number | null,
  valores: Record<string, string>,
  campos: Record<string, string> = {},
  status = 200,
) {
  let titulo = 'Novo insumo';

  if (id !== null) {
    titulo = 'Editar insumo';
  }

  resposta.status(status).render('insumos/form', {
    id, valores, campos, unidadesMedida, title: titulo,
  });
}

export function criarRotasInsumos(repositorio: InsumoRepository) {
  const rotas = Router();
  const servico = new InsumoService(repositorio);
  const mensagens: Record<string, string> = {
    criado: 'Insumo cadastrado com sucesso.',
    atualizado: 'Insumo atualizado com sucesso.',
    excluido: 'Insumo excluído com sucesso.',
  };

  rotas.get('/', async (requisicao, resposta) => {
    const busca = lerCampoTexto(requisicao.query, 'q').slice(0, 120);
    const codigoMensagem = lerCampoTexto(requisicao.query, 'status');
    let mensagem = '';

    if (Object.hasOwn(mensagens, codigoMensagem)) {
      mensagem = mensagens[codigoMensagem] ?? '';
    }

    const insumos = await servico.listar(busca);
    resposta.render('insumos/index', { insumos, busca, mensagem, title: 'Insumos' });
  });

  rotas.get('/novo', (_requisicao, resposta) => {
    mostrarFormulario(resposta, null, { nome: '', descricao: '', unidadeMedida: 'kg' });
  });

  rotas.post('/', async (requisicao, resposta) => {
    try {
      await servico.criar(requisicao.body);
      resposta.redirect(303, '/insumos?status=criado');
    } catch (erro) {
      if (erro instanceof ValidationError) {
        const valores = valoresFormulario(requisicao.body);
        mostrarFormulario(resposta, null, valores, erro.campos, erro.status);
        return;
      }

      throw erro;
    }
  });

  rotas.get('/:id/editar', async (requisicao, resposta) => {
    const id = lerId(requisicao.params.id);
    const insumo = await servico.buscarPorId(id);
    mostrarFormulario(resposta, id, { nome: insumo.nome, descricao: insumo.descricao, unidadeMedida: insumo.unidadeMedida });
  });

  rotas.post('/:id/editar', async (requisicao, resposta) => {
    const id = lerId(requisicao.params.id);

    try {
      await servico.atualizar(id, requisicao.body);
      resposta.redirect(303, '/insumos?status=atualizado');
    } catch (erro) {
      const valores = valoresFormulario(requisicao.body);

      if (erro instanceof ValidationError) {
        mostrarFormulario(resposta, id, valores, erro.campos, erro.status);
        return;
      }

      if (erro instanceof ApplicationError && erro.status === 409) {
        mostrarFormulario(resposta, id, valores, { unidadeMedida: erro.message }, 409);
        return;
      }

      throw erro;
    }
  });

  rotas.get('/:id/excluir', async (requisicao, resposta) => {
    const id = lerId(requisicao.params.id);
    const insumo = await servico.buscarPorId(id);
    resposta.render('insumos/delete', { insumo, erro: null, title: 'Excluir insumo' });
  });

  rotas.post('/:id/excluir', async (requisicao, resposta) => {
    const id = lerId(requisicao.params.id);

    try {
      await servico.excluir(id);
      resposta.redirect(303, '/insumos?status=excluido');
    } catch (erro) {
      if (erro instanceof ApplicationError && erro.status === 409) {
        const insumo = await servico.buscarPorId(id);
        resposta.status(409).render('insumos/delete', { insumo, erro: erro.message, title: 'Excluir insumo' });
        return;
      }

      throw erro;
    }
  });

  return rotas;
}
