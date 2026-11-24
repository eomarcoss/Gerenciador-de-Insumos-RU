-- DQL: consultas para conferir os dados e os relacionamentos no MySQL.
USE gerenciador_ru;

-- Fornecedores cadastrados.
SELECT id_fornecedor, nome, email, telefone
FROM fornecedor
ORDER BY nome, id_fornecedor;

-- Saldo por insumo, incluindo os que ainda não têm movimentações.
SELECT i.id_insumo, i.nome, i.unidade_medida,
       COALESCE(SUM(CASE WHEN m.tipo = 'ENTRADA' THEN m.quantidade
                         ELSE -m.quantidade END), 0) AS saldo
FROM insumo AS i
LEFT JOIN movimentacao_estoque AS m ON m.id_insumo = i.id_insumo
GROUP BY i.id_insumo, i.nome, i.unidade_medida
ORDER BY i.id_insumo;

-- Histórico de entradas e saídas.
SELECT m.id_movimentacao, i.nome AS insumo, m.tipo, m.quantidade,
       i.unidade_medida, m.data_movimentacao AS data_utc, m.observacao
FROM movimentacao_estoque AS m
JOIN insumo AS i ON i.id_insumo = m.id_insumo
ORDER BY m.id_movimentacao DESC;

-- Itens de compra com os respectivos fornecedores e insumos.
SELECT c.id_compra, c.data_compra, f.nome AS fornecedor,
       i.nome AS insumo, ic.quantidade, ic.preco_unitario
FROM item_compra AS ic
JOIN compra AS c ON c.id_compra = ic.id_compra
JOIN fornecedor AS f ON f.id_fornecedor = c.id_fornecedor
JOIN insumo AS i ON i.id_insumo = ic.id_insumo
ORDER BY c.id_compra, ic.id_item_compra;
