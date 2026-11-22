# Evaluación Módulo 3 - Arias y Peña

Repositorio de la pareja para la actividad del Módulo 3 de Redes y Servicios Multimedia, Universidad Autónoma de Occidente.

## Integrantes

| Integrante | Usuario de GitHub |
|---|---|
| Alejandro Arias Ramírez | xAlejo17 |
| Santiago Peña Agudelo | Stiago521 |

## Microservicio asignado

`ms-pedidos`, en el puerto 3011, con su base de datos `pedidos_db`.

El contrato de la API, las instrucciones para ejecutarlo y la descripción de las pruebas están en [`ms-pedidos/README.md`](ms-pedidos/README.md).

## Estructura

```
.
├── README.md        ← este archivo
└── ms-pedidos/      ← microservicio de pedidos
    ├── db/          ← schema.sql con la tabla y los registros iniciales
    ├── docs/        ← colección de Postman
    └── src/         ← código en capas: routes → controller → service → repository
```

El archivo `.env` no se sube al repositorio. Cada integrante crea el suyo a partir de `ms-pedidos/.env.example`.