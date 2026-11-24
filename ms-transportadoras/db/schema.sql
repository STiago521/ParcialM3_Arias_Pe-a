-- db/schema.sql — base de datos de ms-transportadoras
SET NAMES utf8mb4;

CREATE TABLE transportadoras (
  id                   INT AUTO_INCREMENT PRIMARY KEY,
  nombre_empresa       VARCHAR(100) NOT NULL,
  nit                  VARCHAR(20) NOT NULL,
  max_unidades         INT NOT NULL
);

INSERT INTO transportadoras (nombre_empresa, nit, max_unidades) VALUES
  ('Rápido Valle', '900123456-1', 100),
  ('Carga Segura', '900654321-2', 20),
  ('TransPacífico', '901111222-3', 300),
  ('Moto Envíos', '901333444-5', 5);
