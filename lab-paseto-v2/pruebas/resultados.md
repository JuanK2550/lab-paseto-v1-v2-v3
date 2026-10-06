# Resultados de pruebas — LAB PASETO V2

**Fecha y hora de ejecución:** lunes, 5 de octubre de 2026, 9:09:52 p. m.

**Servidor:** http://localhost:3000

**Resultado global:** 13/13 pruebas pasaron ✅

---

## Matriz de pruebas

| # | Prueba | Rol | Esperado | Obtenido | Resultado | Evidencia |
|---:|---|---|---|---|:---:|---|
| 1 | Login correcto | Administrador | `200 "Login correcto" + token empieza por v4.public.` | `200 "Login correcto" + prefijo correcto` | ✅ PASA | [📸](./capturas/01-login-admin-200.png) |
| 2 | Perfil con PASETO | Administrador | `200 + datos del admin` | `200 + admin@hospital.com / administrador` | ✅ PASA | [📸](./capturas/03-perfil-admin-200.png) |
| 3 | Perfil sin PASETO | — | `401 "Token no proporcionado"` | `401 "Token no proporcionado"` | ✅ PASA | [📸](./capturas/06-perfil-sin-token-401.png) |
| 4 | Listar usuarios | Administrador | `200 + ningún usuario trae password` | `200 + 0 passwords expuestos` | ✅ PASA | [📸](./capturas/04-usuarios-admin-200.png) |
| 5 | Consultar usuario por ID | Médico | `200 + sin password` | `200 + sin password` | ✅ PASA | [📸](./capturas/08-usuario-id-medico-200.png) |
| 6 | Listar usuarios | Médico | `403 "No tiene permisos para acceder a este recurso"` | `403 "No tiene permisos para acceder a este recurso"` | ✅ PASA | [📸](./capturas/09-usuarios-medico-403.png) |
| 7 | Perfil | Paciente | `200 + rol paciente` | `200 + rol = paciente` | ✅ PASA | [📸](./capturas/10-perfil-paciente-200.png) |
| 8 | Listar usuarios | Paciente | `403 "No tiene permisos para acceder a este recurso"` | `403 "No tiene permisos para acceder a este recurso"` | ✅ PASA | [📸](./capturas/11-usuarios-paciente-403.png) |
| 9 | Password incorrecto | — | `401 "Credenciales inválidas"` | `401 "Credenciales inválidas"` | ✅ PASA | [📸](./capturas/12-password-incorrecto-401.png) |
| 10 | Usuario inexistente (login) | — | `401 "Credenciales inválidas"` | `401 "Credenciales inválidas"` | ✅ PASA | [📸](./capturas/13-usuario-inexistente-401.png) |
| 11 | PASETO manipulado (pos 123: l por A) | — | `401 "Token inválido o expirado"` | `401 "Token inválido o expirado"` | ✅ PASA | [📸](./capturas/14-token-manipulado-401.png) |
| 12 | Usuario inexistente por ID (99) | Administrador | `404 "Usuario no encontrado"` | `404 "Usuario no encontrado"` | ✅ PASA | [📸](./capturas/05-usuario-99-404.png) |
| 13 | Swagger disponible (/api-docs) | — | `200` | `200` | ✅ PASA | [📸](./capturas/00-swagger-home.png) |

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

### 3. Perfil sin PASETO — —

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

![Prueba 3](./capturas/06-perfil-sin-token-401.png)

### 4. Listar usuarios — Administrador

**Esperado:** `200 + ningún usuario trae password`
**Obtenido:** `200 + 0 passwords expuestos`
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

![Prueba 4](./capturas/04-usuarios-admin-200.png)

### 5. Consultar usuario por ID — Médico

**Esperado:** `200 + sin password`
**Obtenido:** `200 + sin password`
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

![Prueba 5](./capturas/08-usuario-id-medico-200.png)

### 6. Listar usuarios — Médico

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

![Prueba 6](./capturas/09-usuarios-medico-403.png)

### 7. Perfil — Paciente

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

![Prueba 7](./capturas/10-perfil-paciente-200.png)

### 8. Listar usuarios — Paciente

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

![Prueba 8](./capturas/11-usuarios-paciente-403.png)

### 9. Password incorrecto — —

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

![Prueba 9](./capturas/12-password-incorrecto-401.png)

### 10. Usuario inexistente (login) — —

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

![Prueba 10](./capturas/13-usuario-inexistente-401.png)

### 11. PASETO manipulado (pos 123: l por A) — —

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

![Prueba 11](./capturas/14-token-manipulado-401.png)

### 12. Usuario inexistente por ID (99) — Administrador

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

![Prueba 12](./capturas/05-usuario-99-404.png)

### 13. Swagger disponible (/api-docs) — —

**Esperado:** `200`
**Obtenido:** `200`
**Resultado:** ✅ PASA

Respuesta del servidor:

```json
"\n<!-- HTML for static distribution bundle build -->\n<!DOCTYP..."
```

Evidencia en Swagger UI:

![Prueba 13](./capturas/00-swagger-home.png)

