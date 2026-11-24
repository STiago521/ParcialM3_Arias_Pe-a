# ms-pedidos

Microservicio de **pedidos**. Actividad de práctica del Módulo 3, Redes y Servicios Multimedia (UAO).

Está organizado en capas, igual que los microservicios del módulo:

`routes → controller → service → repository`, con el modelo (`models/pedido.js`) y `HttpError`.

## Cómo ejecutarlo en el PC

1. **Crear la base de datos y el usuario** (como root en MySQL):
   ```sql
   CREATE DATABASE pedidos_db;
   CREATE USER 'pedidos_user'@'localhost' IDENTIFIED BY 'una-clave-segura';
   GRANT ALL PRIVILEGES ON pedidos_db.* TO 'pedidos_user'@'localhost';
   ```
2. **Crear la tabla con los registros iniciales**, desde la carpeta `ms-pedidos`:
   ```
   mysql -u pedidos_user -p pedidos_db < db/schema.sql
   ```
3. **Configurar e iniciar:**
   ```
   npm install
   copy .env.example .env      (en Linux: cp .env.example .env)
   npm run dev
   ```
   En el `.env`, `JWT_SECRET` debe ser **la misma** que la de ms-usuarios. ms-usuarios tiene que estar corriendo en el puerto 3001 para obtener el token.

## Variables de entorno

| Variable | Ejemplo | Descripción |
|---|---|---|
| `PORT` | 3011 | Puerto del microservicio |
| `HOST` | 127.0.0.1 | Solo acepta conexiones del mismo equipo |
| `DB_HOST`, `DB_PORT` | localhost, 3306 | Servidor MySQL |
| `DB_NAME`, `DB_USER`, `DB_PASSWORD` | pedidos_db, pedidos_user | Base de datos propia |
| `JWT_SECRET` | (la de ms-usuarios) | Clave para verificar los tokens |
| `TRANSPORTADORAS_URL` |  http://127.0.0.1:3012   |  Direccion de ms-transportadoras, el microservicio proveedor |

## Recurso: Pedido

| Atributo | Tipo | Regla |
|---|---|---|
| `id` | entero | Lo asigna la base de datos |
| `numero` | texto | Obligatorio y **único** (si se repite → 409) |
| `cliente` | texto | Obligatorio |
| `cantidad` | entero | Obligatorio, mayor que 0 |
| `fecha` | fecha | Obligatoria, formato `AAAA-MM-DD` y fecha real |
| `estado` | texto | Obligatorio: `pendiente`, `enviado` o `entregado` |
| `transportadora_id`   |  entero   |  Obligatorio, entero positivo. Referencia a la transportadora en ms-transportadoras  |

`transportadora_id` referencia a una transportadora de **ms-transportadoras** (puerto 3012). No es una clave foranea de base de datos: cada microservicio es dueño de la suya, y la referencia se valida por HTTP contra el proveedor.

Ejemplo:
```json
{ "id": 1, "numero": "PED-001", "cliente": "Laura Gómez", "cantidad": 3, "fecha": "2026-11-02", "estado": "pendiente", "transportadora_id": 1 }
```
## Relación con ms-transportadoras

`transportadora_id` se valida contra **ms-transportadoras** (puerto 3012, variable `TRANSPORTADORAS_URL`) al crear y al actualizar. El token del usuario se reenvía al proveedor.

| Situación | Respuesta |
|---|---|
| La transportadora no existe en el proveedor | 400 |
| El proveedor no responde | 503 |
| `cantidad` supera `max_unidades` de la transportadora | 400 |

**Regla de negocio:** la `cantidad` del pedido no puede superar el `max_unidades` de su transportadora.

**Composición:** `GET /pedidos` y `GET /pedidos/:id` devuelven dentro de cada pedido el objeto `transportadora` con `id`, `nombre_empresa` y `nit`. El listado resuelve todas sus transportadoras con **una sola** petición `GET /transportadoras?ids=...` al proveedor. SI el proveedor no responde, el pedido sale con `transportadora: null` y un `aviso`, en lugar de fallar.

## Endpoints

Base: `http://127.0.0.1:3011`

| Método | URI | Rol | Éxito | Errores |
|---|---|---|---|---|
| GET | `/health` | sin token | 200 | — |
| GET | `/pedidos` | cualquiera | 200 | 400 (estado no válido en el filtro), 401 |
| GET | `/pedidos?estado=pendiente` | cualquiera | 200 | 400, 401 |
| GET | `/pedidos/:id` | cualquiera | 200 | 400 (id no numérico), 401, 404 |
| POST | `/pedidos` | administrador | 201 + cabecera `Location` | 400, 401, 403, 409 |
| PUT | `/pedidos/:id` | administrador | 200 | 400, 401, 403, 404, 409 |
| DELETE | `/pedidos/:id` | administrador | 204 (sin cuerpo) | 400, 401, 403, 404 |

- **POST y PUT** reciben el pedido completo: `numero`, `cliente`, `cantidad`, `fecha` y `estado`.
- **PUT** responde 409 si el `numero` ya pertenece a **otro** pedido. Conservar su propio número no es error.
- **Filtro `?estado=`:** devuelve solo los pedidos de ese estado. Un valor que no sea `pendiente`, `enviado` o `entregado` da 400.

### Formato de los errores
```json
{ "error": "Datos inválidos", "detalles": ["cantidad es obligatoria y debe ser un entero mayor que 0"] }
```

| Código | Cuándo |
|---|---|
| 400 | Datos inválidos, JSON mal formado, id no numérico o filtro no válido, la transportadora no existe o la cantidad supera su maximo |
| 503 | ms-transportadoras no responde |
| 401 | Falta el token o es inválido o está vencido |
| 403 | El rol no es administrador (POST, PUT, DELETE) |
| 404 | No existe un pedido con ese id, o la ruta no existe |
| 409 | El número de pedido ya existe |

## Seguridad

Usa el mismo `auth.js` de ms-usuarios:
- **Todas** las rutas de `/pedidos` exigen la cabecera `Authorization: Bearer <token>`.
- **GET** está permitido para cualquier rol.
- **POST, PUT y DELETE** solo los puede hacer el rol `administrador`.

El token se obtiene en ms-usuarios con `POST http://127.0.0.1:3001/usuarios/login`.

## Registro de peticiones

Cada petición deja una línea en la terminal con la hora, el método, la ruta y el código de respuesta:
```
[2026-11-21T22:42:52.152Z] GET /pedidos?estado=pendiente → 200 (6 ms)
[2026-11-21T22:42:52.162Z] POST /pedidos → 403 (4 ms)
```
En un servidor con systemd se ven con `journalctl -u ms-pedidos -f`.

## Pruebas

La colección de Postman está en `docs/ms-pedidos.postman_collection.json`.

Para ejecutarla:

1. Tener ms-usuarios corriendo en el puerto 3001 y ms-pedidos en el 3011.
2. Importar la colección en Postman.
3. En la pestaña **Variables** de la colección, confirmar `base` y `usuarios`.
4. Correr las dos peticiones de la carpeta `00 - Login (ms-usuarios)`. Sus scripts guardan los tokens en las variables `token` y `token_basico`.
5. Ejecutar la colección completa con **Run**.

Las 18 peticiones cubren todos los códigos del contrato, en este orden:

| Código | Peticiones |
|---|---|
| 200 | login, listar, filtrar, obtener existente, actualizar existente, consultar con rol sin permiso de escritura |
| 201 | crear con datos válidos |
| 204 | eliminar un registro existente |
| 400 | id no numérico, falta un atributo obligatorio |
| 401 | petición sin token, token modificado |
| 403 | POST con un rol que no es administrador |
| 404 | obtener, actualizar y eliminar un id que no existe |
| 409 | crear con un número de pedido repetido |

Las peticiones 11 y 12 borran el pedido con id 4. Para volver a correr la colección desde cero, basta con ejecutar otra vez `db/schema.sql`, que empieza con `DROP TABLE IF EXISTS`.
