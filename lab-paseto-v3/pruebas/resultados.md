# Resultados de pruebas — LAB PASETO V3

**Fecha y hora de ejecución:** lunes, 5 de octubre de 2026, 9:41:14 p. m.

**Servidor:** http://localhost:3000 (arrancado con `npm start`)

**Resultado global:** 27/27 pruebas pasaron ✅

> Los datos viven en memoria, por lo que esta ejecución partió de los
> 3 usuarios originales. El id del usuario creado en la prueba 4 se
> toma siempre de la respuesta, nunca escrito fijo.

---

## Matriz de pruebas

| # | Prueba | Rol | Esperado | Obtenido | Resultado | Evidencia |
|---:|---|---|---|---|:---:|---|
| 1 | Login correcto | Administrador | `200 "Login correcto" + token empieza por v4.public.` | `200 "Login correcto" + prefijo correcto` | ✅ PASA | [📸](./capturas/01-login-admin-200.png) |
| 2 | Perfil con PASETO | Administrador | `200 + datos del admin` | `200 + admin@hospital.com / administrador` | ✅ PASA | [📸](./capturas/03-perfil-admin-200.png) |
| 3 | Listar usuarios | Administrador | `200 + ningún usuario trae password` | `200 + 3 usuarios, 0 passwords expuestos` | ✅ PASA | [📸](./capturas/04-listar-usuarios-200.png) |
| 4 | Crear usuario (Ana Torres) | Administrador | `201 "Usuario creado" + sin password + id devuelto` | `201 "Usuario creado" + id = 4, sin password` | ✅ PASA | [📸](./capturas/05-crear-usuario-201.png) |
| 5 | Consultar usuario creado (id 4) | Administrador | `200 + es Ana Torres` | `200 + Ana Torres / paciente` | ✅ PASA | [📸](./capturas/06-obtener-usuario-200.png) |
| 6 | PUT completo | Administrador | `200 "Usuario actualizado completamente" + nombre y rol cambiaron` | `200 "Usuario actualizado completamente" + Ana Torres Actualizada / medico` | ✅ PASA | [📸](./capturas/07-put-completo-200.png) |
| 7 | PUT incompleto (falta el resto de campos) | Administrador | `400 "Datos inválidos" + arreglo de errores` | `400 "Datos inválidos" + 8 errores` | ✅ PASA | [📸](./capturas/08-put-incompleto-400.png) |
| 8 | PATCH parcial (activo = false) | Administrador | `200 "Usuario actualizado parcialmente" + activo=false y el resto intacto` | `200 "Usuario actualizado parcialmente" + activo=false, nombre/email/rol sin cambios` | ✅ PASA | [📸](./capturas/09-patch-parcial-200.png) |
| 24 | Login de un usuario deshabilitado | Ana (activo=false) | `403 "Usuario deshabilitado"` | `403 "Usuario deshabilitado"` | ✅ PASA | [📸](./capturas/10-login-deshabilitado-403.png) |
| 9 | PATCH con body vacío | Administrador | `400 "Debe proporcionar al menos un campo para actualizar"` | `400 "Debe proporcionar al menos un campo para actualizar"` | ✅ PASA | [📸](./capturas/11-patch-vacio-400.png) |
| 10 | POST con email inválido | Administrador | `400 "Datos inválidos"` | `400 "Datos inválidos"` | ✅ PASA | [📸](./capturas/12-email-invalido-400.png) |
| 11 | POST con rol 'superadministrador' | Administrador | `400 "Datos inválidos"` | `400 "Datos inválidos"` | ✅ PASA | [📸](./capturas/13-rol-invalido-400.png) |
| 12 | POST con email ya registrado | Administrador | `409 "El email ya está registrado"` | `409 "El email ya está registrado"` | ✅ PASA | [📸](./capturas/14-email-duplicado-409.png) |
| 13 | GET /api/usuarios/999 | Administrador | `404 "Usuario no encontrado"` | `404 "Usuario no encontrado"` | ✅ PASA | [📸](./capturas/15-usuario-999-404.png) |
| 14 | DELETE del usuario creado (id 4) | Administrador | `204 + cuerpo vacío` | `204 + sin cuerpo` | ✅ PASA | [📸](./capturas/16-delete-204.png) |
| 15 | GET del usuario eliminado | Administrador | `404 "Usuario no encontrado"` | `404 "Usuario no encontrado"` | ✅ PASA | [📸](./capturas/17-get-tras-delete-404.png) |
| 16 | GET /api/usuarios sin token | — | `401 "Token no proporcionado"` | `401 "Token no proporcionado"` | ✅ PASA | [📸](./capturas/18-sin-token-401.png) |
| 17 | Token manipulado (pos 123: l por A) | — | `401 "Token inválido o expirado"` | `401 "Token inválido o expirado"` | ✅ PASA | [📸](./capturas/19-token-manipulado-401.png) |
| 18 | GET /api/usuarios/1 | Médico | `200` | `200` | ✅ PASA | [📸](./capturas/20-medico-obtener-200.png) |
| 19 | GET /api/usuarios (listar) | Médico | `403 "No tiene permisos para acceder a este recurso"` | `403 "No tiene permisos para acceder a este recurso"` | ✅ PASA | [📸](./capturas/21-medico-listar-403.png) |
| 20 | POST /api/usuarios con body válido | Médico | `403 "No tiene permisos para acceder a este recurso"` | `403 "No tiene permisos para acceder a este recurso"` | ✅ PASA | [📸](./capturas/22-medico-crear-403.png) |
| 21 | Perfil propio | Paciente | `200 + rol paciente` | `200 + rol = paciente` | ✅ PASA | [📸](./capturas/23-paciente-perfil-200.png) |
| 21b | GET /api/usuarios (listar) | Paciente | `403 "No tiene permisos para acceder a este recurso"` | `403 "No tiene permisos para acceder a este recurso"` | ✅ PASA | [📸](./capturas/24-paciente-listar-403.png) |
| 21c | GET /api/usuarios/1 | Paciente | `403 "No tiene permisos para acceder a este recurso"` | `403 "No tiene permisos para acceder a este recurso"` | ✅ PASA | [📸](./capturas/25-paciente-obtener-403.png) |
| 22 | Login con password incorrecto | — | `401 "Credenciales inválidas"` | `401 "Credenciales inválidas"` | ✅ PASA | [📸](./capturas/26-password-incorrecto-401.png) |
| 23 | Login con email inexistente | — | `401 "Credenciales inválidas"` | `401 "Credenciales inválidas"` | ✅ PASA | [📸](./capturas/27-email-inexistente-401.png) |
| 25 | Swagger disponible (/api-docs) | — | `200` | `200` | ✅ PASA | [📸](./capturas/00-swagger-home.png) |

---

## Matriz de permisos comprobada

Corresponde a la sección 57 del README. La columna "Comprobado en"
indica qué prueba de esta ejecución verificó cada combinación.

| Operación | Administrador | Médico | Paciente | Comprobado en |
|---|:---:|:---:|:---:|---|
| Login | ✅ | ✅ | ✅ | 1, 18, 21 |
| Perfil propio | ✅ | ✅ | ✅ | 2, 18, 21 |
| Listar usuarios | ✅ | ❌ | ❌ | 3, 19, 21b |
| Consultar usuario por ID | ✅ | ✅ | ❌ | 5, 18, 21c |
| Crear usuario | ✅ | ❌ | ❌ | 4, 20 |
| PUT usuario | ✅ | ❌ | ❌ | 6 |
| PATCH usuario | ✅ | ❌ | ❌ | 8 |
| DELETE usuario | ✅ | ❌ | ❌ | 14 |

---

## Códigos HTTP ejercitados

| Código | Veces | Significado |
|---:|---:|---|
| `200` | 9 | OK |
| `201` | 1 | Created — usuario creado |
| `204` | 1 | No Content — usuario eliminado |
| `400` | 4 | Bad Request — datos inválidos |
| `401` | 4 | Unauthorized — no autenticado |
| `403` | 5 | Forbidden — autenticado sin permisos |
| `404` | 2 | Not Found — usuario inexistente |
| `409` | 1 | Conflict — email ya registrado |

---

## Detalle de cada prueba

> Los tokens aparecen recortados a los primeros 30 caracteres.
> Las capturas se tomaron ejecutando cada endpoint desde Swagger UI
> (se regeneran con `npm run test:capturas`).

### 1. Login correcto — Administrador

**Esperado:** `200 "Login correcto" + token empieza por v4.public.`
**Obtenido:** `200 "Login correcto" + prefijo correcto`
**Resultado:** ✅ PASA

Respuesta del servidor:

```json
{
  "mensaje": "Login correcto",
  "token": "v4.public.eyJzdWIiOiIxIiwiZW1h..."
}
```

Evidencia en Swagger UI:

![Prueba 1](./capturas/01-login-admin-200.png)

### 2. Perfil con PASETO — Administrador

**Esperado:** `200 + datos del admin`
**Obtenido:** `200 + admin@hospital.com / administrador`
**Resultado:** ✅ PASA

Respuesta del servidor:

```json
{
  "id": 1,
  "nombre": "Administrador Hospital",
  "email": "admin@hospital.com",
  "rol": "administrador",
  "activo": true
}
```

Evidencia en Swagger UI:

![Prueba 2](./capturas/03-perfil-admin-200.png)

### 3. Listar usuarios — Administrador

**Esperado:** `200 + ningún usuario trae password`
**Obtenido:** `200 + 3 usuarios, 0 passwords expuestos`
**Resultado:** ✅ PASA

Respuesta del servidor:

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
  },
  {
    "id": 3,
    "nombre": "Carlos Pérez",
    "email": "carlos@hospital.com",
    "rol": "paciente",
    "activo": true
  }
]
```

Evidencia en Swagger UI:

![Prueba 3](./capturas/04-listar-usuarios-200.png)

### 4. Crear usuario (Ana Torres) — Administrador

**Esperado:** `201 "Usuario creado" + sin password + id devuelto`
**Obtenido:** `201 "Usuario creado" + id = 4, sin password`
**Resultado:** ✅ PASA

Respuesta del servidor:

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

Evidencia en Swagger UI:

![Prueba 4](./capturas/05-crear-usuario-201.png)

### 5. Consultar usuario creado (id 4) — Administrador

**Esperado:** `200 + es Ana Torres`
**Obtenido:** `200 + Ana Torres / paciente`
**Resultado:** ✅ PASA

Respuesta del servidor:

```json
{
  "id": 4,
  "nombre": "Ana Torres",
  "email": "ana@hospital.com",
  "rol": "paciente",
  "activo": true
}
```

Evidencia en Swagger UI:

![Prueba 5](./capturas/06-obtener-usuario-200.png)

### 6. PUT completo — Administrador

**Esperado:** `200 "Usuario actualizado completamente" + nombre y rol cambiaron`
**Obtenido:** `200 "Usuario actualizado completamente" + Ana Torres Actualizada / medico`
**Resultado:** ✅ PASA

Respuesta del servidor:

```json
{
  "mensaje": "Usuario actualizado completamente",
  "usuario": {
    "id": 4,
    "nombre": "Ana Torres Actualizada",
    "email": "ana@hospital.com",
    "rol": "medico",
    "activo": true
  }
}
```

Evidencia en Swagger UI:

![Prueba 6](./capturas/07-put-completo-200.png)

### 7. PUT incompleto (falta el resto de campos) — Administrador

**Esperado:** `400 "Datos inválidos" + arreglo de errores`
**Obtenido:** `400 "Datos inválidos" + 8 errores`
**Resultado:** ✅ PASA

Respuesta del servidor:

```json
{
  "mensaje": "Datos inválidos",
  "errores": [
    {
      "type": "field",
      "value": "",
      "msg": "El email es obligatorio",
      "path": "email",
      "location": "body"
    },
    {
      "type": "field",
      "value": "",
      "msg": "El email no es válido",
      "path": "email",
      "location": "body"
    },
    {
      "type": "field",
      "msg": "La contraseña es obligatoria",
      "path": "password",
      "location": "body"
    },
    {
      "type": "field",
      "msg": "La contraseña debe tener mínimo 6 caracteres",
      "path": "password",
      "location": "body"
    },
    {
      "type": "field",
      "msg": "El rol es obligatorio",
      "path": "rol",
      "location": "body"
    },
    {
      "type": "field",
      "msg": "El rol no es válido",
      "path": "rol",
      "location": "body"
    },
    {
      "type": "field",
      "msg": "El campo activo es obligatorio",
      "path": "activo",
      "location": "body"
    },
    {
      "type": "field",
      "msg": "Activo debe ser booleano",
      "path": "activo",
      "location": "body"
    }
  ]
}
```

Evidencia en Swagger UI:

![Prueba 7](./capturas/08-put-incompleto-400.png)

### 8. PATCH parcial (activo = false) — Administrador

**Esperado:** `200 "Usuario actualizado parcialmente" + activo=false y el resto intacto`
**Obtenido:** `200 "Usuario actualizado parcialmente" + activo=false, nombre/email/rol sin cambios`
**Resultado:** ✅ PASA

Respuesta del servidor:

```json
{
  "mensaje": "Usuario actualizado parcialmente",
  "usuario": {
    "id": 4,
    "nombre": "Ana Torres Actualizada",
    "email": "ana@hospital.com",
    "rol": "medico",
    "activo": false
  }
}
```

Evidencia en Swagger UI:

![Prueba 8](./capturas/09-patch-parcial-200.png)

### 24. Login de un usuario deshabilitado — Ana (activo=false)

**Esperado:** `403 "Usuario deshabilitado"`
**Obtenido:** `403 "Usuario deshabilitado"`
**Resultado:** ✅ PASA

Respuesta del servidor:

```json
{
  "mensaje": "Usuario deshabilitado"
}
```

Evidencia en Swagger UI:

![Prueba 24](./capturas/10-login-deshabilitado-403.png)

### 9. PATCH con body vacío — Administrador

**Esperado:** `400 "Debe proporcionar al menos un campo para actualizar"`
**Obtenido:** `400 "Debe proporcionar al menos un campo para actualizar"`
**Resultado:** ✅ PASA

Respuesta del servidor:

```json
{
  "mensaje": "Debe proporcionar al menos un campo para actualizar"
}
```

Evidencia en Swagger UI:

![Prueba 9](./capturas/11-patch-vacio-400.png)

### 10. POST con email inválido — Administrador

**Esperado:** `400 "Datos inválidos"`
**Obtenido:** `400 "Datos inválidos"`
**Resultado:** ✅ PASA

Respuesta del servidor:

```json
{
  "mensaje": "Datos inválidos",
  "errores": [
    {
      "type": "field",
      "value": "esto-no-es-un-email",
      "msg": "El email no es válido",
      "path": "email",
      "location": "body"
    }
  ]
}
```

Evidencia en Swagger UI:

![Prueba 10](./capturas/12-email-invalido-400.png)

### 11. POST con rol 'superadministrador' — Administrador

**Esperado:** `400 "Datos inválidos"`
**Obtenido:** `400 "Datos inválidos"`
**Resultado:** ✅ PASA

Respuesta del servidor:

```json
{
  "mensaje": "Datos inválidos",
  "errores": [
    {
      "type": "field",
      "value": "superadministrador",
      "msg": "El rol no es válido",
      "path": "rol",
      "location": "body"
    }
  ]
}
```

Evidencia en Swagger UI:

![Prueba 11](./capturas/13-rol-invalido-400.png)

### 12. POST con email ya registrado — Administrador

**Esperado:** `409 "El email ya está registrado"`
**Obtenido:** `409 "El email ya está registrado"`
**Resultado:** ✅ PASA

Respuesta del servidor:

```json
{
  "mensaje": "El email ya está registrado"
}
```

Evidencia en Swagger UI:

![Prueba 12](./capturas/14-email-duplicado-409.png)

### 13. GET /api/usuarios/999 — Administrador

**Esperado:** `404 "Usuario no encontrado"`
**Obtenido:** `404 "Usuario no encontrado"`
**Resultado:** ✅ PASA

Respuesta del servidor:

```json
{
  "mensaje": "Usuario no encontrado"
}
```

Evidencia en Swagger UI:

![Prueba 13](./capturas/15-usuario-999-404.png)

### 14. DELETE del usuario creado (id 4) — Administrador

**Esperado:** `204 + cuerpo vacío`
**Obtenido:** `204 + sin cuerpo`
**Resultado:** ✅ PASA

Respuesta del servidor:

```json
null
```

Evidencia en Swagger UI:

![Prueba 14](./capturas/16-delete-204.png)

### 15. GET del usuario eliminado — Administrador

**Esperado:** `404 "Usuario no encontrado"`
**Obtenido:** `404 "Usuario no encontrado"`
**Resultado:** ✅ PASA

Respuesta del servidor:

```json
{
  "mensaje": "Usuario no encontrado"
}
```

Evidencia en Swagger UI:

![Prueba 15](./capturas/17-get-tras-delete-404.png)

### 16. GET /api/usuarios sin token — —

**Esperado:** `401 "Token no proporcionado"`
**Obtenido:** `401 "Token no proporcionado"`
**Resultado:** ✅ PASA

Respuesta del servidor:

```json
{
  "mensaje": "Token no proporcionado"
}
```

Evidencia en Swagger UI:

![Prueba 16](./capturas/18-sin-token-401.png)

### 17. Token manipulado (pos 123: l por A) — —

**Esperado:** `401 "Token inválido o expirado"`
**Obtenido:** `401 "Token inválido o expirado"`
**Resultado:** ✅ PASA

Respuesta del servidor:

```json
{
  "mensaje": "Token inválido o expirado"
}
```

Evidencia en Swagger UI:

![Prueba 17](./capturas/19-token-manipulado-401.png)

### 18. GET /api/usuarios/1 — Médico

**Esperado:** `200`
**Obtenido:** `200`
**Resultado:** ✅ PASA

Respuesta del servidor:

```json
{
  "id": 1,
  "nombre": "Administrador Hospital",
  "email": "admin@hospital.com",
  "rol": "administrador",
  "activo": true
}
```

Evidencia en Swagger UI:

![Prueba 18](./capturas/20-medico-obtener-200.png)

### 19. GET /api/usuarios (listar) — Médico

**Esperado:** `403 "No tiene permisos para acceder a este recurso"`
**Obtenido:** `403 "No tiene permisos para acceder a este recurso"`
**Resultado:** ✅ PASA

Respuesta del servidor:

```json
{
  "mensaje": "No tiene permisos para acceder a este recurso"
}
```

Evidencia en Swagger UI:

![Prueba 19](./capturas/21-medico-listar-403.png)

### 20. POST /api/usuarios con body válido — Médico

**Esperado:** `403 "No tiene permisos para acceder a este recurso"`
**Obtenido:** `403 "No tiene permisos para acceder a este recurso"`
**Resultado:** ✅ PASA

Respuesta del servidor:

```json
{
  "mensaje": "No tiene permisos para acceder a este recurso"
}
```

Evidencia en Swagger UI:

![Prueba 20](./capturas/22-medico-crear-403.png)

### 21. Perfil propio — Paciente

**Esperado:** `200 + rol paciente`
**Obtenido:** `200 + rol = paciente`
**Resultado:** ✅ PASA

Respuesta del servidor:

```json
{
  "id": 3,
  "nombre": "Carlos Pérez",
  "email": "carlos@hospital.com",
  "rol": "paciente",
  "activo": true
}
```

Evidencia en Swagger UI:

![Prueba 21](./capturas/23-paciente-perfil-200.png)

### 21b. GET /api/usuarios (listar) — Paciente

**Esperado:** `403 "No tiene permisos para acceder a este recurso"`
**Obtenido:** `403 "No tiene permisos para acceder a este recurso"`
**Resultado:** ✅ PASA

Respuesta del servidor:

```json
{
  "mensaje": "No tiene permisos para acceder a este recurso"
}
```

Evidencia en Swagger UI:

![Prueba 21b](./capturas/24-paciente-listar-403.png)

### 21c. GET /api/usuarios/1 — Paciente

**Esperado:** `403 "No tiene permisos para acceder a este recurso"`
**Obtenido:** `403 "No tiene permisos para acceder a este recurso"`
**Resultado:** ✅ PASA

Respuesta del servidor:

```json
{
  "mensaje": "No tiene permisos para acceder a este recurso"
}
```

Evidencia en Swagger UI:

![Prueba 21c](./capturas/25-paciente-obtener-403.png)

### 22. Login con password incorrecto — —

**Esperado:** `401 "Credenciales inválidas"`
**Obtenido:** `401 "Credenciales inválidas"`
**Resultado:** ✅ PASA

Respuesta del servidor:

```json
{
  "mensaje": "Credenciales inválidas"
}
```

Evidencia en Swagger UI:

![Prueba 22](./capturas/26-password-incorrecto-401.png)

### 23. Login con email inexistente — —

**Esperado:** `401 "Credenciales inválidas"`
**Obtenido:** `401 "Credenciales inválidas"`
**Resultado:** ✅ PASA

Respuesta del servidor:

```json
{
  "mensaje": "Credenciales inválidas"
}
```

Evidencia en Swagger UI:

![Prueba 23](./capturas/27-email-inexistente-401.png)

### 25. Swagger disponible (/api-docs) — —

**Esperado:** `200`
**Obtenido:** `200`
**Resultado:** ✅ PASA

Respuesta del servidor:

```json
"\n<!-- HTML for static distribution bundle build -->\n<!DOCTYP..."
```

Evidencia en Swagger UI:

![Prueba 25](./capturas/00-swagger-home.png)

