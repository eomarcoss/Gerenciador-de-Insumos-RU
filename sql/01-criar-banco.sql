-- Execute primeiro. As relações restringem a exclusão de registros vinculados.
CREATE DATABASE IF NOT EXISTS gerenciador_ru
  CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;

USE gerenciador_ru;

CREATE TABLE IF NOT EXISTS insumo (
  id_insumo INT PRIMARY KEY AUTO_INCREMENT,
  nome VARCHAR(120) NOT NULL,
  descricao VARCHAR(500),
  unidade_medida ENUM('kg', 'g', 'L', 'mL', 'un') NOT NULL
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS fornecedor (
  id_fornecedor INT PRIMARY KEY AUTO_INCREMENT,
  nome VARCHAR(120) NOT NULL,
  email VARCHAR(254),
  telefone VARCHAR(30)
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS compra (
  id_compra INT PRIMARY KEY AUTO_INCREMENT,
  id_fornecedor INT NOT NULL,
  data_compra DATE NOT NULL,
  CONSTRAINT fk_compra_fornecedor
    FOREIGN KEY (id_fornecedor) REFERENCES fornecedor (id_fornecedor)
    ON DELETE RESTRICT
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS item_compra (
  id_item_compra INT PRIMARY KEY AUTO_INCREMENT,
  id_compra INT NOT NULL,
  id_insumo INT NOT NULL,
  quantidade DECIMAL(12, 3) NOT NULL,
  preco_unitario DECIMAL(12, 2) NOT NULL,
  CONSTRAINT ck_item_compra_quantidade CHECK (quantidade > 0),
  CONSTRAINT ck_item_compra_preco CHECK (preco_unitario >= 0),
  CONSTRAINT fk_item_compra_compra
    FOREIGN KEY (id_compra) REFERENCES compra (id_compra) ON DELETE RESTRICT,
  CONSTRAINT fk_item_compra_insumo
    FOREIGN KEY (id_insumo) REFERENCES insumo (id_insumo) ON DELETE RESTRICT
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS movimentacao_estoque (
  id_movimentacao INT PRIMARY KEY AUTO_INCREMENT,
  id_insumo INT NOT NULL,
  tipo ENUM('ENTRADA', 'SAIDA') NOT NULL,
  quantidade DECIMAL(12, 3) NOT NULL,
  data_movimentacao DATETIME(3) NOT NULL COMMENT 'Data e hora em UTC',
  observacao VARCHAR(500),
  CONSTRAINT ck_movimentacao_quantidade CHECK (quantidade > 0),
  CONSTRAINT fk_movimentacao_insumo
    FOREIGN KEY (id_insumo) REFERENCES insumo (id_insumo) ON DELETE RESTRICT
) ENGINE = InnoDB;
