# Laboratorio: Autenticación con PASETO en Node.js y Express

> 📄 **Documentación del laboratorio:** [`LABORATORIO - PASETO - V1 - V2 - V3.pdf`](./LABORATORIO%20-%20PASETO%20-%20V1%20-%20V2%20-%20V3.pdf)
>
> Informe único que documenta **las tres versiones** del laboratorio (V1, V2 y V3),
> con la explicación de cada una, las pruebas ejecutadas y sus capturas.
> El mismo archivo se encuentra en las carpetas `lab-paseto-v1/`, `lab-paseto-v2/` y `lab-paseto-v3/`.

## 1. Introducción

En este laboratorio construiremos una API sencilla con **Node.js + Express** para comprender el funcionamiento de **PASETO (Platform-Agnostic Security Tokens)**.

El objetivo es implementar el siguiente flujo:

```text
Usuario
   ↓
Login
   ↓
Validación de credenciales
   ↓
Generación de PASETO
   ↓
v4.public.xxxxxxxxx
   ↓
Bearer Token
   ↓
Ruta protegida
   ↓
Verificación del PASETO
   ↓
Acceso autorizado
```

Para mantener el ejemplo sencillo, utilizaremos un usuario almacenado directamente en el código.

> Este proyecto tiene fines educativos. En una aplicación real, los usuarios, contraseñas y claves criptográficas deben gestionarse de manera segura y persistente.

---

# 2. ¿Qué es PASETO?

**PASETO** significa:

**Platform-Agnostic Security Tokens**

Es un estándar para crear tokens de seguridad que pueden utilizarse en procesos como:

- autenticación;
- autorización;
- intercambio seguro de información;
- acceso a rutas protegidas;
- comunicación entre aplicaciones o servicios.

Un token PASETO puede tener una apariencia similar a:

```text
v4.public.eyJzdWIiOiIxIiwiZW1haWwiOiJhZG1p...
```

En este laboratorio utilizaremos:

```text
v4.public
```

Esto indica:

```text
v4
│
└── Versión 4 del protocolo

public
│
└── Uso de criptografía asimétrica
```

En el propósito `public`, una **clave privada** se utiliza para firmar el token y una **clave pública** se utiliza para verificarlo.

---

# 3. ¿Cómo funciona PASETO?

Nuestro laboratorio utiliza el siguiente proceso:

```text
             AUTENTICACIÓN CON PASETO

Usuario
   │
   │ email + password
   ▼
POST /api/auth/login
   │
   ▼
Validar credenciales
   │
   ├── Incorrectas ────────→ 401 Unauthorized
   │
   └── Correctas
          │
          ▼
       v4.Sign()
          │
          │ Clave privada
          ▼
     PASETO generado
          │
          ▼
v4.public.xxxxxxxxxxxxx
          │
          │
          │ Authorization:
          │ Bearer <token>
          ▼
GET /api/auth/perfil
          │
          ▼
auth.middleware.js
          │
          ▼
       v4.Verify()
          │
          │ Clave pública
          ▼
      ¿Es válido?
        /     \
      NO       SÍ
      │         │
      ▼         ▼
     401    req.usuario
                │
                ▼
              next()
                │
                ▼
              200 OK
```

La idea fundamental es:

```text
CLAVE PRIVADA
     ↓
   FIRMA
     ↓
   TOKEN
     ↓
VERIFICACIÓN
     ↓
CLAVE PÚBLICA
```

La clave privada **no debe entregarse al cliente**.

---

# 4. ¿Qué contiene el PASETO?

En nuestro ejemplo firmaremos los siguientes datos:

```js
{
  sub: "1",
  email: "admin@hospital.com",
  rol: "administrador"
}
```

Estos datos son conocidos como **claims**.

Después de verificar correctamente el token podremos recuperar información como:

```json
{
  "sub": "1",
  "email": "admin@hospital.com",
  "rol": "administrador",
  "iat": "2026-10-05T03:45:28Z",
  "exp": "2026-10-05T04:45:28Z"
}
```

Donde:

| Claim | Significado |
|---|---|
| `sub` | Identificador del sujeto o usuario |
| `email` | Correo del usuario |
| `rol` | Rol asignado |
| `iat` | Fecha/hora de emisión del token |
| `exp` | Fecha/hora de expiración |

---

# 5. ¿Para qué sirve el token?

Sin un mecanismo de tokens tendríamos un problema.

El usuario tendría que enviar sus credenciales constantemente:

```text
Petición 1 → email + password
Petición 2 → email + password
Petición 3 → email + password
Petición 4 → email + password
```

Con PASETO:

```text
LOGIN
  ↓
email + password
  ↓
PASETO
  ↓
Las siguientes peticiones
utilizan el token
  ↓
Bearer Token
```

Por tanto:

```text
Contraseña
    ↓
se utiliza para iniciar sesión

PASETO
    ↓
se utiliza posteriormente
para demostrar que el usuario
ya fue autenticado
```

---

# 6. Crear el proyecto

Crear la carpeta:

```bash
mkdir lab-paseto
```

Ingresar:

```bash
cd lab-paseto
```

Inicializar Node.js:

```bash
npm init -y
```

---

# 7. Instalar dependencias

Instalar Express, dotenv y PASETO:

```bash
npm install express paseto dotenv
```

Instalar Nodemon como dependencia de desarrollo:

```bash
npm install --save-dev nodemon
```

Las dependencias utilizadas en este laboratorio son:

```text
express
   ↓
Construcción de la API REST

dotenv
   ↓
Variables de entorno

paseto
   ↓
Generación y verificación de tokens

nodemon
   ↓
Reinicio automático del servidor
durante el desarrollo
```

---

# 8. Configurar `package.json`

El archivo debe quedar similar a:

```json
{
  "name": "lab-paseto",
  "version": "1.0.0",
  "description": "Laboratorio de autenticación utilizando PASETO",
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
    "paseto": "^4.0.1"
  },
  "devDependencies": {
    "nodemon": "^3.1.14"
  }
}
```

## ¿Por qué `"type": "module"`?

Porque utilizaremos **ES Modules**.

Esto permite escribir:

```js
import express from "express";
```

en lugar de CommonJS:

```js
const express = require("express");
```

También utilizaremos:

```js
export default router;
```

en lugar de:

```js
module.exports = router;
```

> Las versiones mostradas corresponden al proyecto utilizado en este laboratorio. Si npm instala versiones posteriores, el `package.json` puede variar.

---

# 9. Crear la estructura del proyecto

Crear la siguiente estructura:

```text
lab-paseto/
│
├── node_modules/
│
├── src/
│   │
│   ├── controllers/
│   │   └── auth.controller.js
│   │
│   ├── middlewares/
│   │   └── auth.middleware.js
│   │
│   ├── routes/
│   │   └── auth.routes.js
│   │
│   └── app.js
│
├── .env
├── package.json
├── package-lock.json
└── README.md
```

Cada carpeta tiene una responsabilidad:

| Carpeta/archivo | Responsabilidad |
|---|---|
| `controllers` | Lógica relacionada con autenticación y generación del token |
| `middlewares` | Interceptar y validar el PASETO antes de acceder a rutas protegidas |
| `routes` | Definir endpoints de la API |
| `app.js` | Configurar y arrancar Express |
| `.env` | Variables de entorno |

---

# 10. Configurar `.env`

Crear:

```text
.env
```

Contenido:

```env
PORT=3000
```

Esto permite configurar el puerto sin escribirlo directamente en el código.

---

# 11. Crear `src/app.js`

```js
import express from "express";
import dotenv from "dotenv";

import authRoutes from "./routes/auth.routes.js";

// ========================================
// Configuración de variables de entorno
// ========================================

dotenv.config();

// ========================================
// Configuración de Express
// ========================================

const app = express();

app.use(express.json());

// ========================================
// Rutas
// ========================================
app.get("/", (req, res) => {
  res.json({
    lab: "Lab PASETO",
    version: process.env.npm_package_version || "No especificada",
  });
});

app.use("/api/auth", authRoutes);

// ========================================
// Servidor
// ========================================

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(
    `Servidor ejecutándose en http://localhost:${PORT}`
  );
});
```

## ¿Qué hace?

Primero importa Express:

```js
import express from "express";
```

Carga las variables de entorno:

```js
dotenv.config();
```

Crea la aplicación:

```js
const app = express();
```

Permite recibir JSON:

```js
app.use(express.json());
```

Registra las rutas:

```js
app.use("/api/auth", authRoutes);
```

Por tanto, las rutas comenzarán con:

```text
/api/auth
```

Finalmente inicia el servidor:

```js
app.listen(PORT, ...)
```

---

# 12. Crear `src/controllers/auth.controller.js`

```js
import { PublicProtocol } from "paseto";

import {
  GenerateKeyPairFactory,
  SignFactory,
} from "paseto/v4/public";

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
// Inicialización de claves PASETO
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

    // Usuario ficticio para el laboratorio
    if (
      email !== "admin@hospital.com" ||
      password !== "123456"
    ) {
      return res.status(401).json({
        mensaje: "Credenciales inválidas",
      });
    }

    // ========================================
    // Generar PASETO
    // ========================================

    const token = await v4.Sign(
      clavePrivada,
      {
        sub: "1",
        email: "admin@hospital.com",
        rol: "administrador",
      }
    );

    console.log("TOKEN GENERADO:", token);

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

const obtenerClavePublica = () => clavePublica;

// ========================================
// Exportaciones
// ========================================

export {
  login,
  obtenerClavePublica,
};
```

## ¿Qué ocurre aquí?

Primero configuramos PASETO `v4.public`:

```js
const v4 = new PublicProtocol(
  GenerateKeyPairFactory,
  SignFactory
);
```

Después generamos el par de claves:

```js
const claves = await v4.GenerateKeyPair();
```

Obtenemos:

```text
GenerateKeyPair()
       │
       ├── secretKey → clave privada
       │
       └── publicKey → clave pública
```

Las almacenamos:

```js
clavePrivada = claves.secretKey;
clavePublica = claves.publicKey;
```

---

# 13. Validación del usuario

Para simplificar el laboratorio utilizamos un usuario ficticio:

```text
email: admin@hospital.com
password: 123456
```

Se valida mediante:

```js
if (
  email !== "admin@hospital.com" ||
  password !== "123456"
)
```

Si las credenciales son incorrectas:

```http
401 Unauthorized
```

---

# 14. Generación del PASETO

Cuando las credenciales son correctas ejecutamos:

```js
const token = await v4.Sign(
  clavePrivada,
  {
    sub: "1",
    email: "admin@hospital.com",
    rol: "administrador",
  }
);
```

Conceptualmente:

```text
CLAIMS
{
 sub,
 email,
 rol
}
       +
CLAVE PRIVADA
       ↓
    v4.Sign()
       ↓
PASETO FIRMADO
       ↓
v4.public.xxxxx
```

Finalmente devolvemos el token:

```js
return res.status(200).json({
  mensaje: "Login correcto",
  token,
});
```

---

# 15. Crear `src/middlewares/auth.middleware.js`

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
// Middleware de autenticación PASETO
// ========================================

const autenticarPaseto = async (req, res, next) => {
  try {
    const authorization =
      req.headers.authorization;

    // ========================================
    // Validar existencia del token
    // ========================================

    if (!authorization) {
      return res.status(401).json({
        mensaje: "Token no proporcionado",
      });
    }

    // Authorization:
    // Bearer <token>

    const [tipo, token] =
      authorization.split(" ");

    // ========================================
    // Validar formato Bearer
    // ========================================

    if (tipo !== "Bearer" || !token) {
      return res.status(401).json({
        mensaje: "Formato de token inválido",
      });
    }

    // ========================================
    // Obtener clave pública
    // ========================================

    const clavePublica =
      obtenerClavePublica();

    // ========================================
    // Verificar PASETO
    // ========================================

    const resultado = await v4.Verify(
      clavePublica,
      token
    );

    // Guardamos los claims autenticados
    req.usuario = resultado.claims;

    next();

  } catch (error) {
    return res.status(401).json({
      mensaje: "Token inválido o expirado",
    });
  }
};

export default autenticarPaseto;
```

---

# 16. ¿Qué hace el middleware?

Un middleware se ejecuta **entre la petición y la ruta final**.

```text
REQUEST
   ↓
MIDDLEWARE
   ↓
¿Cumple?
   │
 ┌─┴─┐
 NO  SÍ
 │    │
401  next()
      │
      ▼
    RUTA
```

Primero busca:

```js
req.headers.authorization
```

Esperamos recibir:

```http
Authorization: Bearer v4.public.xxxxx
```

Separamos:

```js
const [tipo, token] =
  authorization.split(" ");
```

Resultado:

```text
Bearer v4.public.xxxxx
  │           │
  │           └── token
  │
  └── tipo
```

Validamos:

```js
if (tipo !== "Bearer" || !token)
```

Luego verificamos el PASETO:

```js
const resultado = await v4.Verify(
  clavePublica,
  token
);
```

Si es válido:

```js
req.usuario = resultado.claims;
```

Finalmente:

```js
next();
```

permite continuar hacia la ruta protegida.

---

# 17. Crear `src/routes/auth.routes.js`

```js
import express from "express";

import {
  login,
} from "../controllers/auth.controller.js";

import autenticarPaseto
  from "../middlewares/auth.middleware.js";

const router = express.Router();

// ========================================
// Login
// ========================================

router.post("/login", login);

// ========================================
// Perfil protegido
// ========================================

router.get(
  "/perfil",
  autenticarPaseto,
  (req, res) => {
    return res.status(200).json({
      mensaje: "Acceso autorizado con PASETO",
      usuario: req.usuario,
    });
  }
);

export default router;
```

Tenemos dos endpoints:

| Método | Endpoint | Protección |
|---|---|---|
| POST | `/api/auth/login` | No requiere token |
| GET | `/api/auth/perfil` | Requiere PASETO |

La parte importante es:

```js
router.get(
  "/perfil",
  autenticarPaseto,
  (req, res) => {
```

El orden es:

```text
GET /perfil
     ↓
autenticarPaseto
     ↓
¿Token válido?
     ↓
     SÍ
     ↓
controlador de la ruta
     ↓
200 OK
```

---

# 18. Ejecutar el proyecto

Ejecutar:

```bash
npm run dev
```

Resultado esperado:

```text
[nodemon] starting `node src/app.js`

Claves PASETO generadas

Servidor ejecutándose en http://localhost:3000
```

---

# 19. Prueba 1 — Login correcto

En Postman:

```http
POST http://localhost:3000/api/auth/login
```

Seleccionar:

```text
Body
 ↓
raw
 ↓
JSON
```

Enviar:

```json
{
  "email": "admin@hospital.com",
  "password": "123456"
}
```

Resultado esperado:

```http
200 OK
```

Respuesta:

```json
{
  "mensaje": "Login correcto",
  "token": "v4.public.xxxxxxxxxxxxxxxxx"
}
```

El servidor también mostrará:

```text
TOKEN GENERADO: v4.public.xxxxxxxxx
```

---

# 20. Prueba 2 — Login incorrecto

Enviar:

```json
{
  "email": "admin@hospital.com",
  "password": "incorrecta"
}
```

Resultado esperado:

```http
401 Unauthorized
```

```json
{
  "mensaje": "Credenciales inválidas"
}
```

---

# 21. Prueba 3 — Acceder a `/perfil` sin token

Realizar:

```http
GET http://localhost:3000/api/auth/perfil
```

sin configurar Authorization.

Resultado:

```http
401 Unauthorized
```

```json
{
  "mensaje": "Token no proporcionado"
}
```

Esto demuestra que `/perfil` es una ruta protegida.

---

# 22. Prueba 4 — Acceder con PASETO

Copiar **todo el token** generado por `/login`.

Ejemplo:

```text
v4.public.eyJzdWIiOiIxIiwiZW1haWwi...
```

En Postman seleccionar:

```text
Authorization
      ↓
Bearer Token
      ↓
Token
```

Pegar únicamente:

```text
v4.public.xxxxxxxxxxxxxxxxx
```

Postman construirá automáticamente:

```http
Authorization: Bearer v4.public.xxxxxxxxx
```

Realizar:

```http
GET http://localhost:3000/api/auth/perfil
```

Resultado esperado:

```http
200 OK
```

Respuesta:

```json
{
  "mensaje": "Acceso autorizado con PASETO",
  "usuario": {
    "sub": "1",
    "email": "admin@hospital.com",
    "rol": "administrador",
    "iat": "...",
    "exp": "..."
  }
}
```

---

# 23. Prueba 5 — Manipular el token

Copiar el token válido:

```text
v4.public.eyJzdWIiOiIxI...
```

Modificar uno de sus caracteres:

```text
v4.public.XyJzdWIiOiIxI...
          ↑
       modificado
```

Enviar nuevamente:

```http
GET http://localhost:3000/api/auth/perfil
```

Resultado esperado:

```http
401 Unauthorized
```

```json
{
  "mensaje": "Token inválido o expirado"
}
```

Esto demuestra una característica fundamental de las firmas digitales:

```text
TOKEN ORIGINAL
      ↓
firma válida
      ↓
200 OK


TOKEN MODIFICADO
      ↓
firma ya no coincide
      ↓
401 Unauthorized
```

---

# 24. Resumen de pruebas

| # | Prueba | Resultado esperado |
|---|---|---|
| 1 | Login correcto | `200` + PASETO |
| 2 | Login incorrecto | `401` |
| 3 | Perfil sin token | `401` |
| 4 | Perfil con token válido | `200` |
| 5 | Perfil con token manipulado | `401` |

---

# 25. Flujo completo del laboratorio

```text
             CLIENTE / POSTMAN
                    │
                    │
                    ▼
          POST /api/auth/login
                    │
                    ▼
            auth.routes.js
                    │
                    ▼
         auth.controller.js
                    │
                    ▼
         validar credenciales
                    │
             ┌──────┴──────┐
             │             │
           ERROR          OK
             │             │
             ▼             ▼
            401        v4.Sign()
                           │
                     clave privada
                           │
                           ▼
                  v4.public.xxxxx
                           │
                           ▼
                       POSTMAN
                           │
                    Bearer Token
                           │
                           ▼
                GET /api/auth/perfil
                           │
                           ▼
                   auth.routes.js
                           │
                           ▼
                 auth.middleware.js
                           │
                           ▼
                     v4.Verify()
                           │
                      clave pública
                           │
                    ┌──────┴──────┐
                    │             │
                 INVÁLIDO       VÁLIDO
                    │             │
                    ▼             ▼
                   401       req.usuario
                                  │
                                  ▼
                                next()
                                  │
                                  ▼
                                200 OK
```

---

# 26. Conceptos aprendidos

Con este laboratorio se puede identificar la función de cada elemento:

| Concepto | Función |
|---|---|
| PASETO | Token de seguridad |
| `v4.public` | PASETO v4 con criptografía asimétrica |
| Clave privada | Firma tokens |
| Clave pública | Verifica tokens |
| `Sign()` | Genera/firma el PASETO |
| `Verify()` | Comprueba autenticidad e integridad |
| Claim | Información incluida en el token |
| Bearer | Esquema usado para transportar el token en HTTP |
| Middleware | Intercepta la petición antes de llegar a la ruta |
| `req.usuario` | Almacena los claims recuperados |
| `next()` | Permite continuar hacia la siguiente etapa de Express |
| `401` | Autenticación ausente o inválida |
| `200` | Acceso autorizado |

---

# 27. Consideraciones de seguridad

Este laboratorio está simplificado deliberadamente.

En una aplicación real **no deberíamos**:

```js
password !== "123456"
```

ni generar un nuevo par de claves cada vez que arranca el servidor.

Actualmente hacemos:

```text
npm run dev
     ↓
GenerateKeyPair()
     ↓
nuevas claves
```

Por tanto, al reiniciar el servidor:

```text
CLAVES ANTERIORES
       ↓
dejan de ser utilizadas

NUEVAS CLAVES
       ↓
los tokens anteriores
ya no podrán verificarse
```

En producción las claves deben almacenarse y administrarse de manera segura.

También deberían incorporarse, entre otros:

- base de datos;
- hash de contraseñas;
- gestión segura y persistente de claves;
- variables de entorno o gestores de secretos;
- validación de entradas;
- autorización basada en roles;
- HTTPS;
- rate limiting;
- manejo seguro de errores;
- rotación de claves;
- políticas de expiración.

---

# 28. PASETO vs JWT: idea inicial

Ambos pueden utilizarse para implementar autenticación basada en tokens:

```text
JWT

Login
  ↓
JWT
  ↓
Bearer
  ↓
Verify
  ↓
Ruta protegida
```

```text
PASETO

Login
  ↓
PASETO
  ↓
Bearer
  ↓
Verify
  ↓
Ruta protegida
```

Una diferencia conceptual importante es que PASETO define **versiones y propósitos criptográficos** más estructurados.

Por ejemplo:

```text
v4.public
│   │
│   └── propósito
│
└── versión
```

Esto busca reducir decisiones criptográficas inseguras o configuraciones incorrectas por parte del desarrollador.

En este laboratorio utilizamos:

```text
v4.public
```

con el principio:

```text
CLAVE PRIVADA
     ↓
   FIRMA

CLAVE PÚBLICA
     ↓
 VERIFICACIÓN
```

---

# 29. Conclusión

El laboratorio permitió implementar un flujo básico de autenticación mediante **PASETO v4.public**.

El proceso puede resumirse como:

```text
CREDENCIALES
     ↓
LOGIN
     ↓
FIRMA CON CLAVE PRIVADA
     ↓
PASETO
     ↓
BEARER TOKEN
     ↓
MIDDLEWARE
     ↓
VERIFICACIÓN CON CLAVE PÚBLICA
     ↓
CLAIMS
     ↓
RUTA PROTEGIDA
```

La contraseña se utiliza para comprobar inicialmente la identidad del usuario, mientras que el PASETO permite autenticar las peticiones posteriores sin reenviar la contraseña.

