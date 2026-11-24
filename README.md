# Gerenciador de Insumos do RU

Sistema acadêmico em Node.js, TypeScript, Express, EJS e Bootstrap. As três abas persistem seus dados no MySQL.

O [manual do projeto](MANUAL.md) explica cada arquivo, acompanha um cadastro do formulário até o MySQL e inclui um roteiro para a apresentação.

## Executar no VS Code

Use Node.js 22.9 ou superior. Prepare o banco e o arquivo `.env` conforme a seção [Executar com MySQL](#executar-com-mysql). Na pasta do projeto, execute os comandos no terminal.

```powershell
npm install
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000). No PowerShell, se a execução de `npm.ps1` estiver bloqueada, use `npm.cmd` no lugar de `npm`. Para encerrar o servidor, pressione `Ctrl+C`.

Os dados gravados no MySQL permanecem após atualizar o navegador ou reiniciar o servidor Node.

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
7. Com os dados de demonstração carregados, tente excluir `Fornecedor de demonstração 001`. Ele possui compras vinculadas e a exclusão deve ser bloqueada.
8. Pesquise por nomes com e sem acentos e reinicie o servidor Node para conferir a permanência dos dados.

## Organização do código

```text
src/
  app.ts                  Configura o Express, EJS, arquivos públicos e rotas
  server.ts               Inicia e encerra o servidor
  database.ts             Abre o pool MySQL e instancia os repositórios
  repositories.ts         Reúne os contratos dos três módulos
  shared/
    errors.ts             Erros conhecidos e erros de validação
    forms.ts              Leitura de campos e identificadores
  insumos/
    insumo.ts             Tipos do insumo e contrato do repositório
    routes.ts             Recebe formulários e escolhe a resposta HTTP
    service.ts            Valida os dados e solicita as operações
    mysql-repository.ts   Adaptador para a tabela de insumos no MySQL
  fornecedores/           Mesma organização do módulo de insumos
  estoque/
    movimentacao.ts       Tipos das movimentações e dos saldos
    routes.ts             Listagem e formulário de movimentação
    service.ts            Valida os dados do formulário
    mysql-repository.ts   Adaptador MySQL com transações de estoque
views/
  partials/               Cabeçalho, rodapé e mensagens de validação
  insumos/                Listagem, formulário e confirmação de exclusão
  fornecedores/           Listagem, formulário e confirmação de exclusão
  estoque/                Saldos, histórico e formulário
  error.ejs               Página de erro
public/
  app.css                 Estilos compartilhados
  estoque.js              Atualiza o saldo exibido ao selecionar um insumo
```

O fluxo de uma operação segue esta ordem:

```text
Formulário HTML → Rota Express → Serviço → Repositório SQL → MySQL
```

A rota recebe a requisição e escolhe a página ou o redirecionamento. O serviço valida os dados. O repositório executa `SELECT` para ler os registros ou `INSERT`, `UPDATE` e `DELETE` para gravar as alterações no MySQL.

As chaves estrangeiras protegem contra exclusão os insumos com movimentações ou itens de compra e os fornecedores com compras vinculadas.

## Regras do estoque

O saldo é a soma das entradas menos a soma das saídas. Novos insumos começam com zero. As quantidades aceitam ponto ou vírgula, até três casas decimais e o limite de 999999999,999 por registro.

A conferência do saldo e a gravação da saída acontecem na mesma transação. O repositório bloqueia a linha do insumo com `SELECT ... FOR UPDATE` e compara as quantidades em milésimos antes de gravar.

A unidade de medida fica protegida quando o insumo possui compras ou movimentações. Isso preserva o significado das quantidades já registradas. Nome e descrição continuam editáveis.

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

Uma apresentação pode começar no formulário de cadastro, seguir para `routes.ts`, mostrar a validação em `service.ts` e terminar em `mysql-repository.ts`. Depois, a aba de estoque demonstra as regras de negócio.

Os imports usam a extensão `.js` porque ela será utilizada nos arquivos compilados. Durante o desenvolvimento, o `tsx` resolve os arquivos TypeScript correspondentes.

## Compilar o projeto

```powershell
npm run build
```

Para executar a versão compilada, use `npm start` depois de `npm run build`. Ao editar TypeScript nesse modo, compile novamente. Durante o desenvolvimento, `npm run dev` reinicia o servidor automaticamente.

## Executar com MySQL

1. Abra a conexão local no MySQL Workbench com uma conta administradora.
2. Execute [`sql/01-criar-banco.sql`](sql/01-criar-banco.sql) para criar o schema `gerenciador_ru` e as tabelas. Se quiser carregar os exemplos em uma instalação nova, execute [`sql/02-dados-demonstracao.sql`](sql/02-dados-demonstracao.sql) uma vez. O resultado esperado com os exemplos é de 100 registros nas quatro primeiras tabelas e 200 movimentações.
3. Crie um usuário local para a aplicação e dê acesso ao schema.

   ```sql
   CREATE USER 'ru_app'@'127.0.0.1' IDENTIFIED BY RANDOM PASSWORD;
   GRANT SELECT, INSERT, UPDATE, DELETE ON gerenciador_ru.* TO 'ru_app'@'127.0.0.1';
   ```

4. Copie `.env.example` para `.env` e coloque a senha gerada em `DB_PASSWORD`. Mantenha o `.env` local.
5. Inicie o servidor Node. O terminal deve mostrar `Conectado ao MySQL.`.

| Tipo de SQL | Onde aparece |
| --- | --- |
| DDL | [`01-criar-banco.sql`](sql/01-criar-banco.sql) cria o schema, as tabelas, as chaves e as restrições. |
| DML | [`02-dados-demonstracao.sql`](sql/02-dados-demonstracao.sql) insere os exemplos. A aplicação usa `INSERT`, `UPDATE` e `DELETE` para alterar dados pela interface. |
| DQL | [`03-consultas.sql`](sql/03-consultas.sql) traz consultas `SELECT` para conferir fornecedores, saldos, movimentações e compras no Workbench. A aplicação também usa `SELECT` para montar as telas. |

Os adaptadores usam estas tabelas:

| Tabela | Campos utilizados |
| --- | --- |
| `insumo` | `id_insumo`, `nome`, `descricao`, `unidade_medida` |
| `fornecedor` | `id_fornecedor`, `nome`, `email`, `telefone` |
| `movimentacao_estoque` | `id_movimentacao`, `id_insumo`, `tipo`, `quantidade`, `data_movimentacao`, `observacao` |
| `item_compra` | `id_insumo`, consultado para proteger a unidade de medida |
| `compra` | Sua chave estrangeira para fornecedor deve restringir a exclusão |

O schema usa InnoDB e chaves estrangeiras com exclusão restrita. Os tipos de movimentação são `ENTRADA` e `SAIDA`. A quantidade é decimal com três casas e a data de movimentação é gravada em UTC.
