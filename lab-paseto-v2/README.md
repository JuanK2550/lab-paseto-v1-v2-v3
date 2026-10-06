# 🔐 LAB PASETO V2

API REST desarrollada con **Node.js + Express** para estudiar la autenticación y autorización mediante **PASETO v4.public**.

Esta segunda versión amplía el laboratorio inicial incorporando:

- Datos locales de usuarios.
- Diferentes roles.
- Autenticación mediante PASETO.
- Autorización basada en roles.
- Rutas protegidas.
- Swagger / OpenAPI.
- Pruebas de códigos HTTP `200`, `401`, `403` y `404`.
- Análisis de dependencias mediante `npm audit`.

---

# 1. Objetivo del laboratorio

Implementar una API REST que permita comprender el flujo completo:

```text
USUARIO
   ↓
CREDENCIALES
   ↓
LOGIN
   ↓
VALIDACIÓN
   ↓
PASETO
   ↓
AUTENTICACIÓN
   ↓
AUTORIZACIÓN
   ↓
RECURSO PROTEGIDO
```

El laboratorio utiliza datos locales para concentrarse en los conceptos de seguridad antes de incorporar una base de datos.

---

# 2. Tecnologías utilizadas

| Tecnología | Uso |
|---|---|
| Node.js | Entorno de ejecución |
| Express | Framework para construir la API REST |
| PASETO | Generación y validación de tokens |
| dotenv | Variables de entorno |
| Swagger JSDoc | Generación de especificación OpenAPI |
| Swagger UI Express | Interfaz gráfica para probar la API |
| Nodemon | Reinicio automático durante desarrollo |

---

# 3. ¿Qué es PASETO?

**PASETO** significa:

> Platform-Agnostic Security Tokens

Es un estándar para la creación de tokens seguros que pueden utilizarse en procesos de autenticación y autorización.

En este laboratorio utilizamos:

```text
PASETO v4.public
```

`v4` representa la versión del protocolo y `public` indica que se utiliza criptografía asimétrica.

El esquema general es:

```text
CLAVE PRIVADA
     ↓
   FIRMA
     ↓
  PASETO
     ↓
VERIFICACIÓN
     ↓
CLAVE PÚBLICA
```

La **clave privada** se utiliza para firmar tokens.

La **clave pública** se utiliza para verificar que el token fue generado legítimamente y que no ha sido alterado.

---

# 4. ¿Qué contiene el PASETO?

Después de un login exitoso generamos un token que contiene claims como:

```json
{
  "sub": "1",
  "email": "admin@hospital.com",
  "rol": "administrador"
}
```

Donde:

| Claim | Significado |
|---|---|
| `sub` | Identificador del usuario |
| `email` | Correo del usuario |
| `rol` | Rol utilizado para autorización |
| `iat` | Momento de emisión del token |
| `exp` | Momento de expiración |

El token generado comienza con:

```text
v4.public.
```

Por ejemplo:

```text
v4.public.eyJzdWIiOiIxIiwiZW1haWwiOi...
```

---

# 5. Autenticación vs autorización

Uno de los objetivos principales de esta versión es diferenciar estos dos conceptos.

## Autenticación

Responde:

> ¿Quién eres?

En nuestra API se realiza mediante PASETO.

```text
REQUEST
   ↓
Bearer Token
   ↓
autenticarPaseto
   ↓
verificar PASETO
   ↓
req.usuario
```

## Autorización

Responde:

> ¿Qué puedes hacer?

Se realiza utilizando el rol almacenado dentro de los claims del PASETO.

```text
req.usuario
     ↓
    rol
     ↓
autorizarRoles(...)
     ↓
¿tiene permiso?
   /       \
 NO         SÍ
 ↓           ↓
403      CONTROLADOR
```

---

# 6. Códigos HTTP importantes

| Código | Significado | Ejemplo |
|---:|---|---|
| `200` | OK | Operación realizada correctamente |
| `401` | Unauthorized | Token inexistente, inválido o credenciales incorrectas |
| `403` | Forbidden | Usuario autenticado pero sin permisos |
| `404` | Not Found | Recurso solicitado no encontrado |
| `500` | Internal Server Error | Error interno del servidor |

Una diferencia especialmente importante es:

```text
401
↓
NO ESTÁS AUTENTICADO

403
↓
SÍ ESTÁS AUTENTICADO
PERO
NO TIENES PERMISO
```

---

# 7. Crear el proyecto

Crear la carpeta:

```bash
mkdir lab-paseto-v2
cd lab-paseto-v2
```

Inicializar Node.js:

```bash
npm init -y
```

---

# 8. Instalar dependencias

Instalar las dependencias principales:

```bash
npm install express paseto dotenv swagger-jsdoc swagger-ui-express
```

Instalar Nodemon como dependencia de desarrollo:

```bash
npm install --save-dev nodemon
```

---

# 9. package.json

El proyecto utiliza **ES Modules** mediante:

```json
"type": "module"
```

Contenido:

```json
{
  "name": "lab-paseto-v2",
  "version": "1.0.0",
  "description": "",
  "main": "src/app.js",
  "scripts": {
    "dev": "nodemon src/app.js",
    "start": "node src/app.js"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "type": "module",
  "dependencies": {
    "dotenv": "^18.0.5",
    "express": "^5.2.1",
    "paseto": "^4.0.1",
    "swagger-jsdoc": "^6.3.0",
    "swagger-ui-express": "^5.0.1"
  },
  "devDependencies": {
    "nodemon": "^3.1.14"
  }
}
```

Los scripts disponibles son:

```bash
npm run dev
```

para desarrollo con Nodemon, y:

```bash
npm start
```

para ejecutar directamente con Node.js.

---

# 10. Estructura del proyecto

```text
lab-paseto-v2/
│
├── node_modules/
│
├── src/
│   │
│   ├── config/
│   │   └── swagger.js
│   │
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   └── usuarios.controller.js
│   │
│   ├── data/
│   │   └── usuarios.js
│   │
│   ├── middlewares/
│   │   ├── auth.middleware.js
│   │   └── rol.middleware.js
│   │
│   ├── routes/
│   │   ├── auth.routes.js
│   │   └── usuarios.routes.js
│   │
│   └── app.js
│
├── .env
├── package-lock.json
├── package.json
└── README.md
```

La arquitectura sigue el flujo:

```text
REQUEST
   ↓
ROUTE
   ↓
MIDDLEWARE
   ↓
CONTROLLER
   ↓
DATA
   ↓
RESPONSE
```

---

# 11. Variables de entorno

Archivo:

```text
.env
```

Contenido:

```env
PORT=3000
```

Esto permite configurar el puerto sin escribirlo directamente en el código.

---

# 12. Datos locales

Archivo:

```text
src/data/usuarios.js
```

Contenido:

```js
const usuarios = [
  {
    id: 1,
    nombre: "Administrador Hospital",
    email: "admin@hospital.com",
    password: "123456",
    rol: "administrador",
    activo: true,
  },
  {
    id: 2,
    nombre: "Laura Gómez",
    email: "laura@hospital.com",
    password: "123456",
    rol: "medico",
    activo: true,
  },
  {
    id: 3,
    nombre: "Carlos Pérez",
    email: "carlos@hospital.com",
    password: "123456",
    rol: "paciente",
    activo: true,
  },
];

export default usuarios;
```

Para este laboratorio se utilizan tres usuarios:

| Usuario | Email | Password | Rol |
|---|---|---|---|
| Administrador | `admin@hospital.com` | `123456` | administrador |
| Laura Gómez | `laura@hospital.com` | `123456` | medico |
| Carlos Pérez | `carlos@hospital.com` | `123456` | paciente |

> **Nota de seguridad:** las contraseñas se almacenan en texto plano únicamente con fines educativos. En una aplicación real deben almacenarse mediante funciones de hash apropiadas, por ejemplo utilizando bcrypt o Argon2.

---

# 13. Controlador de autenticación

Archivo:

```text
src/controllers/auth.controller.js
```

Contenido:

```js
import { PublicProtocol } from "paseto";

import {
  GenerateKeyPairFactory,
  SignFactory,
} from "paseto/v4/public";

import usuarios from "../data/usuarios.js";

// ========================================
// Configuración PASETO v4.public
// ========================================

const v4 = new PublicProtocol(
  GenerateKeyPairFactory,
  SignFactory
);

let clavePrivada;
let clavePublica;

// ========================================
// Inicialización de claves
// ========================================

const inicializarClaves = async () => {
  try {
    const claves = await v4.GenerateKeyPair();

    clavePrivada = claves.secretKey;
    clavePublica = claves.publicKey;

    console.log("Claves PASETO generadas");
  } catch (error) {
    console.error(
      "Error generando claves PASETO:",
      error.message
    );
  }
};

await inicializarClaves();

// ========================================
// Login
// ========================================

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const usuario = usuarios.find(
      (u) => u.email === email
    );

    if (!usuario) {
      return res.status(401).json({
        mensaje: "Credenciales inválidas",
      });
    }

    if (usuario.password !== password) {
      return res.status(401).json({
        mensaje: "Credenciales inválidas",
      });
    }

    if (!usuario.activo) {
      return res.status(403).json({
        mensaje: "Usuario deshabilitado",
      });
    }

    const token = await v4.Sign(
      clavePrivada,
      {
        sub: String(usuario.id),
        email: usuario.email,
        rol: usuario.rol,
      }
    );

    return res.status(200).json({
      mensaje: "Login correcto",
      token,
    });

  } catch (error) {
    return res.status(500).json({
      mensaje: "Error generando PASETO",
      error: error.message,
    });
  }
};

// ========================================
// Obtener clave pública
// ========================================

const obtenerClavePublica = () =>
  clavePublica;

// ========================================
// Perfil
// ========================================

const perfil = (req, res) => {
  const usuario = usuarios.find(
    (u) =>
      String(u.id) === req.usuario.sub
  );

  if (!usuario) {
    return res.status(404).json({
      mensaje: "Usuario no encontrado",
    });
  }

  return res.status(200).json({
    id: usuario.id,
    nombre: usuario.nombre,
    email: usuario.email,
    rol: usuario.rol,
    activo: usuario.activo,
  });
};

export {
  login,
  perfil,
  obtenerClavePublica,
};
```

## Funcionamiento

El controlador realiza:

```text
email + password
       ↓
buscar usuario
       ↓
¿existe?
       ↓
¿password correcto?
       ↓
¿usuario activo?
       ↓
generar PASETO
       ↓
devolver token
```

---

# 14. Middleware de autenticación

Archivo:

```text
src/middlewares/auth.middleware.js
```

Contenido:

```js
import { PublicProtocol } from "paseto";

import {
  VerifyFactory,
} from "paseto/v4/public";

import {
  obtenerClavePublica,
} from "../controllers/auth.controller.js";

// ========================================
// Configuración PASETO v4.public
// ========================================

const v4 = new PublicProtocol(
  VerifyFactory
);

// ========================================
// Middleware de autenticación
// ========================================

const autenticarPaseto =
  async (req, res, next) => {

    try {
      const authorization =
        req.headers.authorization;

      if (!authorization) {
        return res.status(401).json({
          mensaje: "Token no proporcionado",
        });
      }

      const [tipo, token] =
        authorization.split(" ");

      if (
        tipo !== "Bearer" ||
        !token
      ) {
        return res.status(401).json({
          mensaje:
            "Formato de token inválido",
        });
      }

      const clavePublica =
        obtenerClavePublica();

      const resultado =
        await v4.Verify(
          clavePublica,
          token
        );

      req.usuario =
        resultado.claims;

      next();

    } catch (error) {
      return res.status(401).json({
        mensaje:
          "Token inválido o expirado",
      });
    }
  };

export default autenticarPaseto;
```

El middleware espera recibir:

```text
Authorization: Bearer <PASETO>
```

Luego:

```text
Authorization
      ↓
Bearer + token
      ↓
clave pública
      ↓
Verify()
      ↓
claims
      ↓
req.usuario
      ↓
next()
```

---

# 15. Middleware de autorización por roles

Archivo:

```text
src/middlewares/rol.middleware.js
```

Contenido:

```js
const autorizarRoles =
  (...rolesPermitidos) => {

    return (req, res, next) => {

      if (!req.usuario) {
        return res.status(401).json({
          mensaje:
            "Usuario no autenticado",
        });
      }

      if (
        !rolesPermitidos.includes(
          req.usuario.rol
        )
      ) {
        return res.status(403).json({
          mensaje:
            "No tiene permisos para acceder a este recurso",
        });
      }

      next();
    };
  };

export default autorizarRoles;
```

Este middleware recibe uno o varios roles:

```js
autorizarRoles("administrador")
```

o:

```js
autorizarRoles(
  "administrador",
  "medico"
)
```

y verifica:

```text
req.usuario.rol
       ↓
rolesPermitidos
       ↓
¿está incluido?
    /       \
  NO         SÍ
  ↓           ↓
 403        next()
```

---

# 16. Controlador de usuarios

Archivo:

```text
src/controllers/usuarios.controller.js
```

Contenido:

```js
import usuarios
  from "../data/usuarios.js";

// ========================================
// Listar usuarios
// ========================================

const listarUsuarios = (req, res) => {

  const resultado = usuarios.map(
    ({
      password,
      ...usuarioSeguro
    }) => usuarioSeguro
  );

  return res.status(200).json(
    resultado
  );
};

// ========================================
// Obtener usuario por ID
// ========================================

const obtenerUsuario = (req, res) => {

  const id = Number(req.params.id);

  const usuario = usuarios.find(
    (u) => u.id === id
  );

  if (!usuario) {
    return res.status(404).json({
      mensaje:
        "Usuario no encontrado",
    });
  }

  const {
    password,
    ...usuarioSeguro
  } = usuario;

  return res.status(200).json(
    usuarioSeguro
  );
};

export {
  listarUsuarios,
  obtenerUsuario,
};
```

La contraseña no se devuelve al cliente.

Por ejemplo:

```js
const {
  password,
  ...usuarioSeguro
} = usuario;
```

permite separar `password` del resto de propiedades.

---

# 17. Configuración de Swagger

Archivo:

```text
src/config/swagger.js
```

Contenido:

```js
import swaggerJsdoc
  from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.0",

    info: {
      title: "API PASETO V2",
      version: "2.0.0",
      description:
        "Laboratorio de autenticación y autorización con PASETO v4.public",
    },

    servers: [
      {
        url: "http://localhost:3000",
        description:
          "Servidor local",
      },
    ],

    components: {
      securitySchemes: {
        BearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "PASETO",
          description:
            "Ingrese el token PASETO v4.public",
        },
      },
    },
  },

  apis: [
    "./src/routes/*.js",
  ],
};

const swaggerSpec =
  swaggerJsdoc(options);

export default swaggerSpec;
```

La sección:

```js
securitySchemes: {
  BearerAuth: {
    type: "http",
    scheme: "bearer",
    bearerFormat: "PASETO",
  },
}
```

permite que Swagger muestre el botón:

```text
Authorize 🔒
```

---

# 18. Rutas de autenticación

Archivo:

```text
src/routes/auth.routes.js
```

Contenido:

```js
import express from "express";

import {
  login,
  perfil,
} from "../controllers/auth.controller.js";

import autenticarPaseto
  from "../middlewares/auth.middleware.js";

const router = express.Router();

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     tags:
 *       - Autenticación
 *     summary: Iniciar sesión
 *     description: Valida las credenciales y genera un PASETO v4.public.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: admin@hospital.com
 *               password:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: Login correcto
 *       401:
 *         description: Credenciales inválidas
 *       403:
 *         description: Usuario deshabilitado
 */
router.post(
  "/login",
  login
);

/**
 * @swagger
 * /api/auth/perfil:
 *   get:
 *     tags:
 *       - Autenticación
 *     summary: Obtener perfil
 *     description: Obtiene el perfil del usuario autenticado mediante PASETO.
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Perfil obtenido correctamente
 *       401:
 *         description: Token ausente, inválido o expirado
 */
router.get(
  "/perfil",
  autenticarPaseto,
  perfil
);

export default router;
```

---

# 19. Rutas de usuarios

Archivo:

```text
src/routes/usuarios.routes.js
```

Contenido:

```js
import express from "express";

import {
  listarUsuarios,
  obtenerUsuario,
} from "../controllers/usuarios.controller.js";

import autenticarPaseto
  from "../middlewares/auth.middleware.js";

import autorizarRoles
  from "../middlewares/rol.middleware.js";

const router = express.Router();

/**
 * @swagger
 * /api/usuarios:
 *   get:
 *     tags:
 *       - Usuarios
 *     summary: Listar usuarios
 *     description: Solo disponible para administradores.
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de usuarios
 *       401:
 *         description: No autenticado
 *       403:
 *         description: No autorizado
 */
router.get(
  "/",
  autenticarPaseto,
  autorizarRoles("administrador"),
  listarUsuarios
);

/**
 * @swagger
 * /api/usuarios/{id}:
 *   get:
 *     tags:
 *       - Usuarios
 *     summary: Obtener usuario por ID
 *     description: Disponible para administradores y médicos.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: Usuario encontrado
 *       401:
 *         description: No autenticado
 *       403:
 *         description: No autorizado
 *       404:
 *         description: Usuario no encontrado
 */
router.get(
  "/:id",
  autenticarPaseto,
  autorizarRoles(
    "administrador",
    "medico"
  ),
  obtenerUsuario
);

export default router;
```

Aquí puede observarse el pipeline completo:

```text
GET /api/usuarios
        ↓
autenticarPaseto
        ↓
¿PASETO válido?
        ↓
req.usuario
        ↓
autorizarRoles("administrador")
        ↓
¿rol permitido?
    /          \
   NO           SÍ
   ↓             ↓
  403      listarUsuarios
                  ↓
                 200
```

---

# 20. Archivo principal

Archivo:

```text
src/app.js
```

Contenido:

```js
import express from "express";
import dotenv from "dotenv";

import swaggerUi
  from "swagger-ui-express";

import swaggerSpec
  from "./config/swagger.js";

import authRoutes
  from "./routes/auth.routes.js";

import usuariosRoutes
  from "./routes/usuarios.routes.js";

// ========================================
// Variables de entorno
// ========================================

dotenv.config();

// ========================================
// Express
// ========================================

const app = express();

app.use(express.json());

// ========================================
// Swagger
// ========================================

app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec)
);

// ========================================
// Rutas
// ========================================

app.use(
  "/api/auth",
  authRoutes
);

app.use(
  "/api/usuarios",
  usuariosRoutes
);

// ========================================
// Servidor
// ========================================

const PORT =
  process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(
    `Servidor ejecutándose en http://localhost:${PORT}`
  );

  console.log(
    `Swagger disponible en http://localhost:${PORT}/api-docs`
  );
});
```

---

# 21. Ejecutar el proyecto

En modo desarrollo:

```bash
npm run dev
```

Salida esperada:

```text
Claves PASETO generadas
Servidor ejecutándose en http://localhost:3000
Swagger disponible en http://localhost:3000/api-docs
```

---

# 22. Abrir Swagger

Abrir en el navegador:

```text
http://localhost:3000/api-docs
```

Swagger mostrará los endpoints agrupados aproximadamente así:

```text
API PASETO V2

Autenticación

POST /api/auth/login
GET  /api/auth/perfil 🔒

Usuarios

GET  /api/usuarios 🔒
GET  /api/usuarios/{id} 🔒
```

---

# 23. Prueba 1 — Login del administrador

Endpoint:

```text
POST /api/auth/login
```

Body:

```json
{
  "email": "admin@hospital.com",
  "password": "123456"
}
```

Resultado esperado:

```text
200 OK
```

Respuesta:

```json
{
  "mensaje": "Login correcto",
  "token": "v4.public..."
}
```

El token debe comenzar por:

```text
v4.public.
```

---

# 24. Autorizar en Swagger

Copiar el token generado.

En Swagger seleccionar:

```text
Authorize 🔒
```

Introducir el token PASETO.

Swagger enviará posteriormente:

```text
Authorization: Bearer <PASETO>
```

---

# 25. Prueba 2 — Consultar perfil

Con el administrador autenticado:

```text
GET /api/auth/perfil
```

Resultado esperado:

```text
200 OK
```

Ejemplo:

```json
{
  "id": 1,
  "nombre": "Administrador Hospital",
  "email": "admin@hospital.com",
  "rol": "administrador",
  "activo": true
}
```

---

# 26. Prueba 3 — Perfil sin token

Cerrar la autorización de Swagger utilizando:

```text
Logout
```

Ejecutar:

```text
GET /api/auth/perfil
```

Resultado esperado:

```text
401 Unauthorized
```

Respuesta:

```json
{
  "mensaje": "Token no proporcionado"
}
```

---

# 27. Prueba 4 — Listar usuarios como administrador

Realizar nuevamente login con:

```json
{
  "email": "admin@hospital.com",
  "password": "123456"
}
```

Autorizar Swagger con el nuevo token.

Ejecutar:

```text
GET /api/usuarios
```

Resultado esperado:

```text
200 OK
```

El administrador puede acceder porque la ruta requiere:

```js
autorizarRoles("administrador")
```

---

# 28. Prueba 5 — Login como médico

Cerrar la autorización anterior.

Ejecutar:

```text
POST /api/auth/login
```

Body:

```json
{
  "email": "laura@hospital.com",
  "password": "123456"
}
```

Resultado:

```text
200 OK
```

Copiar el nuevo PASETO y autorizar Swagger.

---

# 29. Prueba 6 — Médico consulta usuario

Ejecutar:

```text
GET /api/usuarios/1
```

Resultado esperado:

```text
200 OK
```

Esto funciona porque la ruta permite:

```js
autorizarRoles(
  "administrador",
  "medico"
)
```

---

# 30. Prueba 7 — Médico intenta listar usuarios

Con el mismo PASETO del médico:

```text
GET /api/usuarios
```

Resultado esperado:

```text
403 Forbidden
```

Respuesta:

```json
{
  "mensaje": "No tiene permisos para acceder a este recurso"
}
```

El usuario está correctamente autenticado, pero su rol no tiene autorización.

---

# 31. Prueba 8 — Paciente

Realizar login:

```json
{
  "email": "carlos@hospital.com",
  "password": "123456"
}
```

Resultado esperado:

```text
200 OK
```

Autorizar Swagger utilizando el PASETO generado.

El paciente puede consultar:

```text
GET /api/auth/perfil
```

Resultado:

```text
200 OK
```

Pero si intenta:

```text
GET /api/usuarios
```

obtendrá:

```text
403 Forbidden
```

---

# 32. Prueba 9 — Credenciales incorrectas

Ejecutar:

```text
POST /api/auth/login
```

Body:

```json
{
  "email": "admin@hospital.com",
  "password": "incorrecta"
}
```

Resultado esperado:

```text
401 Unauthorized
```

Respuesta:

```json
{
  "mensaje": "Credenciales inválidas"
}
```

---

# 33. Prueba 10 — Usuario inexistente

Body:

```json
{
  "email": "noexiste@hospital.com",
  "password": "123456"
}
```

Resultado:

```text
401 Unauthorized
```

Esto evita revelar si el correo existe o no.

---

# 34. Prueba 11 — PASETO manipulado

Tomar un PASETO válido y modificar manualmente uno de sus caracteres.

Ejecutar posteriormente:

```text
GET /api/auth/perfil
```

Resultado esperado:

```text
401 Unauthorized
```

Respuesta:

```json
{
  "mensaje": "Token inválido o expirado"
}
```

Esto demuestra que la firma permite detectar modificaciones en el token.

---

# 35. Matriz general de pruebas

| # | Prueba | Rol | Resultado |
|---:|---|---|---:|
| 1 | Login correcto | Administrador | `200` |
| 2 | Perfil con PASETO | Administrador | `200` |
| 3 | Perfil sin PASETO | — | `401` |
| 4 | Listar usuarios | Administrador | `200` |
| 5 | Consultar usuario | Médico | `200` |
| 6 | Listar usuarios | Médico | `403` |
| 7 | Perfil | Paciente | `200` |
| 8 | Listar usuarios | Paciente | `403` |
| 9 | Password incorrecto | — | `401` |
| 10 | Usuario inexistente | — | `401` |
| 11 | PASETO manipulado | — | `401` |
| 12 | Usuario inexistente por ID | Admin/Médico | `404` |

---

# 36. Flujo completo del laboratorio

```text
                   CLIENTE
                      │
                      ▼
              POST /api/auth/login
                      │
                      ▼
                email/password
                      │
                      ▼
               usuarios locales
                      │
                ¿son válidos?
                 /          \
               NO            SÍ
               ↓              ↓
              401       CLAVE PRIVADA
                              ↓
                         Sign()
                              ↓
                      PASETO v4.public
                              ↓
                           CLIENTE
                              ↓
               Authorization: Bearer
                              ↓
                     autenticarPaseto
                              ↓
                       CLAVE PÚBLICA
                              ↓
                          Verify()
                              ↓
                       ¿token válido?
                        /          \
                      NO            SÍ
                      ↓              ↓
                     401        req.usuario
                                     ↓
                              autorizarRoles
                                     ↓
                              ¿rol permitido?
                               /          \
                             NO            SÍ
                             ↓              ↓
                            403        CONTROLADOR
                                          ↓
                                      RESPUESTA
                                          ↓
                                         200
```

---

# 37. Análisis de dependencias — SCA

También se realizó análisis de las dependencias del proyecto mediante:

```bash
npm audit
```

El análisis reportó:

```text
3 high severity vulnerabilities
```

El paquete señalado fue:

```text
braces
```

La cadena de dependencias identificada fue:

```text
nodemon
   ↓
chokidar
   ↓
braces
```

Por tanto, `braces` no fue instalado directamente por el proyecto.

Es una **dependencia transitiva** asociada a Nodemon.

---

# 38. Diferenciar desarrollo y producción

En `package.json`, Nodemon se encuentra en:

```json
"devDependencies": {
  "nodemon": "^3.1.14"
}
```

Esto significa que se utiliza como herramienta de desarrollo.

Para analizar solamente las dependencias necesarias en producción se ejecutó:

```bash
npm audit --omit=dev
```

Resultado obtenido:

```text
found 0 vulnerabilities
```

La evidencia puede resumirse así:

| Análisis | Resultado | Interpretación |
|---|---|---|
| `npm audit` | 3 HIGH | Hallazgos en el árbol completo |
| Paquete afectado | `braces` | Dependencia transitiva |
| Cadena | `nodemon → chokidar → braces` | Origen identificado |
| Dependencia directa afectada | Nodemon | Herramienta de desarrollo |
| `npm audit --omit=dev` | `0 vulnerabilities` | Sin estos hallazgos en dependencias de producción |
| `npm audit fix --force` | No aplicado | Propone un cambio potencialmente incompatible |
| Tratamiento | Analizar, documentar y monitorear | No aplicar cambios forzados sin evaluación |

---

# 39. ¿Por qué no se ejecutó npm audit fix --force?

El reporte indicó:

```text
fix available via `npm audit fix --force`
```

pero también:

```text
Will install nodemon@1.14.10, which is a breaking change
```

Por esta razón no se ejecutó automáticamente:

```bash
npm audit fix --force
```

Un hallazgo de seguridad no debe tratarse simplemente ejecutando comandos de corrección forzada.

El proceso recomendado es:

```text
HALLAZGO
   ↓
IDENTIFICAR PAQUETE
   ↓
IDENTIFICAR DEPENDENCIA
   ↓
DIRECTA / TRANSITIVA
   ↓
DESARROLLO / PRODUCCIÓN
   ↓
ANALIZAR EXPOSICIÓN
   ↓
EVALUAR ACTUALIZACIÓN
   ↓
APLICAR TRATAMIENTO
   ↓
VERIFICAR NUEVAMENTE
```

---

# 40. Limitaciones intencionales del laboratorio

Este proyecto tiene algunas decisiones simplificadas porque su propósito es educativo.

## Contraseñas locales

Actualmente:

```js
password: "123456"
```

En producción deberían utilizarse hashes seguros.

## Claves PASETO en memoria

Actualmente las claves se generan al iniciar:

```js
const claves =
  await v4.GenerateKeyPair();
```

Por tanto:

```text
INICIO SERVIDOR
      ↓
NUEVO PAR DE CLAVES
      ↓
tokens generados
      ↓
REINICIO SERVIDOR
      ↓
NUEVO PAR DE CLAVES
      ↓
tokens anteriores dejan de ser válidos
```

Esto es apropiado para el laboratorio, pero no para producción.

Las claves deberían persistirse y administrarse mediante mecanismos seguros.

## Datos locales

Los usuarios están almacenados en:

```text
src/data/usuarios.js
```

Una versión posterior utilizará una base de datos.

---

# 41. Conceptos aprendidos

Al finalizar el laboratorio se deben comprender los siguientes conceptos:

| Concepto | Aplicación |
|---|---|
| PASETO | Token de seguridad |
| `v4.public` | PASETO con criptografía asimétrica |
| Clave privada | Firma del token |
| Clave pública | Verificación del token |
| Bearer Token | Transporte del PASETO |
| Claims | Información incluida en el token |
| Middleware | Intercepta la solicitud |
| Autenticación | Determina quién es el usuario |
| Autorización | Determina qué puede hacer |
| Roles | Controlan acceso a recursos |
| `401` | Problema de autenticación |
| `403` | Problema de autorización |
| Swagger | Documentación y prueba de la API |
| OpenAPI | Especificación de la API |
| SCA | Análisis de componentes/dependencias |
| `npm audit` | Identificación de vulnerabilidades conocidas |

---

# 42. Evolución del laboratorio

La ruta de aprendizaje propuesta es:

```text
PASETO V1
│
├── Login
├── PASETO v4.public
├── Bearer Token
└── Ruta protegida
        ↓
PASETO V2
│
├── Datos locales
├── Usuarios
├── Roles
├── Autenticación
├── Autorización
├── Swagger / OpenAPI
└── SCA con npm audit

```

---

# Conclusión

**LAB PASETO V2** amplía el concepto básico de generación de tokens para implementar un flujo completo de seguridad:

```text
CREDENCIALES
      ↓
AUTENTICACIÓN
      ↓
PASETO
      ↓
BEARER TOKEN
      ↓
VERIFICACIÓN
      ↓
CLAIMS
      ↓
ROL
      ↓
AUTORIZACIÓN
      ↓
RECURSO PROTEGIDO
```

Además, Swagger permite documentar y probar los endpoints de forma interactiva, mientras que `npm audit` introduce el análisis de componentes de software y demuestra que los hallazgos de seguridad deben ser **analizados en contexto antes de aplicar una corrección automática**.

