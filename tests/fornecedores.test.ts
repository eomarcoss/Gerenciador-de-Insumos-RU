import assert from 'node:assert/strict';
import test from 'node:test';
import { comServidor, enviarFormulario } from './helpers.js';

test('fornecedores: cadastro, pesquisa, edição e exclusão pelos formulários HTTP', async () => {
  await comServidor(async (url, repositorios) => {
    assert.equal((await fetch(url + '/fornecedores')).status, 200);
    assert.equal((await fetch(url + '/fornecedores/novo')).status, 200);

    const cadastro = await enviarFormulario(url + '/fornecedores', {
      nome: '  Comércio São João  ', email: 'contato@exemplo.com', telefone: '(28) 99999-0000',
    });
    assert.equal(cadastro.status, 303);

    const encontrados = await repositorios.fornecedores.listar('sao joao');
    const fornecedor = encontrados[0];
    assert.ok(fornecedor);
    assert.equal(fornecedor.nome, 'Comércio São João');

    const pesquisa = await fetch(url + '/fornecedores?q=sao%20joao');
    const resultado = await pesquisa.text();
    assert.match(resultado, /Comércio São João/);
    assert.doesNotMatch(resultado, /Boa Mesa/);

    const paginaEdicao = await fetch(url + '/fornecedores/' + fornecedor.id + '/editar');
    assert.equal(paginaEdicao.status, 200);

    const edicao = await enviarFormulario(url + '/fornecedores/' + fornecedor.id + '/editar', {
      nome: 'Comércio São João', email: '', telefone: '',
    });
    assert.equal(edicao.status, 303);
    assert.equal((await repositorios.fornecedores.buscarPorId(fornecedor.id))?.email, '');

    const confirmacao = await fetch(url + '/fornecedores/' + fornecedor.id + '/excluir');
    assert.equal(confirmacao.status, 200);
    assert.ok(await repositorios.fornecedores.buscarPorId(fornecedor.id));

    const exclusao = await enviarFormulario(url + '/fornecedores/' + fornecedor.id + '/excluir', {});
    assert.equal(exclusao.status, 303);
    assert.equal(await repositorios.fornecedores.buscarPorId(fornecedor.id), null);
  });
});

test('fornecedores: compras vinculadas impedem a exclusão', async () => {
  await comServidor(async (url, repositorios) => {
    const exclusao = await enviarFormulario(url + '/fornecedores/1/excluir', {});
    assert.equal(exclusao.status, 409);
    assert.match(await exclusao.text(), /compras vinculadas/);
    assert.ok(await repositorios.fornecedores.buscarPorId(1));

    const semCompras = await enviarFormulario(url + '/fornecedores/4/excluir', {});
    assert.equal(semCompras.status, 303);
  });
});

test('fornecedores: validação preserva os dados digitados e rejeita e-mail inválido', async () => {
  await comServidor(async (url, repositorios) => {
    const resposta = await enviarFormulario(url + '/fornecedores', {
      nome: '', email: 'email-invalido', telefone: '1'.repeat(31),
    });
    assert.equal(resposta.status, 422);
    const html = await resposta.text();
    assert.match(html, /e-mail válido/);
    assert.match(html, /email-invalido/);
    assert.match(html, /telefone deve ter até 30/);
    assert.equal((await repositorios.fornecedores.listar('')).length, 4);

    const ausente = await enviarFormulario(url + '/fornecedores/999/excluir', {});
    assert.equal(ausente.status, 404);
  });
});
