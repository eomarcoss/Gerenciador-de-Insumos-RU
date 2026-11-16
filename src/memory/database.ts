import type { Insumo } from '../insumos/insumo.js';
import type { Fornecedor } from '../fornecedores/fornecedor.js';
import type { Movimentacao } from '../estoque/movimentacao.js';

interface Compra {
  id: number;
  fornecedorId: number;
  data: string;
}

interface ItemCompra {
  id: number;
  compraId: number;
  insumoId: number;
  quantidade: number;
  precoUnitario: number;
}

function calcularProximoId(registros: { id: number }[]): number {
  let maiorId = 0;

  for (const registro of registros) {
    if (registro.id > maiorId) {
      maiorId = registro.id;
    }
  }

  return maiorId + 1;
}

// Os cinco conjuntos representam as cinco tabelas previstas pelo grupo.
// Cada servidor ou teste recebe uma instância independente deste banco.
export class BancoEmMemoria {
  public insumos: Insumo[] = [
    { id: 1, nome: 'Arroz branco', descricao: 'Tipo 1 · pacote de 5 kg', unidadeMedida: 'kg' },
    { id: 2, nome: 'Feijão carioca', descricao: 'Tipo 1 · grãos selecionados', unidadeMedida: 'kg' },
    { id: 3, nome: 'Óleo de soja', descricao: 'Óleo vegetal refinado', unidadeMedida: 'L' },
    { id: 4, nome: 'Açúcar cristal', descricao: 'Açúcar branco cristal', unidadeMedida: 'kg' },
    { id: 5, nome: 'Farinha de mandioca', descricao: 'Farinha torrada fina', unidadeMedida: 'kg' },
    { id: 6, nome: 'Café em pó', descricao: 'Torrado e moído', unidadeMedida: 'kg' },
    { id: 7, nome: 'Macarrão espaguete', descricao: 'Massa de sêmola', unidadeMedida: 'kg' },
    { id: 8, nome: 'Sal refinado', descricao: 'Sal iodado', unidadeMedida: 'kg' },
  ];

  public fornecedores: Fornecedor[] = [
    { id: 1, nome: 'Distribuidora Boa Mesa', email: 'contato@boamesa.example', telefone: '(28) 3333-1000' },
    { id: 2, nome: 'Cerealista Vale Verde', email: 'vendas@valeverde.example', telefone: '(28) 3333-2000' },
    { id: 3, nome: 'Comercial Alimentos do Sul', email: 'contato@alimentosdosul.example', telefone: '(28) 3333-3000' },
    { id: 4, nome: 'Distribuidora Nova Safra', email: '', telefone: '' },
  ];

  public compras: Compra[] = [
    { id: 1, fornecedorId: 1, data: '2026-11-10' },
    { id: 2, fornecedorId: 2, data: '2026-11-11' },
  ];

  public itensCompra: ItemCompra[] = [
    { id: 1, compraId: 1, insumoId: 1, quantidade: 100, precoUnitario: 5 },
    { id: 2, compraId: 2, insumoId: 2, quantidade: 60, precoUnitario: 7 },
  ];

  public movimentacoes: Movimentacao[] = [
    { id: 1, insumoId: 1, tipo: 'ENTRADA', quantidade: 100, data: '2026-11-10T11:00:00.000Z', observacao: 'Recebimento da compra de demonstração 1.' },
    { id: 2, insumoId: 2, tipo: 'ENTRADA', quantidade: 60, data: '2026-11-11T11:00:00.000Z', observacao: 'Recebimento da compra de demonstração 2.' },
    { id: 3, insumoId: 1, tipo: 'SAIDA', quantidade: 25, data: '2026-11-12T14:30:00.000Z', observacao: 'Preparo do almoço no RU.' },
    { id: 4, insumoId: 2, tipo: 'SAIDA', quantidade: 10, data: '2026-11-12T14:30:00.000Z', observacao: 'Preparo do almoço no RU.' },
  ];

  public proximoIdInsumo = calcularProximoId(this.insumos);
  public proximoIdFornecedor = calcularProximoId(this.fornecedores);
  public proximoIdMovimentacao = calcularProximoId(this.movimentacoes);
}
