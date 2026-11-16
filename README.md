# Gerenciador de Insumos do RU

Sistema acadêmico em Node.js, TypeScript, Express, EJS e Bootstrap. As três abas estão disponíveis para conferência em memória.

## Executar no VS Code

Use Node.js 22.9 ou superior. Na pasta do projeto, execute no terminal:

```powershell
npm install
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000). No PowerShell, se a execução de `npm.ps1` estiver bloqueada, use `npm.cmd` no lugar de `npm`. Para encerrar o servidor, pressione `Ctrl+C`.

O modo padrão é `memory`. Os dados permanecem ao atualizar o navegador e são restaurados quando o servidor reinicia. Os testes automatizados utilizam instâncias próprias e preservam os dados da aplicação aberta.

## Telas disponíveis

| Aba | Operações |
| --- | --- |
| Insumos | Cadastrar, pesquisar por nome ou descrição, editar e excluir com confirmação |
| Fornecedores | Cadastrar, pesquisar por nome, e-mail ou telefone, editar e excluir com confirmação |
| Movimentações de estoque | Registrar entradas e saídas, consultar histórico e saldo de cada insumo |

Os fornecedores têm nome obrigatório e e-mail e telefone opcionais. Esses campos são provisórios até o alinhamento com o modelo relacional do grupo.

As compras e os itens de compra ficam nos dados de demonstração para representar os relacionamentos. Os recebimentos cadastrados pela interface geram entradas no estoque. A tela registra automaticamente a data e a hora, exibidas no horário de São Paulo.

## Conferência manual sugerida

1. Cadastre um insumo e confira que ele aparece com saldo zero na aba de movimentações.
2. Registre uma entrada de 10 kg e uma saída de 3 kg. O saldo deve ficar em 7 kg.
3. Tente retirar 8 kg. O sistema deve manter os 7 kg e mostrar uma mensagem de estoque insuficiente.
4. Tente excluir o insumo movimentado. A exclusão deve ser bloqueada mesmo quando seu saldo chegar a zero.
5. Cadastre outro insumo, edite e exclua antes de criar vínculos.
6. Cadastre um fornecedor, edite seus contatos e exclua.
7. Tente excluir Distribuidora Boa Mesa ou Cerealista Vale Verde. Ambas possuem compras de demonstração e a exclusão deve ser bloqueada.
8. Pesquise por nomes com e sem acentos e atualize a página para conferir a permanência dos dados.

O exemplo inicial contém 8 insumos, 4 fornecedores, 2 compras, 2 itens de compra e 4 movimentações. Arroz branco começa com 75 kg e Feijão carioca com 50 kg. Os demais insumos começam com saldo zero.

## Organização do código

```text
src/
  app.ts                  Configura o Express, EJS, arquivos públicos e rotas
  server.ts               Inicia e encerra o servidor
  database.ts             Seleciona o modo de armazenamento
  repositories.ts         Reúne os contratos e cria os repositórios em memória
  shared/
    errors.ts             Erros conhecidos e erros de validação
    forms.ts              Leitura de campos e identificadores
  memory/
    database.ts           Dados de demonstração das cinco tabelas
  insumos/
    insumo.ts             Tipos do insumo e contrato do repositório
    routes.ts             Recebe formulários e escolhe a resposta HTTP
    service.ts            Valida os dados e solicita as operações
    memory-repository.ts  Manipula os insumos em memória
    mysql-repository.ts   Adaptador SQL provisório
  fornecedores/           Mesma organização do módulo de insumos
  estoque/
    movimentacao.ts       Tipos das movimentações e dos saldos
    routes.ts             Listagem e formulário de movimentação
    service.ts            Valida os dados do formulário
    memory-repository.ts  Calcula saldos e registra entradas e saídas
    mysql-repository.ts   Adaptador SQL provisório com transações
views/
  partials/               Cabeçalho, rodapé e mensagens de validação
  insumos/                Listagem, formulário e confirmação de exclusão
  fornecedores/           Listagem, formulário e confirmação de exclusão
  estoque/                Saldos, histórico e formulário
  error.ejs               Página de erro
public/
  app.css                 Estilos compartilhados
  estoque.js              Atualiza o saldo exibido ao selecionar um insumo
tests/                    Testes das três abas por HTTP
```

O fluxo de uma operação segue esta ordem:

```text
Formulário HTML → Rota Express → Serviço → Repositório → Dados
```

A rota recebe a requisição e escolhe a página ou o redirecionamento. O serviço valida os dados. O repositório consulta ou altera o armazenamento. A interface do repositório define quais operações estão disponíveis, permitindo trocar memória por MySQL sem alterar os formulários.

Os três repositórios em memória compartilham uma instância de `BancoEmMemoria`. Por isso, uma movimentação passa a proteger o insumo contra exclusão. O fornecedor é protegido pelas compras vinculadas.

## Regras do estoque

O saldo é a soma das entradas menos a soma das saídas. Novos insumos começam com zero. As quantidades aceitam ponto ou vírgula, até três casas decimais e o limite de 999999999,999 por registro.

A conferência do saldo e a gravação da saída ficam juntas no repositório. Em memória, esse trecho executa sem `await`, garantindo a sequência das operações no processo Node. Para evitar resíduos de ponto flutuante, o cálculo converte quantidades para inteiros em milésimos.

A unidade de medida fica protegida quando o insumo possui compras ou movimentações. Isso preserva o significado das quantidades já registradas. Nome e descrição continuam editáveis.

No adaptador SQL, o registro utiliza uma transação e um bloqueio `SELECT ... FOR UPDATE` no insumo. A integração real ainda depende do esquema definitivo e de testes com MySQL.

## Conceitos para a apresentação

| Elemento | Papel no projeto |
| --- | --- |
| `interface` | Define os campos de um dado ou as operações de um repositório |
| `class` | Agrupa operações e os dados necessários para executá-las |
| `async` e `await` | Permitem aguardar operações como consultas ao banco |
| `Promise` | Representa o resultado futuro de uma operação |
| `GET` | Consulta uma página |
| `POST` | Envia um cadastro, edição, exclusão ou movimentação |
| `303` | Redireciona após salvar e evita repetir o POST ao atualizar |
| `422` | Indica campos inválidos no formulário |
| `409` | Indica conflito, como estoque insuficiente ou exclusão vinculada |

Uma apresentação pode começar no formulário de cadastro, seguir para `routes.ts`, mostrar a validação em `service.ts` e terminar em `memory-repository.ts`. Depois, a aba de estoque demonstra as regras de negócio.

Os imports usam a extensão `.js` porque ela será utilizada nos arquivos compilados. Durante o desenvolvimento, o `tsx` resolve os arquivos TypeScript correspondentes.

## Verificações automatizadas

```powershell
npm test
npm run build
```

Os testes cobrem os dois CRUDs, validação no servidor, exclusões vinculadas, pesquisa, escape de HTML, entradas e saídas, saldo zero, precisão decimal e duas saídas simultâneas.

Para executar a versão compilada, use `npm start` depois de `npm run build`. Ao editar TypeScript nesse modo, compile novamente. Durante o desenvolvimento, `npm run dev` reinicia o servidor automaticamente.

## Próxima etapa com MySQL

A aplicação está em modo de teste em memória. Depois da conferência das telas, a próxima etapa é alinhar os adaptadores ao banco do Paulo e validar a integração real.

O arquivo `.env.example` contém as opções de configuração para essa etapa. Os adaptadores assumem provisoriamente estes nomes SQL:

| Tabela | Campos utilizados |
| --- | --- |
| `insumo` | `id_insumo`, `nome`, `descricao`, `unidade_medida` |
| `fornecedor` | `id_fornecedor`, `nome`, `email`, `telefone` |
| `movimentacao_estoque` | `id_movimentacao`, `id_insumo`, `tipo`, `quantidade`, `data_movimentacao`, `observacao` |
| `item_compra` | `id_insumo`, consultado para proteger a unidade de medida |
| `compra` | Sua chave estrangeira para fornecedor deve restringir a exclusão |

Os tipos de movimentação previstos são `ENTRADA` e `SAIDA`. A quantidade precisa de um campo decimal com três casas, e a data de movimentação deve ser gravada em UTC. As transações dependem de tabelas InnoDB e de chaves estrangeiras com exclusão restrita. Os nomes, tipos e limites serão conferidos com o DDL antes de ativar esse modo.

O projeto técnico, o DDL/DML definitivo e os 100 registros por tabela exigidos pelo professor seguem a divisão do grupo. A base visual e os templates podem ser ajustados pela Júlya, enquanto Marcos mantém o backend e Paulo define o banco.
