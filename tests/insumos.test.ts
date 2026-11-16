import assert from 'node:assert/strict';
import test from 'node:test';
import { comServidor, enviarFormulario } from './helpers.js';

test('insumos: cadastro, consulta, edição e exclusão pelos formulários HTTP', async () => {
  await comServidor(async (url, repositorios) => {
    const respostaInicial = await fetch(url + '/insumos');
    assert.equal(respostaInicial.status, 200);
    assert.match(await respostaInicial.text(), /Arroz branco/);

    const paginaCadastro = await fetch(url + '/insumos/novo');
    assert.equal(paginaCadastro.status, 200);

    const cadastro = await enviarFormulario(url + '/insumos', {
      nome: '  Lentilha  ', descricao: 'Grãos secos', unidadeMedida: 'kg',
    });
    assert.equal(cadastro.status, 303);
    assert.equal(cadastro.headers.get('location'), '/insumos?status=criado');

    const encontrados = await repositorios.insumos.listar('lentilha');
    const lentilha = encontrados[0];
    assert.ok(lentilha);
    assert.equal(lentilha.nome, 'Lentilha');

    const paginaAposCadastro = await fetch(url + '/insumos');
    assert.match(await paginaAposCadastro.text(), /Lentilha/);

    const edicao = await enviarFormulario(url + '/insumos/' + lentilha.id + '/editar', {
      nome: 'Lentilha verde', descricao: '', unidadeMedida: 'g',
    });
    assert.equal(edicao.status, 303);

    const atualizado = await repositorios.insumos.buscarPorId(lentilha.id);
    assert.equal(atualizado?.unidadeMedida, 'g');

    const pesquisa = await fetch(url + '/insumos?q=lentilha');
    const resultadoPesquisa = await pesquisa.text();
    assert.match(resultadoPesquisa, /Lentilha verde/);
    assert.doesNotMatch(resultadoPesquisa, /Arroz branco/);

    const confirmacao = await fetch(url + '/insumos/' + lentilha.id + '/excluir');
    assert.equal(confirmacao.status, 200);
    assert.ok(await repositorios.insumos.buscarPorId(lentilha.id));

    const exclusao = await enviarFormulario(url + '/insumos/' + lentilha.id + '/excluir', {});
    assert.equal(exclusao.status, 303);
    assert.equal(await repositorios.insumos.buscarPorId(lentilha.id), null);
  });
});

test('insumos: validação rejeita campos inválidos sem modificar o catálogo', async () => {
  await comServidor(async (url, repositorios) => {
    const cadastro = await enviarFormulario(url + '/insumos', {
      nome: '  ', descricao: 'x'.repeat(501), unidadeMedida: 'invalida',
    });
    assert.equal(cadastro.status, 422);

    const html = await cadastro.text();
    assert.match(html, /Informe um nome/);
    assert.match(html, /descrição deve ter até 500/);
    assert.match(html, /Selecione uma unidade válida/);
    assert.equal((await repositorios.insumos.listar('')).length, 8);

    const edicao = await enviarFormulario(url + '/insumos/1/editar', {
      nome: 'x'.repeat(121), descricao: '', unidadeMedida: 'kg',
    });
    assert.equal(edicao.status, 422);
    assert.equal((await repositorios.insumos.buscarPorId(1))?.nome, 'Arroz branco');
  });
});

test('insumos: vínculos bloqueiam exclusão e troca da unidade, mas permitem editar a descrição', async () => {
  await comServidor(async (url, repositorios) => {
    const exclusao = await enviarFormulario(url + '/insumos/1/excluir', {});
    assert.equal(exclusao.status, 409);
    assert.match(await exclusao.text(), /possui registros vinculados/);

    const trocaUnidade = await enviarFormulario(url + '/insumos/1/editar', {
      nome: 'Arroz branco', descricao: 'Atualizado', unidadeMedida: 'L',
    });
    assert.equal(trocaUnidade.status, 409);
    assert.equal((await repositorios.insumos.buscarPorId(1))?.unidadeMedida, 'kg');

    const atualizacao = await enviarFormulario(url + '/insumos/1/editar', {
      nome: 'Arroz branco', descricao: 'Atualizado', unidadeMedida: 'kg',
    });
    assert.equal(atualizacao.status, 303);
    assert.equal((await repositorios.insumos.buscarPorId(1))?.descricao, 'Atualizado');
  });
});

test('insumos: pesquisa ignora acentos e o EJS escapa HTML', async () => {
  await comServidor(async (url) => {
    const busca = await fetch(url + '/insumos?q=feijao');
    assert.match(await busca.text(), /Feijão carioca/);

    await enviarFormulario(url + '/insumos', {
      nome: '<script>alert("teste")</script>', descricao: '<b>texto</b>', unidadeMedida: 'un',
    });
    const resposta = await fetch(url + '/insumos');
    const html = await resposta.text();
    assert.doesNotMatch(html, /<script>alert/);
    assert.match(html, /&lt;script&gt;/);
    assert.match(html, /&lt;b&gt;texto&lt;\/b&gt;/);

    const pesquisaVazia = await fetch(url + '/insumos?q=produto-inexistente');
    assert.match(await pesquisaVazia.text(), /Nenhum insumo encontrado/);
  });
});

test('rotas: identificadores inválidos, registros ausentes e arquivos estáticos', async () => {
  await comServidor(async (url) => {
    for (const id of ['0', '01', '1abc', '9007199254740992']) {
      const resposta = await fetch(url + '/insumos/' + id + '/editar');
      assert.equal(resposta.status, 400);
    }

    const rotasAusentes = ['/insumos/999/editar', '/fornecedores/999/editar', '/pagina-inexistente'];
    for (const rota of rotasAusentes) {
      assert.equal((await fetch(url + rota)).status, 404);
    }

    const arquivos = ['/assets/app.css', '/assets/estoque.js', '/vendor/bootstrap.min.css', '/fonts/dm-sans-latin-wght-normal.woff2'];
    for (const arquivo of arquivos) {
      assert.equal((await fetch(url + arquivo)).status, 200);
    }
  });
});
