# ms-transportadoras · Contrato de la API

Microservicio **proveedor** del examen del Módulo 3 (solo lectura). Puerto: **3012**.
Lo consulta el microservicio de pedidos, que guarda el atributo `transportadora_id`.

## Cómo ejecutarlo

Requisitos: Node.js 22.9 o superior, MySQL 8 y ms-usuarios corriendo (para obtener tokens).

1. Como root en MySQL:

```sql
CREATE DATABASE transportadoras_db;
CREATE USER 'transportadoras_user'@'localhost' IDENTIFIED BY 'una-clave-segura';
GRANT ALL PRIVILEGES ON transportadoras_db.* TO 'transportadoras_user'@'localhost';
```

2. `mysql -u transportadoras_user -p transportadoras_db` y luego `SOURCE db/schema.sql;`
3. `npm install`
4. Copiar `.env.example` como `.env`. `JWT_SECRET` debe ser **la misma de ms-usuarios**.
5. `npm run dev`

## Representación

```json
{"id": 1, "nombre_empresa": "Rápido Valle", "nit": "900123456-1", "max_unidades": 100}
```

## Atributos

| Atributo | Tipo |
|---|---|
| id | entero |
| nombre_empresa | texto |
| nit | texto |
| max_unidades | entero |

## Endpoints

Todas las peticiones llevan `Authorization: Bearer <token>`. Cualquier rol autenticado puede consultar.

| Operación | Método | URI | Respuesta exitosa | Errores |
|---|---|---|---|---|
| Listar | GET | /transportadoras | 200 arreglo | 401 |
| Consultar por lotes | GET | /transportadoras?ids=1,3 | 200 arreglo (solo los que existen) | 400 · 401 |
| Obtener | GET | /transportadoras/:id | 200 objeto | 400 · 401 · 404 |

## Datos iniciales

| id | nombre_empresa | nit | max_unidades |
|---|---|---|---|
| 1 | Rápido Valle | 900123456-1 | 100 |
| 2 | Carga Segura | 900654321-2 | 20 |
| 3 | TransPacífico | 901111222-3 | 300 |
| 4 | Moto Envíos | 901333444-5 | 5 |

## Para el consumidor

La carpeta `para-el-consumidor/` trae `transportadoras.client.js` con la función `pedir()` ya escrita (token y tiempo de espera). Se copia en `ms-pedidos/src/clients/` y se completa.

## Frontend del examen

La carpeta `frontend/` trae `index.html`, ya configurado para ms-pedidos y ms-transportadoras. No se modifica: se copia al `DocumentRoot` del host virtual del examen en servidor2, y desde Windows se abre `http://examen.<dominio>/`. La página inicia sesión por `/api/usuarios/login` y muestra los listados de `/api/pedidos` y `/api/transportadoras` por el mismo nombre, así que no necesita CORS.

## Me consultan

| Me consulta | Peticiones que me hace |
|---|---|
| ms-pedidos | `GET /transportadoras/:id` (validar) · `GET /transportadoras?ids=…` (componer) |
