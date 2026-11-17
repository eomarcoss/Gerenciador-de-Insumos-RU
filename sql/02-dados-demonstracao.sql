-- Execute uma vez em um banco recém-criado, antes de cadastrar dados pela aplicação.
-- Compras e contatos são fictícios. Os últimos cinco insumos e fornecedores
-- ficam sem vínculos para testar a exclusão pela interface.
USE gerenciador_ru;
START TRANSACTION;

INSERT INTO insumo (id_insumo, nome, descricao, unidade_medida) VALUES
  (1, 'Arroz branco', 'Cereais e leguminosas', 'kg'),
  (2, 'Arroz integral', 'Cereais e leguminosas', 'kg'),
  (3, 'Arroz parboilizado', 'Cereais e leguminosas', 'kg'),
  (4, 'Feijão carioca', 'Cereais e leguminosas', 'kg'),
  (5, 'Feijão preto', 'Cereais e leguminosas', 'kg'),
  (6, 'Feijão fradinho', 'Cereais e leguminosas', 'kg'),
  (7, 'Feijão branco', 'Cereais e leguminosas', 'kg'),
  (8, 'Lentilha', 'Cereais e leguminosas', 'kg'),
  (9, 'Grão-de-bico', 'Cereais e leguminosas', 'kg'),
  (10, 'Ervilha seca', 'Cereais e leguminosas', 'kg'),
  (11, 'Quinoa', 'Cereais e leguminosas', 'kg'),
  (12, 'Milho para pipoca', 'Cereais e leguminosas', 'kg'),
  (13, 'Aveia em flocos', 'Cereais e leguminosas', 'kg'),
  (14, 'Trigo para quibe', 'Cereais e leguminosas', 'kg'),
  (15, 'Canjica branca', 'Cereais e leguminosas', 'kg'),
  (16, 'Farinha de trigo', 'Farinhas e massas', 'kg'),
  (17, 'Farinha de mandioca', 'Farinhas e massas', 'kg'),
  (18, 'Farinha de milho', 'Farinhas e massas', 'kg'),
  (19, 'Farinha de arroz', 'Farinhas e massas', 'kg'),
  (20, 'Fubá', 'Farinhas e massas', 'kg'),
  (21, 'Polvilho doce', 'Farinhas e massas', 'kg'),
  (22, 'Polvilho azedo', 'Farinhas e massas', 'kg'),
  (23, 'Amido de milho', 'Farinhas e massas', 'kg'),
  (24, 'Macarrão espaguete', 'Farinhas e massas', 'kg'),
  (25, 'Macarrão penne', 'Farinhas e massas', 'kg'),
  (26, 'Macarrão parafuso', 'Farinhas e massas', 'kg'),
  (27, 'Macarrão talharim', 'Farinhas e massas', 'kg'),
  (28, 'Massa para lasanha', 'Farinhas e massas', 'kg'),
  (29, 'Cuscuz marroquino', 'Farinhas e massas', 'kg'),
  (30, 'Tapioca granulada', 'Farinhas e massas', 'kg'),
  (31, 'Batata inglesa', 'Hortaliças e legumes', 'kg'),
  (32, 'Batata-doce', 'Hortaliças e legumes', 'kg'),
  (33, 'Mandioca', 'Hortaliças e legumes', 'kg'),
  (34, 'Inhame', 'Hortaliças e legumes', 'kg'),
  (35, 'Cenoura', 'Hortaliças e legumes', 'kg'),
  (36, 'Beterraba', 'Hortaliças e legumes', 'kg'),
  (37, 'Abóbora cabotiá', 'Hortaliças e legumes', 'kg'),
  (38, 'Abobrinha', 'Hortaliças e legumes', 'kg'),
  (39, 'Chuchu', 'Hortaliças e legumes', 'kg'),
  (40, 'Pepino', 'Hortaliças e legumes', 'kg'),
  (41, 'Tomate', 'Hortaliças e legumes', 'kg'),
  (42, 'Pimentão verde', 'Hortaliças e legumes', 'kg'),
  (43, 'Pimentão vermelho', 'Hortaliças e legumes', 'kg'),
  (44, 'Berinjela', 'Hortaliças e legumes', 'kg'),
  (45, 'Cebola branca', 'Hortaliças e legumes', 'kg'),
  (46, 'Cebola roxa', 'Hortaliças e legumes', 'kg'),
  (47, 'Alho', 'Hortaliças e legumes', 'kg'),
  (48, 'Alface crespa', 'Hortaliças e legumes', 'kg'),
  (49, 'Alface lisa', 'Hortaliças e legumes', 'kg'),
  (50, 'Couve', 'Hortaliças e legumes', 'kg'),
  (51, 'Repolho verde', 'Hortaliças e legumes', 'kg'),
  (52, 'Repolho roxo', 'Hortaliças e legumes', 'kg'),
  (53, 'Brócolis', 'Hortaliças e legumes', 'kg'),
  (54, 'Couve-flor', 'Hortaliças e legumes', 'kg'),
  (55, 'Vagem', 'Hortaliças e legumes', 'kg'),
  (56, 'Banana prata', 'Frutas', 'kg'),
  (57, 'Banana nanica', 'Frutas', 'kg'),
  (58, 'Maçã gala', 'Frutas', 'kg'),
  (59, 'Laranja pera', 'Frutas', 'kg'),
  (60, 'Limão tahiti', 'Frutas', 'kg'),
  (61, 'Mamão formosa', 'Frutas', 'kg'),
  (62, 'Melancia', 'Frutas', 'kg'),
  (63, 'Melão', 'Frutas', 'kg'),
  (64, 'Abacaxi', 'Frutas', 'kg'),
  (65, 'Manga palmer', 'Frutas', 'kg'),
  (66, 'Goiaba', 'Frutas', 'kg'),
  (67, 'Maracujá', 'Frutas', 'kg'),
  (68, 'Pera', 'Frutas', 'kg'),
  (69, 'Uva', 'Frutas', 'kg'),
  (70, 'Tangerina', 'Frutas', 'kg'),
  (71, 'Peito de frango', 'Proteínas e laticínios', 'kg'),
  (72, 'Coxa de frango', 'Proteínas e laticínios', 'kg'),
  (73, 'Carne bovina moída', 'Proteínas e laticínios', 'kg'),
  (74, 'Acém bovino', 'Proteínas e laticínios', 'kg'),
  (75, 'Lombo suíno', 'Proteínas e laticínios', 'kg'),
  (76, 'Filé de tilápia', 'Proteínas e laticínios', 'kg'),
  (77, 'Queijo muçarela', 'Proteínas e laticínios', 'kg'),
  (78, 'Queijo minas', 'Proteínas e laticínios', 'kg'),
  (79, 'Leite em pó', 'Proteínas e laticínios', 'kg'),
  (80, 'Proteína de soja', 'Proteínas e laticínios', 'kg'),
  (81, 'Sal refinado', 'Temperos e mercearia', 'kg'),
  (82, 'Açúcar cristal', 'Temperos e mercearia', 'kg'),
  (83, 'Açúcar mascavo', 'Temperos e mercearia', 'kg'),
  (84, 'Café em pó', 'Temperos e mercearia', 'kg'),
  (85, 'Orégano', 'Temperos e mercearia', 'kg'),
  (86, 'Cominho', 'Temperos e mercearia', 'kg'),
  (87, 'Colorau', 'Temperos e mercearia', 'kg'),
  (88, 'Páprica doce', 'Temperos e mercearia', 'kg'),
  (89, 'Louro seco', 'Temperos e mercearia', 'kg'),
  (90, 'Extrato de tomate', 'Temperos e mercearia', 'kg'),
  (91, 'Óleo de soja', 'Líquidos', 'L'),
  (92, 'Óleo de girassol', 'Líquidos', 'L'),
  (93, 'Azeite de oliva', 'Líquidos', 'L'),
  (94, 'Vinagre de álcool', 'Líquidos', 'L'),
  (95, 'Vinagre de maçã', 'Líquidos', 'L'),
  (96, 'Leite integral', 'Líquidos', 'L'),
  (97, 'Leite de coco', 'Líquidos', 'L'),
  (98, 'Ovo de galinha', 'Itens por unidade', 'un'),
  (99, 'Pão francês', 'Itens por unidade', 'un'),
  (100, 'Pão integral', 'Itens por unidade', 'un');

INSERT INTO fornecedor (id_fornecedor, nome, email, telefone)
SELECT id_insumo,
       CONCAT('Fornecedor de demonstração ', LPAD(id_insumo, 3, '0')),
       CONCAT('fornecedor', LPAD(id_insumo, 3, '0'), '@ru.example'),
       NULL
FROM insumo
WHERE id_insumo BETWEEN 1 AND 100;

INSERT INTO compra (id_compra, id_fornecedor, data_compra)
SELECT id_insumo,
       1 + MOD(id_insumo - 1, 95),
       DATE_ADD('2026-11-01', INTERVAL MOD(id_insumo - 1, 10) DAY)
FROM insumo
WHERE id_insumo BETWEEN 1 AND 100;

INSERT INTO item_compra (id_item_compra, id_compra, id_insumo, quantidade, preco_unitario)
SELECT id_compra, id_compra, 1 + MOD(id_compra - 1, 95),
       30 + MOD(id_compra, 20), 5.00 + MOD(id_compra, 15)
FROM compra
WHERE id_compra BETWEEN 1 AND 100;

-- Cada item recebido gera uma entrada. A compra não entra diretamente no saldo.
INSERT INTO movimentacao_estoque (id_insumo, tipo, quantidade, data_movimentacao, observacao)
SELECT item.id_insumo, 'ENTRADA', item.quantidade,
       TIMESTAMP(compra.data_compra, '12:00:00'),
       CONCAT('Recebimento da compra ', compra.id_compra)
FROM item_compra AS item
JOIN compra ON compra.id_compra = item.id_compra
WHERE item.id_item_compra BETWEEN 1 AND 100
ORDER BY compra.data_compra, item.id_item_compra;

-- Simula um consumo menor que a quantidade recebida de cada item.
INSERT INTO movimentacao_estoque (id_insumo, tipo, quantidade, data_movimentacao, observacao)
SELECT id_insumo, 'SAIDA', quantidade - 20,
       '2026-11-12 14:00:00', 'Consumo de demonstração'
FROM item_compra
WHERE id_item_compra BETWEEN 1 AND 100
ORDER BY id_item_compra;

COMMIT;

SELECT 'insumo' AS tabela, COUNT(*) AS registros FROM insumo
UNION ALL SELECT 'fornecedor', COUNT(*) FROM fornecedor
UNION ALL SELECT 'compra', COUNT(*) FROM compra
UNION ALL SELECT 'item_compra', COUNT(*) FROM item_compra
UNION ALL SELECT 'movimentacao_estoque', COUNT(*) FROM movimentacao_estoque;
