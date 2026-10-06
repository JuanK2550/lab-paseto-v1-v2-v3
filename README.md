# 🔐 Laboratorios PASETO — V1, V2 y V3

Tres laboratorios progresivos de **autenticación y autorización con PASETO v4.public**
construidos con **Node.js + Express** y ES Modules.

Cada versión parte de la anterior y agrega una capa nueva de seguridad.

```text
V1                    V2                      V3
PASETO básico   →     + Roles y Swagger  →    + CRUD y validaciones
```

---

## 📄 Documentación

El informe del laboratorio documenta **las tres versiones en un solo documento**:

> [**LABORATORIO - PASETO - V1 - V2 - V3.pdf**](./lab-paseto-v1/LABORATORIO%20-%20PASETO%20-%20V1%20-%20V2%20-%20V3.pdf)

Incluye la explicación de cada versión, las pruebas ejecutadas y sus capturas.
Por comodidad, el mismo archivo está dentro de las tres carpetas:
[`v1`](./lab-paseto-v1/LABORATORIO%20-%20PASETO%20-%20V1%20-%20V2%20-%20V3.pdf) ·
[`v2`](./lab-paseto-v2/LABORATORIO%20-%20PASETO%20-%20V1%20-%20V2%20-%20V3.pdf) ·
[`v3`](./lab-paseto-v3/LABORATORIO%20-%20PASETO%20-%20V1%20-%20V2%20-%20V3.pdf)

---

## Las tres versiones

| | Carpeta | Qué agrega | Endpoints | Pruebas |
|---|---|---|---:|---:|
| **V1** | [`lab-paseto-v1/`](./lab-paseto-v1) | Login, firma y verificación del token, ruta protegida | 2 | 5 |
| **V2** | [`lab-paseto-v2/`](./lab-paseto-v2) | Usuarios locales, roles, autorización, Swagger, SCA | 4 | 13 |
| **V3** | [`lab-paseto-v3/`](./lab-paseto-v3) | CRUD completo, validaciones con `express-validator` | 8 | 27 |

Cada carpeta tiene su propio `README.md` con la guía completa del laboratorio
y una copia del informe en PDF.

---

## V1 — PASETO básico

El flujo mínimo de autenticación con criptografía asimétrica.

```text
credenciales → login → firma con clave privada → token
             → Bearer → middleware → verificación con clave pública → ruta protegida
```

- `POST /api/auth/login` — devuelve un PASETO `v4.public`
- `GET /api/auth/perfil` 🔒 — protegida por el middleware

Conceptos: clave privada vs. pública, claims, `Bearer`, middleware, integridad de la firma.

## V2 — Roles, Swagger y análisis de dependencias

Introduce la diferencia entre **autenticación** (`401`) y **autorización** (`403`).

- Tres usuarios locales: administrador, médico y paciente
- `autorizarRoles(...)` — middleware de autorización por rol
- Documentación interactiva en `/api-docs` (Swagger / OpenAPI)
- Análisis SCA con `npm audit`

```text
PASETO → ¿quién eres?        → 401
roles  → ¿qué puedes hacer?  → 403
```

## V3 — CRUD completo y validaciones

Añade la tercera capa: **validación de entradas**.

- `GET` · `POST` · `PUT` · `PATCH` · `DELETE` sobre `/api/usuarios`
- `express-validator` con `matchedData()` para filtrar los campos no validados
- Códigos `200`, `201`, `204`, `400`, `401`, `403`, `404` y `409`

```text
PASETO            → ¿quién eres?        → 401
roles             → ¿qué puedes hacer?  → 403
express-validator → ¿tus datos sirven?  → 400
```

El orden de los middlewares es deliberado:

```text
autenticarPaseto → autorizarRoles → validador → controlador
```

---

## Cómo ejecutar cualquiera de las tres

```bash
cd lab-paseto-v3          # o v1 / v2
npm install
cp .env.example .env      # PORT=3000
npm run dev
```

Swagger (V2 y V3): <http://localhost:3000/api-docs>

### Usuarios de prueba (V2 y V3)

| Email | Contraseña | Rol |
|---|---|---|
| `admin@hospital.com` | `123456` | administrador |
| `laura@hospital.com` | `123456` | medico |
| `carlos@hospital.com` | `123456` | paciente |

---

## Pruebas automáticas

La V2 y la V3 incluyen una suite que ejecuta toda la matriz de pruebas del
laboratorio contra el servidor y genera un informe en Markdown.

```bash
npm start           # en una terminal (sin nodemon, para no reiniciar los datos)
npm run test:lab    # en otra
```

Los resultados quedan en `pruebas/resultados.md`, junto con la matriz de permisos
y los códigos HTTP ejercitados.

| Versión | Resultado |
|---|---|
| V1 | 5/5 ✅ |
| V2 | 13/13 ✅ |
| V3 | 27/27 ✅ |

> Las capturas de pantalla de las pruebas no se incluyen en este repositorio
> (ver `.gitignore`). Los guiones que las generan sí están, en `pruebas/capturas.js`.

---

## Análisis de dependencias (SCA)

La V2 y la V3 documentan el resultado de `npm audit` en `pruebas/analisis-sca.md`:

| Análisis | Resultado |
|---|---|
| `npm audit` | 3 HIGH — `nodemon → chokidar → braces` (dependencia transitiva de desarrollo) |
| `npm audit --omit=dev` | 0 vulnerabilities |

No se ejecutó `npm audit fix --force` porque degradaría `nodemon` de la versión
`3.1.14` a la `1.14.10`, un cambio incompatible que rompería el proyecto para
mitigar un riesgo que no alcanza al entorno de producción.

```text
SEVERIDAD ≠ RIESGO
```

---

## Stack

| Tecnología | Uso |
|---|---|
| Node.js + Express 5 | API REST |
| `paseto` 4.x | Tokens `v4.public` (Ed25519) |
| `express-validator` 7.x | Validación y sanitización (V3) |
| `swagger-jsdoc` + `swagger-ui-express` | Documentación OpenAPI (V2 y V3) |
| `dotenv` | Variables de entorno |
| `nodemon` | Recarga en desarrollo |

---

## Conceptos aplicados

| Concepto | Dónde se implementa |
|---|---|
| Criptografía asimétrica | La clave privada firma, la pública verifica (Ed25519) |
| PASETO `v4.public` | Tokens con versión y propósito explícitos |
| Claims | `sub`, `email`, `rol`, `iat`, `exp` |
| Bearer Token | `Authorization: Bearer <PASETO>` |
| Middleware | Intercepta la petición antes del controlador |
| Autenticación | `autenticarPaseto` — ¿quién eres? → `401` |
| Autorización | `autorizarRoles(...)` — ¿qué puedes hacer? → `403` |
| Validación | `express-validator` — ¿tus datos sirven? → `400` |
| `matchedData()` | Solo llegan al controlador los campos validados |
| Integridad | Un carácter alterado invalida el token |
| CRUD | `GET` · `POST` · `PUT` · `PATCH` · `DELETE` |
| `PUT` vs `PATCH` | Reemplazo total vs. modificación parcial |
| Códigos HTTP | `200` `201` `204` `400` `401` `403` `404` `409` |
| OpenAPI | Documentación generada desde el código |
| SCA | `npm audit` — severidad ≠ riesgo |

---

## Siguientes pasos

La ruta natural para llevar estos laboratorios más allá:

- **Persistencia** — sustituir el arreglo en memoria por una base de datos.
- **Hash de contraseñas** — bcrypt o Argon2 en lugar de texto plano.
- **Claves persistentes** — exportar la clave privada con PASERK e
  importarla al arrancar, para que los tokens sobrevivan a un reinicio.
- **Refresh tokens** — renovar la sesión sin volver a pedir credenciales.
- **Permisos por recurso** — que un paciente consulte su propio perfil,
  no solo que su rol lo autorice de forma global.
- **Despliegue** — HTTPS, *rate limiting* en el login y gestión de secretos.
