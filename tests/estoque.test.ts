import assert from 'node:assert/strict';
import test from 'node:test';
import { comServidor, enviarFormulario } from './helpers.js';

test('estoque: saldos iniciais e histórico são calculados pelas movimentações', async () => {
  await comServidor(async (url, repositorios) => {
    const saldos = await repositorios.estoque.listarSaldos();
    assert.equal(saldos.find((saldo) => saldo.insumoId === 1)?.quantidade, 75);
    assert.equal(saldos.find((saldo) => saldo.insumoId === 2)?.quantidade, 50);
    assert.equal(saldos.find((saldo) => saldo.insumoId === 3)?.quantidade, 0);

    const pagina = await fetch(url + '/movimentacoes');
    assert.equal(pagina.status, 200);
    const html = await pagina.text();
    assert.match(html, /Histórico de movimentações/);
    assert.match(html, /Estoque disponível/);
    assert.equal((await fetch(url + '/movimentacoes/nova')).status, 200);
  });
});

test('estoque: entradas e saídas atualizam saldo e criam vínculos de exclusão', async () => {
  await comServidor(async (url, repositorios) => {
    const entrada = await enviarFormulario(url + '/movimentacoes', {
      insumoId: '3', tipo: 'ENTRADA', quantidade: '10,5', observacao: 'Recebimento',
    });
    assert.equal(entrada.status, 303);

    const saida = await enviarFormulario(url + '/movimentacoes', {
      insumoId: '3', tipo: 'SAIDA', quantidade: '2.25', observacao: 'Consumo no almoço',
    });
    assert.equal(saida.status, 303);

    const saldos = await repositorios.estoque.listarSaldos();
    assert.equal(saldos.find((saldo) => saldo.insumoId === 3)?.quantidade, 8.25);

    const historico = await repositorios.estoque.listarMovimentacoes();
    assert.equal(historico.length, 6);
    assert.equal(historico[0]?.observacao, 'Consumo no almoço');

    const exclusao = await enviarFormulario(url + '/insumos/3/excluir', {});
    assert.equal(exclusao.status, 409);
  });
});

test('estoque: saída excessiva não altera saldo nem histórico e mantém o formulário', async () => {
  await comServidor(async (url, repositorios) => {
    const resposta = await enviarFormulario(url + '/movimentacoes', {
      insumoId: '1', tipo: 'SAIDA', quantidade: '76', observacao: 'Teste de saída',
    });
    assert.equal(resposta.status, 409);
    const html = await resposta.text();
    assert.match(html, /Estoque insuficiente/);
    assert.match(html, /Teste de saída/);
    assert.equal((await repositorios.estoque.listarMovimentacoes()).length, 4);

    const saldos = await repositorios.estoque.listarSaldos();
    assert.equal(saldos.find((saldo) => saldo.insumoId === 1)?.quantidade, 75);

    const zerar = await enviarFormulario(url + '/movimentacoes', {
      insumoId: '1', tipo: 'SAIDA', quantidade: '75', observacao: '',
    });
    assert.equal(zerar.status, 303);
    const saldosZerados = await repositorios.estoque.listarSaldos();
    assert.equal(saldosZerados.find((saldo) => saldo.insumoId === 1)?.quantidade, 0);
  });
});

test('estoque: quantidades fracionárias não deixam resíduos de ponto flutuante', async () => {
  await comServidor(async (url, repositorios) => {
    await enviarFormulario(url + '/movimentacoes', { insumoId: '3', tipo: 'ENTRADA', quantidade: '0.1', observacao: '' });
    await enviarFormulario(url + '/movimentacoes', { insumoId: '3', tipo: 'ENTRADA', quantidade: '0.2', observacao: '' });
    const saida = await enviarFormulario(url + '/movimentacoes', { insumoId: '3', tipo: 'SAIDA', quantidade: '0.3', observacao: '' });
    assert.equal(saida.status, 303);
    const saldos = await repositorios.estoque.listarSaldos();
    assert.equal(saldos.find((saldo) => saldo.insumoId === 3)?.quantidade, 0);
  });
});

test('estoque: duas saídas simultâneas disputam o mesmo saldo sem deixá-lo negativo', async () => {
  await comServidor(async (url, repositorios) => {
    await enviarFormulario(url + '/movimentacoes', { insumoId: '3', tipo: 'ENTRADA', quantidade: '10', observacao: '' });
    const respostas = await Promise.all([
      enviarFormulario(url + '/movimentacoes', { insumoId: '3', tipo: 'SAIDA', quantidade: '7', observacao: '' }),
      enviarFormulario(url + '/movimentacoes', { insumoId: '3', tipo: 'SAIDA', quantidade: '7', observacao: '' }),
    ]);
    const codigos = respostas.map((resposta) => resposta.status).sort();
    assert.deepEqual(codigos, [303, 409]);
    const saldos = await repositorios.estoque.listarSaldos();
    assert.equal(saldos.find((saldo) => saldo.insumoId === 3)?.quantidade, 3);
    assert.equal((await repositorios.estoque.listarMovimentacoes()).length, 6);
  });
});

test('estoque: validação rejeita quantidades inválidas e insumos ausentes', async () => {
  await comServidor(async (url, repositorios) => {
    for (const quantidade of ['0', '-1', 'NaN', 'Infinity', '1e3', '0.0001', '1000000000']) {
      const resposta = await enviarFormulario(url + '/movimentacoes', {
        insumoId: '3', tipo: 'ENTRADA', quantidade, observacao: '',
      });
      assert.equal(resposta.status, 422);
    }

    const tipoInvalido = await enviarFormulario(url + '/movimentacoes', {
      insumoId: '3', tipo: 'OUTRO', quantidade: '1', observacao: '',
    });
    assert.equal(tipoInvalido.status, 422);

    await enviarFormulario(url + '/insumos/3/excluir', {});
    const insumoExcluido = await enviarFormulario(url + '/movimentacoes', {
      insumoId: '3', tipo: 'ENTRADA', quantidade: '1', observacao: '',
    });
    assert.equal(insumoExcluido.status, 404);
    assert.equal((await repositorios.estoque.listarMovimentacoes()).length, 4);
  });
});
