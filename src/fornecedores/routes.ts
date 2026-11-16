import { Router } from 'express';
import type { Response } from 'express';
import { ApplicationError, ValidationError } from '../shared/errors.js';
import { lerCampoTexto, lerId } from '../shared/forms.js';
import type { FornecedorInput, FornecedorRepository } from './fornecedor.js';
import { FornecedorService, valoresFormulario } from './service.js';

function mostrarFormulario(
  resposta: Response,
  id: number | null,
  valores: FornecedorInput,
  campos: Record<string, string> = {},
  status = 200,
) {
  let titulo = 'Novo fornecedor';

  if (id !== null) {
    titulo = 'Editar fornecedor';
  }

  resposta.status(status).render('fornecedores/form', { id, valores, campos, title: titulo });
}

export function criarRotasFornecedores(repositorio: FornecedorRepository) {
  const rotas = Router();
  const servico = new FornecedorService(repositorio);
  const mensagens: Record<string, string> = {
    criado: 'Fornecedor cadastrado com sucesso.',
    atualizado: 'Fornecedor atualizado com sucesso.',
    excluido: 'Fornecedor excluído com sucesso.',
  };

  rotas.get('/', async (requisicao, resposta) => {
    const busca = lerCampoTexto(requisicao.query, 'q').slice(0, 120);
    const codigoMensagem = lerCampoTexto(requisicao.query, 'status');
    let mensagem = '';

    if (Object.hasOwn(mensagens, codigoMensagem)) {
      mensagem = mensagens[codigoMensagem] ?? '';
    }

    const fornecedores = await servico.listar(busca);
    resposta.render('fornecedores/index', { fornecedores, busca, mensagem, title: 'Fornecedores' });
  });

  rotas.get('/novo', (_requisicao, resposta) => {
    mostrarFormulario(resposta, null, { nome: '', email: '', telefone: '' });
  });

  rotas.post('/', async (requisicao, resposta) => {
    try {
      await servico.criar(requisicao.body);
      resposta.redirect(303, '/fornecedores?status=criado');
    } catch (erro) {
      if (erro instanceof ValidationError) {
        mostrarFormulario(resposta, null, valoresFormulario(requisicao.body), erro.campos, erro.status);
        return;
      }

      throw erro;
    }
  });

  rotas.get('/:id/editar', async (requisicao, resposta) => {
    const id = lerId(requisicao.params.id);
    const fornecedor = await servico.buscarPorId(id);
    mostrarFormulario(resposta, id, fornecedor);
  });

  rotas.post('/:id/editar', async (requisicao, resposta) => {
    const id = lerId(requisicao.params.id);

    try {
      await servico.atualizar(id, requisicao.body);
      resposta.redirect(303, '/fornecedores?status=atualizado');
    } catch (erro) {
      if (erro instanceof ValidationError) {
        mostrarFormulario(resposta, id, valoresFormulario(requisicao.body), erro.campos, erro.status);
        return;
      }

      throw erro;
    }
  });

  rotas.get('/:id/excluir', async (requisicao, resposta) => {
    const id = lerId(requisicao.params.id);
    const fornecedor = await servico.buscarPorId(id);
    resposta.render('fornecedores/delete', { fornecedor, erro: null, title: 'Excluir fornecedor' });
  });

  rotas.post('/:id/excluir', async (requisicao, resposta) => {
    const id = lerId(requisicao.params.id);

    try {
      await servico.excluir(id);
      resposta.redirect(303, '/fornecedores?status=excluido');
    } catch (erro) {
      if (erro instanceof ApplicationError && erro.status === 409) {
        const fornecedor = await servico.buscarPorId(id);
        resposta.status(409).render('fornecedores/delete', { fornecedor, erro: erro.message, title: 'Excluir fornecedor' });
        return;
      }

      throw erro;
    }
  });

  return rotas;
}
