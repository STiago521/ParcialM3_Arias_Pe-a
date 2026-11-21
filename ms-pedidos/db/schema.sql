-- Base de datos de ms-pedidos. Ejecutar con un usuario que tenga permisos
-- sobre pedidos_db:  mysql -u pedidos_user -p pedidos_db < db/schema.sql
-- Sin campos _id hacia otras entidades: la relación se agrega después.
DROP TABLE IF EXISTS pedidos;

CREATE TABLE pedidos (
  id        INT AUTO_INCREMENT PRIMARY KEY,
  numero    VARCHAR(20)  NOT NULL UNIQUE,
  cliente   VARCHAR(100) NOT NULL,
  cantidad  INT          NOT NULL,
  fecha     DATE         NOT NULL,
  estado    VARCHAR(20)  NOT NULL DEFAULT 'pendiente'
);

INSERT INTO pedidos (numero, cliente, cantidad, fecha, estado) VALUES
  ('PED-001', 'Laura Gómez',   3, '2026-11-02', 'pendiente'),
  ('PED-002', 'Andrés Rojas',  1, '2026-11-05', 'enviado'),
  ('PED-003', 'Camila Torres', 5, '2026-11-08', 'entregado'),
  ('PED-004', 'Diego Herrera', 2, '2026-11-10', 'pendiente');
