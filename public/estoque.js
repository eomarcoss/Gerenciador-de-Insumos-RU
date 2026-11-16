// Esta função só atualiza a informação exibida. O servidor valida o saldo ao salvar.
const campoInsumo = document.querySelector('#insumoId');
const avisoSaldo = document.querySelector('#saldo-atual');
const rotuloUnidade = document.querySelector('#unidade-quantidade');

function atualizarSaldoExibido() {
  const opcao = campoInsumo.selectedOptions[0];

  if (campoInsumo.value === '') {
    avisoSaldo.textContent = 'Selecione um insumo para consultar o saldo disponível.';
    rotuloUnidade.textContent = '';
    return;
  }

  avisoSaldo.textContent = 'Saldo disponível: ' + opcao.dataset.saldo + ' ' + opcao.dataset.unidade;
  rotuloUnidade.textContent = '(' + opcao.dataset.unidade + ')';
}

if (campoInsumo !== null) {
  campoInsumo.addEventListener('change', atualizarSaldoExibido);
  atualizarSaldoExibido();
}
