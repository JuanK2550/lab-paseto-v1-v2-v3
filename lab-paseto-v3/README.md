# 🔐 LAB PASETO V3 — API REST CRUD con PASETO, Roles, Validaciones y Swagger

## 1. Descripción

Este laboratorio implementa una **API REST con Node.js y Express** que utiliza **PASETO v4.public** para autenticación mediante tokens.

Esta versión evoluciona los laboratorios anteriores incorporando un **CRUD completo de usuarios**:

- `GET`
- `POST`
- `PUT`
- `PATCH`
- `DELETE`

Además, se implementan:

- autenticación mediante PASETO;
- autorización basada en roles;
- validación de datos con `express-validator`;
- filtrado de datos con `matchedData()`;
- manejo de códigos HTTP;
- documentación mediante OpenAPI/Swagger;
- análisis de dependencias con `npm audit`.

---

# 2. Evolución del laboratorio

La ruta de aprendizaje seguida es:

```text
V1
PASETO básico
    ↓
Generación y verificación del token
    ↓
Ruta protegida


V2
PASETO + roles + Swagger
    ↓
Autenticación
    ↓
Autorización


V3
PASETO + CRUD completo
    ↓
GET
POST
PUT
PATCH
DELETE
    ↓
Validaciones
    ↓
Roles
    ↓
Swagger
    ↓
Pruebas de seguridad
```

En esta V3 trabajaremos todavía con **datos almacenados en memoria**.

La persistencia mediante una base de datos se abordará posteriormente.

---

# 3. Objetivos

Al finalizar este laboratorio se espera comprender:

- qué es una API REST;
- qué es PASETO;
- cómo generar un PASETO;
- cómo verificar un PASETO;
- cómo utilizar `Bearer Token`;
- diferencia entre autenticación y autorización;
- autorización basada en roles;
- operaciones CRUD;
- diferencias entre `PUT` y `PATCH`;
- validación de entradas;
- uso de `express-validator`;
- uso de `matchedData()`;
- códigos HTTP;
- documentación mediante Swagger;
- análisis de dependencias mediante `npm audit`.

---

# 4. Tecnologías utilizadas

| Tecnología | Uso |
|---|---|
| Node.js | Entorno de ejecución |
| Express | Framework para construir la API |
| ES Modules | Sistema de módulos `import/export` |
| PASETO | Tokens de autenticación |
| express-validator | Validación y sanitización |
| dotenv | Variables de entorno |
| swagger-jsdoc | Generación de OpenAPI |
| swagger-ui-express | Interfaz Swagger |
| Nodemon | Reinicio automático durante desarrollo |
| npm audit | Análisis de vulnerabilidades de dependencias |

---

# 5. ¿Qué es PASETO?

**PASETO** significa:

> Platform-Agnostic Security Tokens

Es un estándar para la creación de tokens de seguridad.

En este laboratorio utilizamos:

```text
PASETO v4.public
```

La palabra `public` no significa que el token sea público.

Significa que utiliza **criptografía asimétrica**:

```text
CLAVE PRIVADA
     ↓
   FIRMA
     ↓
   PASETO
     ↓
CLAVE PÚBLICA
     ↓
VERIFICACIÓN
```

La clave privada se utiliza para **firmar** tokens.

La clave pública se utiliza para **verificar** que esos tokens sean auténticos.

---

# 6. Claims

Los **claims** son datos contenidos dentro del token.

En nuestro laboratorio incluimos:

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
| `email` | Correo electrónico |
| `rol` | Rol del usuario |

El token tendrá una estructura similar a:

```text
v4.public.xxxxxxxxxxxxxxxxxxxxxxxxx
```

---

# 7. Autenticación vs autorización

Son conceptos diferentes.

## Autenticación

Responde:

> ¿Quién eres?

En nuestra API:

```text
email + password
       ↓
     login
       ↓
    PASETO
```

Posteriormente:

```text
PASETO
   ↓
autenticarPaseto
   ↓
Verify()
   ↓
req.usuario
```

---

## Autorización

Responde:

> ¿Qué puedes hacer?

Ejemplo:

```text
req.usuario
     ↓
rol = administrador
     ↓
autorizarRoles("administrador")
     ↓
acceso permitido
```

Por lo tanto:

```text
AUTENTICACIÓN
     ↓
¿Quién eres?
     ↓
   PASETO
     ↓
AUTORIZACIÓN
     ↓
¿Qué puedes hacer?
     ↓
    ROL
```

---

# 8. CRUD

CRUD representa las operaciones fundamentales realizadas sobre un recurso.

| CRUD | HTTP | Acción |
|---|---|---|
| Create | POST | Crear |
| Read | GET | Consultar |
| Update | PUT / PATCH | Actualizar |
| Delete | DELETE | Eliminar |

Nuestra API implementará:

```text
GET     /api/usuarios
GET     /api/usuarios/:id
POST    /api/usuarios
PUT     /api/usuarios/:id
PATCH   /api/usuarios/:id
DELETE  /api/usuarios/:id
```

---

# 9. PUT vs PATCH

Ambos permiten actualizar recursos, pero conceptualmente tienen objetivos diferentes.

## PUT

Realiza el reemplazo completo de la representación que estamos manejando.

Ejemplo:

```json
{
  "nombre": "Ana Torres",
  "email": "ana@hospital.com",
  "password": "654321",
  "rol": "medico",
  "activo": true
}
```

Todos los campos definidos para nuestro usuario son requeridos.

---

## PATCH

Realiza una actualización parcial.

Por ejemplo:

```json
{
  "activo": false
}
```

No es necesario enviar los demás campos.

```text
              ACTUALIZAR
                  │
          ┌───────┴───────┐
          │               │
         PUT            PATCH
          │               │
      COMPLETO          PARCIAL
```

---

# 10. Códigos HTTP utilizados

| Código | Significado | Ejemplo |
|---:|---|---|
| `200` | OK | Consulta o actualización correcta |
| `201` | Created | Usuario creado |
| `204` | No Content | Usuario eliminado |
| `400` | Bad Request | Datos inválidos |
| `401` | Unauthorized | No autenticado |
| `403` | Forbidden | Autenticado pero sin permisos |
| `404` | Not Found | Usuario inexistente |
| `409` | Conflict | Email ya registrado |
| `500` | Internal Server Error | Error interno |

Una diferencia importante es:

```text
401
 ↓
No puedo comprobar correctamente
quién eres.

403
 ↓
Sé quién eres,
pero no tienes permiso.
```

---

# 11. Crear el proyecto

Podemos partir de `lab-paseto-v2` y crear una copia denominada:

```text
lab-paseto-v3
```

Entrar al proyecto:

```powershell
cd lab-paseto-v3
```

Si no se copió `node_modules`, instalar nuevamente las dependencias:

```powershell
npm install
```

Agregar `express-validator`:

```powershell
npm install express-validator
```

---

# 12. Dependencias

Las principales dependencias son:

```powershell
npm install express dotenv paseto swagger-jsdoc swagger-ui-express express-validator
```

Dependencia de desarrollo:

```powershell
npm install --save-dev nodemon
```

---

# 13. package.json

Archivo:

```text
package.json
```

Contenido:

```json
{
  "name": "lab-paseto-v3",
  "version": "1.0.0",
  "description": "API REST CRUD protegida con PASETO",
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
    "express-validator": "^7.2.1",
    "paseto": "^4.0.1",
    "swagger-jsdoc": "^6.3.0",
    "swagger-ui-express": "^5.0.1"
  },
  "devDependencies": {
    "nodemon": "^3.1.14"
  }
}
```

> Las versiones pueden variar dependiendo del momento en el que se ejecute `npm install`.

La propiedad:

```json
"type": "module"
```

permite utilizar:

```js
import ...
export ...
```

en lugar de CommonJS:

```js
require(...)
module.exports
```

---

# 14. Estructura del proyecto

Crear la siguiente estructura:

```text
lab-paseto-v3/
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
│   ├── validators/
│   │   └── usuarios.validator.js
│   │
│   └── app.js
│
├── .env
├── package.json
├── package-lock.json
└── README.md
```

---

# 15. Variables de entorno

Crear:

```text
.env
```

Contenido:

```env
PORT=3000
```

---

# 16. Datos de usuarios

Crear:

```text
src/data/usuarios.js
```

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

## Importante

Las contraseñas están almacenadas en texto plano **únicamente con fines educativos**.

En una aplicación real deberían almacenarse mediante un algoritmo de hash apropiado.

Además, los datos se encuentran en memoria.

Por ejemplo:

```text
Servidor inicia
      ↓
3 usuarios
      ↓
POST
      ↓
4 usuarios
      ↓
reiniciar servidor
      ↓
3 usuarios nuevamente
```

Todavía no tenemos persistencia.

---

# 17. Controlador de autenticación

Crear:

```text
src/controllers/auth.controller.js
```

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

---

# 18. Middleware de autenticación

Crear:

```text
src/middlewares/auth.middleware.js
```

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
          mensaje:
            "Token no proporcionado",
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

El flujo es:

```text
Authorization
      ↓
Bearer <PASETO>
      ↓
autenticarPaseto
      ↓
extraer token
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

# 19. Middleware de autorización

Crear:

```text
src/middlewares/rol.middleware.js
```

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

Podemos utilizarlo de diferentes formas:

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

---

# 20. Validadores de usuarios

Crear:

```text
src/validators/usuarios.validator.js
```

```js
import {
  body,
  validationResult,
  matchedData,
} from "express-validator";

// ========================================
// Validar resultado
// ========================================

const validarResultado = (
  req,
  res,
  next
) => {
  const errores =
    validationResult(req);

  if (!errores.isEmpty()) {
    return res.status(400).json({
      mensaje: "Datos inválidos",
      errores: errores.array(),
    });
  }

  req.datosValidados =
    matchedData(req);

  next();
};

// ========================================
// POST - Crear usuario
// ========================================

const validarCrearUsuario = [
  body("nombre")
    .trim()
    .notEmpty()
    .withMessage(
      "El nombre es obligatorio"
    )
    .isLength({
      min: 3,
      max: 100,
    })
    .withMessage(
      "El nombre debe tener entre 3 y 100 caracteres"
    ),

  body("email")
    .trim()
    .notEmpty()
    .withMessage(
      "El email es obligatorio"
    )
    .isEmail()
    .withMessage(
      "El email no es válido"
    )
    .normalizeEmail(),

  body("password")
    .notEmpty()
    .withMessage(
      "La contraseña es obligatoria"
    )
    .isLength({ min: 6 })
    .withMessage(
      "La contraseña debe tener mínimo 6 caracteres"
    ),

  body("rol")
    .notEmpty()
    .withMessage(
      "El rol es obligatorio"
    )
    .isIn([
      "administrador",
      "medico",
      "paciente",
    ])
    .withMessage(
      "El rol no es válido"
    ),

  body("activo")
    .notEmpty()
    .withMessage(
      "El campo activo es obligatorio"
    )
    .isBoolean()
    .withMessage(
      "Activo debe ser booleano"
    )
    .toBoolean(),

  validarResultado,
];

// ========================================
// PUT - Actualización completa
// ========================================

const validarActualizarUsuario = [
  body("nombre")
    .trim()
    .notEmpty()
    .withMessage(
      "El nombre es obligatorio"
    )
    .isLength({
      min: 3,
      max: 100,
    })
    .withMessage(
      "El nombre debe tener entre 3 y 100 caracteres"
    ),

  body("email")
    .trim()
    .notEmpty()
    .withMessage(
      "El email es obligatorio"
    )
    .isEmail()
    .withMessage(
      "El email no es válido"
    )
    .normalizeEmail(),

  body("password")
    .notEmpty()
    .withMessage(
      "La contraseña es obligatoria"
    )
    .isLength({ min: 6 })
    .withMessage(
      "La contraseña debe tener mínimo 6 caracteres"
    ),

  body("rol")
    .notEmpty()
    .withMessage(
      "El rol es obligatorio"
    )
    .isIn([
      "administrador",
      "medico",
      "paciente",
    ])
    .withMessage(
      "El rol no es válido"
    ),

  body("activo")
    .notEmpty()
    .withMessage(
      "El campo activo es obligatorio"
    )
    .isBoolean()
    .withMessage(
      "Activo debe ser booleano"
    )
    .toBoolean(),

  validarResultado,
];

// ========================================
// PATCH - Actualización parcial
// ========================================

const validarActualizarParcial = [
  body("nombre")
    .optional()
    .trim()
    .isLength({
      min: 3,
      max: 100,
    })
    .withMessage(
      "El nombre debe tener entre 3 y 100 caracteres"
    ),

  body("email")
    .optional()
    .trim()
    .isEmail()
    .withMessage(
      "El email no es válido"
    )
    .normalizeEmail(),

  body("password")
    .optional()
    .isLength({ min: 6 })
    .withMessage(
      "La contraseña debe tener mínimo 6 caracteres"
    ),

  body("rol")
    .optional()
    .isIn([
      "administrador",
      "medico",
      "paciente",
    ])
    .withMessage(
      "El rol no es válido"
    ),

  body("activo")
    .optional()
    .isBoolean()
    .withMessage(
      "Activo debe ser booleano"
    )
    .toBoolean(),

  validarResultado,
];

export {
  validarCrearUsuario,
  validarActualizarUsuario,
  validarActualizarParcial,
};
```

---

# 21. ¿Qué hace matchedData()?

`matchedData()` obtiene solamente los datos que fueron contemplados por los validadores.

El flujo queda:

```text
REQUEST
   ↓
req.body
   ↓
VALIDADORES
   ↓
validationResult()
   ↓
¿errores?
  /    \
 SÍ     NO
 ↓       ↓
400   matchedData()
          ↓
   req.datosValidados
          ↓
      CONTROLLER
```

Esto ayuda a evitar que el controlador utilice indiscriminadamente todos los campos enviados por el cliente.

---

# 22. Controlador CRUD

Crear:

```text
src/controllers/usuarios.controller.js
```

```js
import usuarios
  from "../data/usuarios.js";

// ========================================
// Función auxiliar
// Ocultar password
// ========================================

const usuarioSeguro = (usuario) => {
  const {
    password,
    ...datosSeguros
  } = usuario;

  return datosSeguros;
};

// ========================================
// GET
// Listar usuarios
// ========================================

const listarUsuarios = (
  req,
  res
) => {
  const resultado =
    usuarios.map(usuarioSeguro);

  return res
    .status(200)
    .json(resultado);
};

// ========================================
// GET /:id
// Obtener usuario
// ========================================

const obtenerUsuario = (
  req,
  res
) => {
  const id =
    Number(req.params.id);

  const usuario =
    usuarios.find(
      (u) => u.id === id
    );

  if (!usuario) {
    return res.status(404).json({
      mensaje:
        "Usuario no encontrado",
    });
  }

  return res
    .status(200)
    .json(
      usuarioSeguro(usuario)
    );
};

// ========================================
// POST
// Crear usuario
// ========================================

const crearUsuario = (
  req,
  res
) => {
  const datos =
    req.datosValidados;

  const emailExiste =
    usuarios.some(
      (u) =>
        u.email === datos.email
    );

  if (emailExiste) {
    return res.status(409).json({
      mensaje:
        "El email ya está registrado",
    });
  }

  const nuevoId =
    usuarios.length > 0
      ? Math.max(
          ...usuarios.map(
            (u) => u.id
          )
        ) + 1
      : 1;

  const nuevoUsuario = {
    id: nuevoId,
    ...datos,
  };

  usuarios.push(
    nuevoUsuario
  );

  return res.status(201).json({
    mensaje: "Usuario creado",
    usuario:
      usuarioSeguro(
        nuevoUsuario
      ),
  });
};

// ========================================
// PUT
// Actualización completa
// ========================================

const actualizarUsuario = (
  req,
  res
) => {
  const id =
    Number(req.params.id);

  const indice =
    usuarios.findIndex(
      (u) => u.id === id
    );

  if (indice === -1) {
    return res.status(404).json({
      mensaje:
        "Usuario no encontrado",
    });
  }

  const datos =
    req.datosValidados;

  const emailExiste =
    usuarios.some(
      (u) =>
        u.email === datos.email &&
        u.id !== id
    );

  if (emailExiste) {
    return res.status(409).json({
      mensaje:
        "El email ya está registrado",
    });
  }

  const usuarioActualizado = {
    id,
    ...datos,
  };

  usuarios[indice] =
    usuarioActualizado;

  return res.status(200).json({
    mensaje:
      "Usuario actualizado completamente",
    usuario:
      usuarioSeguro(
        usuarioActualizado
      ),
  });
};

// ========================================
// PATCH
// Actualización parcial
// ========================================

const actualizarUsuarioParcial = (
  req,
  res
) => {
  const id =
    Number(req.params.id);

  const indice =
    usuarios.findIndex(
      (u) => u.id === id
    );

  if (indice === -1) {
    return res.status(404).json({
      mensaje:
        "Usuario no encontrado",
    });
  }

  const datos =
    req.datosValidados;

  if (
    Object.keys(datos).length === 0
  ) {
    return res.status(400).json({
      mensaje:
        "Debe proporcionar al menos un campo para actualizar",
    });
  }

  if (datos.email) {
    const emailExiste =
      usuarios.some(
        (u) =>
          u.email === datos.email &&
          u.id !== id
      );

    if (emailExiste) {
      return res.status(409).json({
        mensaje:
          "El email ya está registrado",
      });
    }
  }

  const usuarioActualizado = {
    ...usuarios[indice],
    ...datos,
    id,
  };

  usuarios[indice] =
    usuarioActualizado;

  return res.status(200).json({
    mensaje:
      "Usuario actualizado parcialmente",
    usuario:
      usuarioSeguro(
        usuarioActualizado
      ),
  });
};

// ========================================
// DELETE
// Eliminar usuario
// ========================================

const eliminarUsuario = (
  req,
  res
) => {
  const id =
    Number(req.params.id);

  const indice =
    usuarios.findIndex(
      (u) => u.id === id
    );

  if (indice === -1) {
    return res.status(404).json({
      mensaje:
        "Usuario no encontrado",
    });
  }

  usuarios.splice(
    indice,
    1
  );

  return res
    .status(204)
    .send();
};

// ========================================
// Exportaciones
// ========================================

export {
  listarUsuarios,
  obtenerUsuario,
  crearUsuario,
  actualizarUsuario,
  actualizarUsuarioParcial,
  eliminarUsuario,
};
```

---

# 23. Configuración de Swagger

Crear:

```text
src/config/swagger.js
```

```js
import swaggerJsdoc
  from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.0",

    info: {
      title:
        "API PASETO V3",
      version: "3.0.0",
      description:
        "API REST CRUD con autenticación PASETO v4.public, autorización por roles y validaciones",
    },

    servers: [
      {
        url:
          "http://localhost:3000",
        description:
          "Servidor local",
      },
    ],

    components: {
      securitySchemes: {
        BearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat:
            "PASETO",
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

---

# 24. Rutas de autenticación

Crear:

```text
src/routes/auth.routes.js
```

```js
import express from "express";

import {
  login,
  perfil,
} from "../controllers/auth.controller.js";

import autenticarPaseto
  from "../middlewares/auth.middleware.js";

const router =
  express.Router();

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
 *       404:
 *         description: Usuario no encontrado
 */
router.get(
  "/perfil",
  autenticarPaseto,
  perfil
);

export default router;
```

---

# 25. Rutas CRUD de usuarios

Crear:

```text
src/routes/usuarios.routes.js
```

```js
import express from "express";

import {
  listarUsuarios,
  obtenerUsuario,
  crearUsuario,
  actualizarUsuario,
  actualizarUsuarioParcial,
  eliminarUsuario,
} from "../controllers/usuarios.controller.js";

import autenticarPaseto
  from "../middlewares/auth.middleware.js";

import autorizarRoles
  from "../middlewares/rol.middleware.js";

import {
  validarCrearUsuario,
  validarActualizarUsuario,
  validarActualizarParcial,
} from "../validators/usuarios.validator.js";

const router =
  express.Router();

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
  autorizarRoles(
    "administrador"
  ),
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

/**
 * @swagger
 * /api/usuarios:
 *   post:
 *     tags:
 *       - Usuarios
 *     summary: Crear usuario
 *     description: Solo disponible para administradores.
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombre
 *               - email
 *               - password
 *               - rol
 *               - activo
 *             properties:
 *               nombre:
 *                 type: string
 *                 example: Ana Torres
 *               email:
 *                 type: string
 *                 example: ana@hospital.com
 *               password:
 *                 type: string
 *                 example: "123456"
 *               rol:
 *                 type: string
 *                 enum:
 *                   - administrador
 *                   - medico
 *                   - paciente
 *                 example: paciente
 *               activo:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       201:
 *         description: Usuario creado
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autenticado
 *       403:
 *         description: No autorizado
 *       409:
 *         description: Email ya registrado
 */
router.post(
  "/",
  autenticarPaseto,
  autorizarRoles(
    "administrador"
  ),
  validarCrearUsuario,
  crearUsuario
);

/**
 * @swagger
 * /api/usuarios/{id}:
 *   put:
 *     tags:
 *       - Usuarios
 *     summary: Reemplazar completamente un usuario
 *     description: Todos los campos son requeridos. Solo disponible para administradores.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombre
 *               - email
 *               - password
 *               - rol
 *               - activo
 *             properties:
 *               nombre:
 *                 type: string
 *                 example: Ana Torres Actualizada
 *               email:
 *                 type: string
 *                 example: ana@hospital.com
 *               password:
 *                 type: string
 *                 example: "654321"
 *               rol:
 *                 type: string
 *                 enum:
 *                   - administrador
 *                   - medico
 *                   - paciente
 *                 example: medico
 *               activo:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: Usuario actualizado completamente
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autenticado
 *       403:
 *         description: No autorizado
 *       404:
 *         description: Usuario no encontrado
 *       409:
 *         description: Email ya registrado
 */
router.put(
  "/:id",
  autenticarPaseto,
  autorizarRoles(
    "administrador"
  ),
  validarActualizarUsuario,
  actualizarUsuario
);

/**
 * @swagger
 * /api/usuarios/{id}:
 *   patch:
 *     tags:
 *       - Usuarios
 *     summary: Actualizar parcialmente un usuario
 *     description: Permite modificar uno o varios campos. Solo disponible para administradores.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *                 example: Ana Torres
 *               email:
 *                 type: string
 *                 example: ana@hospital.com
 *               password:
 *                 type: string
 *                 example: "123456"
 *               rol:
 *                 type: string
 *                 enum:
 *                   - administrador
 *                   - medico
 *                   - paciente
 *               activo:
 *                 type: boolean
 *                 example: false
 *     responses:
 *       200:
 *         description: Usuario actualizado parcialmente
 *       400:
 *         description: Datos inválidos o actualización vacía
 *       401:
 *         description: No autenticado
 *       403:
 *         description: No autorizado
 *       404:
 *         description: Usuario no encontrado
 *       409:
 *         description: Email ya registrado
 */
router.patch(
  "/:id",
  autenticarPaseto,
  autorizarRoles(
    "administrador"
  ),
  validarActualizarParcial,
  actualizarUsuarioParcial
);

/**
 * @swagger
 * /api/usuarios/{id}:
 *   delete:
 *     tags:
 *       - Usuarios
 *     summary: Eliminar usuario
 *     description: Solo disponible para administradores.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Usuario eliminado
 *       401:
 *         description: No autenticado
 *       403:
 *         description: No autorizado
 *       404:
 *         description: Usuario no encontrado
 */
router.delete(
  "/:id",
  autenticarPaseto,
  autorizarRoles(
    "administrador"
  ),
  eliminarUsuario
);

export default router;
```

---

# 26. Archivo principal

Crear:

```text
src/app.js
```

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

const app =
  express();

app.use(
  express.json()
);

// ========================================
// Swagger
// ========================================

app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(
    swaggerSpec
  )
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

app.listen(
  PORT,
  () => {
    console.log(
      `Servidor ejecutándose en http://localhost:${PORT}`
    );

    console.log(
      `Swagger disponible en http://localhost:${PORT}/api-docs`
    );
  }
);
```

---

# 27. Flujo completo de la API

La arquitectura que tenemos ahora puede representarse así:

```text
                    CLIENTE
                       │
                       ▼
                    REQUEST
                       │
                       ▼
               ┌──────────────┐
               │    ROUTER    │
               └──────┬───────┘
                      │
                      ▼
              autenticarPaseto
                      │
              ¿PASETO válido?
                /           \
              NO             SÍ
              │               │
             401         req.usuario
                              │
                              ▼
                      autorizarRoles
                              │
                        ¿rol válido?
                         /       \
                       NO         SÍ
                       │           │
                      403      VALIDATOR
                                   │
                                   ▼
                           validationResult()
                                   │
                             ¿hay errores?
                              /        \
                            SÍ          NO
                            │            │
                           400      matchedData()
                                         │
                                         ▼
                                req.datosValidados
                                         │
                                         ▼
                                    CONTROLLER
                                         │
                                         ▼
                                    usuarios[]
                                         │
                                         ▼
                                     RESPONSE
```

---

# 28. Orden de middlewares

Por ejemplo:

```js
router.post(
  "/",
  autenticarPaseto,
  autorizarRoles("administrador"),
  validarCrearUsuario,
  crearUsuario
);
```

El orden es importante:

```text
1. autenticarPaseto
       ↓
¿Quién eres?

2. autorizarRoles
       ↓
¿Qué puedes hacer?

3. validarCrearUsuario
       ↓
¿Los datos son válidos?

4. crearUsuario
       ↓
Ejecutar operación
```

Por lo tanto:

```text
REQUEST
   ↓
AUTHENTICATION
   ↓
AUTHORIZATION
   ↓
VALIDATION
   ↓
CONTROLLER
   ↓
RESPONSE
```

---

# 29. Ejecutar el proyecto

Ejecutar:

```powershell
npm run dev
```

El resultado esperado es:

```text
Claves PASETO generadas
Servidor ejecutándose en http://localhost:3000
Swagger disponible en http://localhost:3000/api-docs
```

---

# 30. Abrir Swagger

Abrir en el navegador:

```text
http://localhost:3000/api-docs
```

Se deberían observar los endpoints:

```text
Autenticación

POST   /api/auth/login
GET    /api/auth/perfil


Usuarios

GET     /api/usuarios
POST    /api/usuarios

GET     /api/usuarios/{id}
PUT     /api/usuarios/{id}
PATCH   /api/usuarios/{id}
DELETE  /api/usuarios/{id}
```

---

# 31. PRUEBA 1 — Login administrador

Ejecutar:

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

Respuesta similar a:

```json
{
  "mensaje": "Login correcto",
  "token": "v4.public..."
}
```

Copiar el token.

---

# 32. Autorizar Swagger

En Swagger seleccionar:

```text
Authorize 🔒
```

Introducir el PASETO obtenido.

Swagger utilizará:

```http
Authorization: Bearer <PASETO>
```

A partir de este momento podremos probar los endpoints protegidos.

---

# 33. PRUEBA 2 — Perfil

Ejecutar:

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

# 34. PRUEBA 3 — Listar usuarios

Ejecutar:

```text
GET /api/usuarios
```

Resultado:

```text
200 OK
```

Debe retornar los usuarios sin mostrar las contraseñas.

Ejemplo:

```json
[
  {
    "id": 1,
    "nombre": "Administrador Hospital",
    "email": "admin@hospital.com",
    "rol": "administrador",
    "activo": true
  },
  {
    "id": 2,
    "nombre": "Laura Gómez",
    "email": "laura@hospital.com",
    "rol": "medico",
    "activo": true
  }
]
```

---

# 35. PRUEBA 4 — Crear usuario

Ejecutar:

```text
POST /api/usuarios
```

Body:

```json
{
  "nombre": "Ana Torres",
  "email": "ana@hospital.com",
  "password": "123456",
  "rol": "paciente",
  "activo": true
}
```

Resultado esperado:

```text
201 Created
```

Respuesta:

```json
{
  "mensaje": "Usuario creado",
  "usuario": {
    "id": 4,
    "nombre": "Ana Torres",
    "email": "ana@hospital.com",
    "rol": "paciente",
    "activo": true
  }
}
```

Observa que la contraseña **no aparece en la respuesta**.

---

# 36. PRUEBA 5 — Consultar usuario creado

Ejecutar:

```text
GET /api/usuarios/4
```

Resultado:

```text
200 OK
```

Respuesta:

```json
{
  "id": 4,
  "nombre": "Ana Torres",
  "email": "ana@hospital.com",
  "rol": "paciente",
  "activo": true
}
```

---

# 37. PRUEBA 6 — PUT

Ahora reemplazaremos completamente el usuario.

Ejecutar:

```text
PUT /api/usuarios/4
```

Body:

```json
{
  "nombre": "Ana Torres Actualizada",
  "email": "ana@hospital.com",
  "password": "654321",
  "rol": "medico",
  "activo": true
}
```

Resultado:

```text
200 OK
```

Ahora el usuario tiene:

```text
nombre   → Ana Torres Actualizada
email    → ana@hospital.com
password → 654321
rol      → medico
activo   → true
```

---

# 38. PRUEBA 7 — PUT incompleto

Intentar:

```text
PUT /api/usuarios/4
```

con:

```json
{
  "nombre": "Ana Torres"
}
```

Como PUT requiere la representación completa definida para el laboratorio, faltan:

```text
email
password
rol
activo
```

Resultado esperado:

```text
400 Bad Request
```

---

# 39. PRUEBA 8 — PATCH

Ahora actualizaremos solamente un campo.

Ejecutar:

```text
PATCH /api/usuarios/4
```

Body:

```json
{
  "activo": false
}
```

Resultado:

```text
200 OK
```

Los demás campos permanecen iguales.

Conceptualmente:

```text
ANTES

nombre = Ana Torres Actualizada
email  = ana@hospital.com
rol    = medico
activo = true


PATCH

{
  "activo": false
}


DESPUÉS

nombre = Ana Torres Actualizada
email  = ana@hospital.com
rol    = medico
activo = false
```

---

# 40. PRUEBA 9 — PATCH vacío

Ejecutar:

```text
PATCH /api/usuarios/4
```

Body:

```json
{}
```

Resultado esperado:

```text
400 Bad Request
```

Respuesta:

```json
{
  "mensaje": "Debe proporcionar al menos un campo para actualizar"
}
```

---

# 41. PRUEBA 10 — Validación de email

Ejecutar:

```text
POST /api/usuarios
```

con:

```json
{
  "nombre": "Pedro Ruiz",
  "email": "esto-no-es-un-email",
  "password": "123456",
  "rol": "paciente",
  "activo": true
}
```

Resultado:

```text
400 Bad Request
```

Porque:

```js
.isEmail()
```

detectará que el correo no es válido.

---

# 42. PRUEBA 11 — Rol inválido

Intentar:

```json
{
  "nombre": "Pedro Ruiz",
  "email": "pedro@hospital.com",
  "password": "123456",
  "rol": "superadministrador",
  "activo": true
}
```

Resultado:

```text
400 Bad Request
```

Porque solamente permitimos:

```text
administrador
medico
paciente
```

mediante:

```js
.isIn([
  "administrador",
  "medico",
  "paciente",
])
```

---

# 43. PRUEBA 12 — Email duplicado

Intentar crear:

```json
{
  "nombre": "Otro administrador",
  "email": "admin@hospital.com",
  "password": "123456",
  "rol": "paciente",
  "activo": true
}
```

El email ya existe.

Resultado:

```text
409 Conflict
```

Respuesta:

```json
{
  "mensaje": "El email ya está registrado"
}
```

Este es un buen ejemplo de `409`:

```text
REQUEST VÁLIDO
       ↓
pero entra en conflicto
con el estado actual
del recurso
       ↓
409 Conflict
```

---

# 44. PRUEBA 13 — Usuario inexistente

Ejecutar:

```text
GET /api/usuarios/999
```

Resultado:

```text
404 Not Found
```

Respuesta:

```json
{
  "mensaje": "Usuario no encontrado"
}
```

---

# 45. PRUEBA 14 — DELETE

Ejecutar:

```text
DELETE /api/usuarios/4
```

Resultado:

```text
204 No Content
```

Es normal que Swagger no muestre un JSON de respuesta.

`204` significa que la operación fue exitosa pero el servidor **no devuelve contenido**.

Por eso usamos:

```js
return res
  .status(204)
  .send();
```

---

# 46. PRUEBA 15 — Comprobar eliminación

Después del DELETE ejecutar:

```text
GET /api/usuarios/4
```

Resultado:

```text
404 Not Found
```

Con esto comprobamos que el recurso fue eliminado.

---

# 47. Caso feliz CRUD completo

La secuencia completa queda:

```text
LOGIN ADMIN
     ↓
200 + PASETO
     ↓
AUTHORIZE
     ↓
POST /usuarios
     ↓
201 Created
     ↓
GET /usuarios/4
     ↓
200 OK
     ↓
PUT /usuarios/4
     ↓
200 OK
     ↓
PATCH /usuarios/4
     ↓
200 OK
     ↓
DELETE /usuarios/4
     ↓
204 No Content
     ↓
GET /usuarios/4
     ↓
404 Not Found
```

---

# 48. PRUEBA 16 — Sin PASETO

En Swagger cerrar la autorización:

```text
Authorize
   ↓
Logout
```

Intentar:

```text
GET /api/usuarios
```

Resultado:

```text
401 Unauthorized
```

Porque no se proporcionó un token.

---

# 49. PRUEBA 17 — PASETO modificado

Obtener un token válido y modificar manualmente algún carácter.

Ejemplo conceptual:

```text
TOKEN ORIGINAL

v4.public.ABCDEFG...


TOKEN MODIFICADO

v4.public.ABCDEXG...
```

Enviar el token modificado.

Resultado esperado:

```text
401 Unauthorized
```

La verificación criptográfica falla.

---

# 50. PRUEBA 18 — Médico

Realizar login:

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

Copiar el PASETO y autorizar Swagger.

Ejecutar:

```text
GET /api/usuarios/1
```

Resultado:

```text
200 OK
```

porque el endpoint permite:

```js
autorizarRoles(
  "administrador",
  "medico"
)
```

---

# 51. PRUEBA 19 — Médico intentando listar usuarios

Con el PASETO de Laura:

```text
GET /api/usuarios
```

Resultado:

```text
403 Forbidden
```

¿Por qué?

El usuario está correctamente autenticado:

```text
PASETO válido
      ↓
Laura
      ↓
rol = medico
```

pero el endpoint exige:

```js
autorizarRoles(
  "administrador"
)
```

Por tanto:

```text
AUTENTICADO
     ↓
SÍ

AUTORIZADO
     ↓
NO

403
```

---

# 52. PRUEBA 20 — Médico intentando crear usuario

Con el PASETO del médico:

```text
POST /api/usuarios
```

Resultado:

```text
403 Forbidden
```

El middleware de roles detiene la petición antes de llegar al controlador.

---

# 53. PRUEBA 21 — Paciente

Realizar login:

```json
{
  "email": "carlos@hospital.com",
  "password": "123456"
}
```

Resultado:

```text
200 OK
+
PASETO
```

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

Y si intenta:

```text
GET /api/usuarios/1
```

también:

```text
403 Forbidden
```

---

# 54. PRUEBA 22 — Password incorrecto

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

Resultado:

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

# 55. PRUEBA 23 — Email inexistente

Ejecutar:

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

También devolvemos:

```json
{
  "mensaje": "Credenciales inválidas"
}
```

No respondemos:

```text
"El usuario no existe"
```

porque dar información diferente para email inexistente y contraseña incorrecta puede facilitar la **enumeración de usuarios**.

---

# 56. Matriz general de pruebas

| # | Prueba | Resultado esperado |
|---:|---|---|
| 1 | Login administrador | `200` + PASETO |
| 2 | Perfil con token válido | `200` |
| 3 | Listar usuarios como admin | `200` |
| 4 | Crear usuario | `201` |
| 5 | Consultar usuario creado | `200` |
| 6 | PUT completo | `200` |
| 7 | PUT incompleto | `400` |
| 8 | PATCH parcial | `200` |
| 9 | PATCH vacío | `400` |
| 10 | Email inválido | `400` |
| 11 | Rol inválido | `400` |
| 12 | Email duplicado | `409` |
| 13 | Usuario inexistente | `404` |
| 14 | DELETE | `204` |
| 15 | GET después de DELETE | `404` |
| 16 | Endpoint protegido sin PASETO | `401` |
| 17 | PASETO modificado | `401` |
| 18 | Médico consulta usuario por ID | `200` |
| 19 | Médico lista todos los usuarios | `403` |
| 20 | Médico intenta crear usuario | `403` |
| 21 | Paciente intenta acceder a usuarios | `403` |
| 22 | Password incorrecto | `401` |
| 23 | Email inexistente | `401` |

---

# 57. Matriz de permisos

| Operación | Administrador | Médico | Paciente |
|---|:---:|:---:|:---:|
| Login | ✅ | ✅ | ✅ |
| Perfil propio | ✅ | ✅ | ✅ |
| Listar usuarios | ✅ | ❌ | ❌ |
| Consultar usuario por ID | ✅ | ✅ | ❌ |
| Crear usuario | ✅ | ❌ | ❌ |
| PUT usuario | ✅ | ❌ | ❌ |
| PATCH usuario | ✅ | ❌ | ❌ |
| DELETE usuario | ✅ | ❌ | ❌ |

---

# 58. ¿Dónde está la seguridad?

La seguridad no está únicamente en PASETO.

Nuestra API combina varias capas:

```text
                  API
                   │
       ┌───────────┼────────────┐
       │           │            │
    PASETO       ROLES      VALIDACIÓN
       │           │            │
       ▼           ▼            ▼
Autenticación  Autorización   Entradas
```

Podemos ampliar el flujo:

```text
CLIENTE
   ↓
PASETO
   ↓
VERIFICACIÓN
   ↓
CLAIMS
   ↓
ROL
   ↓
AUTORIZACIÓN
   ↓
VALIDACIÓN
   ↓
matchedData()
   ↓
CONTROLLER
   ↓
DATOS
   ↓
RESPONSE SEGURO
```

---

# 59. Protección de contraseñas en las respuestas

Aunque actualmente almacenamos contraseñas en texto plano con fines educativos, no debemos devolverlas al cliente.

Para ello utilizamos:

```js
const usuarioSeguro = (usuario) => {
  const {
    password,
    ...datosSeguros
  } = usuario;

  return datosSeguros;
};
```

Por tanto:

```text
USUARIO INTERNO

{
  id,
  nombre,
  email,
  password,
  rol,
  activo
}

        ↓

usuarioSeguro()

        ↓

RESPUESTA

{
  id,
  nombre,
  email,
  rol,
  activo
}
```

---

# 60. npm audit — SCA

Además de probar la lógica de nuestra aplicación, debemos revisar las dependencias.

Ejecutar:

```powershell
npm audit
```

`npm audit` realiza un análisis de las dependencias instaladas y las compara con vulnerabilidades conocidas reportadas por el ecosistema de npm.

Esto corresponde a una forma de:

```text
SCA
Software Composition Analysis
```

---

# 61. Resultado observado en el laboratorio

En una ejecución anterior del proyecto se encontró una cadena similar a:

```text
braces
  ↓
chokidar
  ↓
nodemon
```

con vulnerabilidades reportadas como:

```text
3 high severity vulnerabilities
```

Esto no significa automáticamente que nuestro código de la API tenga tres vulnerabilidades.

Significa que existen vulnerabilidades conocidas dentro del árbol de dependencias analizado.

---

# 62. Dependencias de producción

También ejecutar:

```powershell
npm audit --omit=dev
```

En la ejecución realizada durante el laboratorio se obtuvo:

```text
found 0 vulnerabilities
```

Esto indica que npm no reportó vulnerabilidades conocidas en las **dependencias de producción analizadas en esa ejecución**.

La diferencia es:

```text
npm audit
     ↓
producción
+
desarrollo


npm audit --omit=dev
     ↓
solo producción
```

---

# 63. ¿Por qué aparecía Nodemon?

Nodemon está definido como:

```json
"devDependencies": {
  "nodemon": "^3.1.14"
}
```

Es una herramienta de desarrollo.

No forma parte de la lógica de ejecución que debería desplegarse como dependencia de producción.

La cadena encontrada fue:

```text
nodemon
   ↓
chokidar
   ↓
braces
   ↓
vulnerabilidad reportada
```

---

# 64. Cuidado con npm audit fix --force

npm puede recomendar:

```powershell
npm audit fix --force
```

No debe ejecutarse automáticamente sin revisar sus consecuencias.

En nuestro caso llegó a proponer un cambio hacia una versión antigua de Nodemon que podía implicar cambios incompatibles.

Por eso el proceso adecuado es:

```text
npm audit
    ↓
identificar vulnerabilidad
    ↓
identificar paquete
    ↓
¿directo o transitivo?
    ↓
¿producción o desarrollo?
    ↓
evaluar exposición
    ↓
evaluar actualización
    ↓
probar cambios
```

No:

```text
npm audit
    ↓
npm audit fix --force
    ↓
esperar que todo siga funcionando
```

---

# 65. Limitaciones intencionales del laboratorio

Esta API tiene varias simplificaciones intencionales.

## Contraseñas

Actualmente:

```text
password = texto plano
```

Una aplicación real debe utilizar hash seguro.

---

## Persistencia

Actualmente:

```text
usuarios.js
    ↓
ARRAY EN MEMORIA
```

Al reiniciar el servidor se pierden los cambios.

Posteriormente utilizaremos una base de datos.

---

## Claves PASETO

Actualmente generamos:

```text
clave privada
+
clave pública
```

cuando inicia el servidor.

Por tanto:

```text
Servidor A
   ↓
genera claves A
   ↓
crea TOKEN A

REINICIO
   ↓
Servidor B
   ↓
genera claves B
   ↓
TOKEN A ya no puede verificarse
con la nueva clave pública
```

Esto es adecuado para el laboratorio, pero no para producción.

En una aplicación real las claves deben administrarse y persistirse de forma segura.

---

# 66. Aspectos que faltarían para producción

Una implementación real debería considerar, entre otros:

- base de datos;
- hash seguro de contraseñas;
- gestión segura y persistente de claves;
- rotación de claves;
- validaciones adicionales;
- HTTPS;
- CORS correctamente restringido;
- rate limiting;
- Helmet;
- logging;
- manejo centralizado de errores;
- pruebas automatizadas;
- configuración segura de variables de entorno;
- políticas más detalladas de autorización;
- monitoreo;
- análisis SAST;
- análisis SCA;
- pruebas DAST.

---

# 67. Arquitectura alcanzada

Al finalizar esta V3 tenemos:

```text
                     API REST
                        │
                     EXPRESS
                        │
              ┌─────────┴─────────┐
              │                   │
         AUTENTICACIÓN           CRUD
              │                   │
           PASETO          GET POST PUT
              │             PATCH DELETE
              │                   │
              └─────────┬─────────┘
                        │
                        ▼
                 AUTORIZACIÓN
                        │
                       ROLES
                        │
                        ▼
                   VALIDACIÓN
                        │
                express-validator
                        │
                        ▼
                   matchedData
                        │
                        ▼
                   CONTROLLER
                        │
                        ▼
                  usuarios.js
                        │
                        ▼
                    RESPONSE
```

---

# 68. Conceptos aprendidos

Con este laboratorio hemos integrado:

```text
API REST
   +
EXPRESS
   +
ES MODULES
   +
CRUD
   +
PASETO v4.public
   +
BEARER TOKEN
   +
CLAIMS
   +
AUTENTICACIÓN
   +
AUTORIZACIÓN
   +
ROLES
   +
MIDDLEWARES
   +
EXPRESS-VALIDATOR
   +
matchedData()
   +
CÓDIGOS HTTP
   +
OPENAPI
   +
SWAGGER
   +
SCA
   +
npm audit
```

---

# 69. Resumen del flujo completo

Cuando un administrador crea un usuario:

```text
POST /api/usuarios
        ↓
Authorization:
Bearer <PASETO>
        ↓
autenticarPaseto
        ↓
Verify(clavePublica, token)
        ↓
req.usuario
        ↓
rol = administrador
        ↓
autorizarRoles("administrador")
        ↓
validarCrearUsuario
        ↓
validationResult()
        ↓
matchedData()
        ↓
req.datosValidados
        ↓
crearUsuario
        ↓
verificar email duplicado
        ↓
crear ID
        ↓
usuarios.push()
        ↓
eliminar password de respuesta
        ↓
201 Created
```

Ese flujo resume gran parte de los conceptos trabajados durante el laboratorio.

---

# 70. Conclusión

En esta versión se construyó una **API REST CRUD completa protegida mediante PASETO v4.public**.

PASETO se utiliza para resolver la autenticación, mientras que los roles permiten controlar la autorización sobre los recursos.

La API no se limita a generar tokens. Ahora los tokens forman parte de un flujo completo de seguridad:

```text
LOGIN
  ↓
PASETO
  ↓
AUTENTICACIÓN
  ↓
CLAIMS
  ↓
ROL
  ↓
AUTORIZACIÓN
  ↓
VALIDACIÓN
  ↓
CRUD
  ↓
RESPUESTA
```

También se incorporaron validaciones de entrada mediante `express-validator`, filtrado mediante `matchedData()`, documentación con Swagger y análisis de dependencias mediante `npm audit`.

La evolución lograda hasta este punto es:

```text
V1
PASETO
  ↓
V2
PASETO + ROLES + SWAGGER
  ↓
V3
PASETO + ROLES + VALIDACIONES + CRUD + SWAGGER
```
