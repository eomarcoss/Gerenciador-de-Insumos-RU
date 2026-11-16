import express from 'express';
import type { ErrorRequestHandler } from 'express';
import { fileURLToPath } from 'node:url';
import { ApplicationError } from './shared/errors.js';
import type { Repositorios } from './repositories.js';
import { criarRotasInsumos } from './insumos/routes.js';
import { criarRotasFornecedores } from './fornecedores/routes.js';
import { criarRotasEstoque } from './estoque/routes.js';

export function criarApp(repositorios: Repositorios, modoMemoria = true) {
  const app = express();

  // O Express recebe os formulários. O EJS transforma os templates em HTML.
  app.disable('x-powered-by');
  app.set('view engine', 'ejs');
  app.set('views', fileURLToPath(new URL('../views', import.meta.url)));
  app.use(express.urlencoded({ extended: false, limit: '10kb' }));

  app.locals.modoMemoria = modoMemoria;
  app.locals.formatarQuantidade = (quantidade: number) => {
    return quantidade.toLocaleString('pt-BR', { maximumFractionDigits: 3 });
  };
  app.locals.formatarData = (data: string) => {
    return new Date(data).toLocaleString('pt-BR', {
      timeZone: 'America/Sao_Paulo',
      dateStyle: 'short',
      timeStyle: 'short',
    });
  };

  app.use((requisicao, resposta, proximo) => {
    // A primeira parte da URL identifica a aba que deve ficar destacada.
    resposta.locals.moduloAtivo = requisicao.path.split('/')[1];
    proximo();
  });

  app.use('/assets', express.static(fileURLToPath(new URL('../public', import.meta.url))));
  app.use('/vendor', express.static(fileURLToPath(new URL('../node_modules/bootstrap/dist/css', import.meta.url))));
  app.use('/fonts', express.static(fileURLToPath(new URL('../node_modules/@fontsource-variable/dm-sans/files', import.meta.url))));

  app.get('/', (_requisicao, resposta) => {
    resposta.redirect('/insumos');
  });

  app.use('/insumos', criarRotasInsumos(repositorios.insumos));
  app.use('/fornecedores', criarRotasFornecedores(repositorios.fornecedores));
  app.use('/movimentacoes', criarRotasEstoque(repositorios.estoque));

  app.use((_requisicao, resposta) => {
    resposta.status(404).render('error', {
      title: 'Página não encontrada',
      mensagem: 'Esta página não foi encontrada.',
      status: 404,
    });
  });

  // Erros inesperados chegam aqui. Detalhes técnicos ficam no terminal.
  const tratarErro: ErrorRequestHandler = (erro: unknown, _requisicao, resposta, _proximo) => {
    let status = 500;
    let mensagem = 'Não foi possível concluir a operação. Tente novamente.';

    if (erro instanceof ApplicationError) {
      status = erro.status;
      mensagem = erro.message;
    } else if (typeof erro === 'object' && erro !== null && 'status' in erro) {
      if (erro.status === 413) {
        status = 413;
        mensagem = 'Os dados enviados excedem o tamanho permitido.';
      } else if (erro.status === 400) {
        status = 400;
        mensagem = 'Não foi possível ler os dados enviados.';
      }
    }

    if (status === 500) {
      console.error('Falha ao processar requisição:', erro);
    }

    resposta.status(status).render('error', {
      title: 'Não foi possível concluir', mensagem, status,
    });
  };

  app.use(tratarErro);
  return app;
}
