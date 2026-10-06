# Análisis de dependencias (SCA) — LAB PASETO V3

**Proyecto:** `lab-paseto-v3`
**Herramienta utilizada:** `npm audit` (Node.js v24.15.0 / npm 11.12.1)
**Fecha del análisis:** 6 de octubre de 2026

**SCA** (*Software Composition Analysis*) es el análisis de los componentes de terceros
que incorpora un proyecto. No revisa el código propio, sino las librerías instaladas
y las librerías de las que esas librerías dependen.

---

## 1. Comandos ejecutados

```bash
npm audit               # árbol completo (producción + desarrollo)
npm audit --omit=dev    # solo dependencias de producción
```

Salidas completas guardadas como evidencia en:

- `pruebas/npm-audit.txt`
- `pruebas/npm-audit-prod.txt`

---

## 2. Resultado del árbol completo

```text
braces  *
Severity: high
braces vulnerable to stack-exhaustion denial of service through deeply nested patterns
https://github.com/advisories/GHSA-vfj7-8cjw-p6xm

fix available via `npm audit fix --force`
Will install nodemon@1.14.10, which is a breaking change

3 high severity vulnerabilities
```

### Hallazgo identificado

| Dato | Valor |
|---|---|
| Paquete afectado | `braces` |
| Versión instalada | `3.0.3` |
| Severidad | **HIGH** (alta) |
| Identificador | `GHSA-vfj7-8cjw-p6xm` |
| Tipo | Denegación de servicio por agotamiento de pila (*stack exhaustion*) |
| Vector | Patrones con anidamiento muy profundo |

### Cadena de dependencias

Verificada con `npm ls braces`:

```text
lab-paseto-v3@1.0.0
└── nodemon@3.1.14          ← dependencia DIRECTA (devDependency)
    └── chokidar@3.6.0      ← transitiva
        └── braces@3.0.3    ← transitiva (paquete vulnerable)
```

Por tanto:

- `braces` **no fue instalado directamente** por este proyecto.
- Es una **dependencia transitiva** de tercer nivel.
- Entra al árbol a través de `nodemon`, que sí es dependencia directa.
- Las 3 vulnerabilidades reportadas corresponden a los 3 eslabones de esta
  única cadena: `braces` es la vulnerable, y `chokidar` y `nodemon` quedan
  marcados por arrastre.

---

## 3. Resultado de producción

```text
found 0 vulnerabilities
```

Este es el dato decisivo. En `package.json`, `nodemon` está declarado como
herramienta de desarrollo:

```json
"devDependencies": {
  "nodemon": "^3.1.14"
}
```

Al excluir las dependencias de desarrollo, la cadena `nodemon → chokidar → braces`
desaparece del árbol y no queda ningún hallazgo.

Las seis dependencias que sí llegan a producción están limpias:

| Paquete | Versión | Resultado |
|---|---|---|
| `express` | 5.2.1 | Sin hallazgos |
| `paseto` | 4.0.1 | Sin hallazgos |
| `dotenv` | 18.0.5 | Sin hallazgos |
| `swagger-jsdoc` | 6.3.0 | Sin hallazgos |
| `swagger-ui-express` | 5.0.1 | Sin hallazgos |
| `express-validator` | 7.3.2 | Sin hallazgos |

---

## 4. Tabla de evidencia

| Análisis | Resultado | Interpretación |
|---|---|---|
| `npm audit` | **3 HIGH** | Hallazgos en el árbol completo |
| Paquete afectado | `braces@3.0.3` | Dependencia **transitiva** de 3er nivel |
| Cadena | `nodemon → chokidar → braces` | Origen identificado |
| Dependencia directa responsable | `nodemon@3.1.14` | Herramienta de **desarrollo** |
| Clasificación | Transitiva / desarrollo | No alcanza el entorno de producción |
| `npm audit --omit=dev` | **0 vulnerabilities** | Sin hallazgos en dependencias de producción |
| `express-validator` (nuevo en V3) | Sin hallazgos | La dependencia añadida no agregó riesgo |
| `npm audit fix --force` | **No aplicado** | Propone un cambio incompatible (sección 6) |
| Tratamiento adoptado | Analizar, documentar y monitorear | No aplicar correcciones forzadas sin evaluación |

---

## 5. Comparación con la V2

La V3 añadió una dependencia de producción (`express-validator@7.3.2`) respecto
a la V2. El análisis permite comprobar si esa incorporación cambió el perfil de riesgo:

| Análisis | V2 | V3 | ¿Cambió? |
|---|---|---|---|
| Dependencias de producción | 5 | **6** (+ `express-validator`) | Sí |
| `npm audit` (árbol completo) | 3 HIGH | 3 HIGH | No |
| Paquete afectado | `braces@3.0.3` | `braces@3.0.3` | No |
| Cadena | `nodemon → chokidar → braces` | igual | No |
| `npm audit --omit=dev` | 0 vulnerabilities | 0 vulnerabilities | No |

**Conclusión de la comparación:** agregar `express-validator` **no introdujo
vulnerabilidades conocidas**. El único hallazgo sigue siendo el mismo de la V2 y
tiene el mismo origen de desarrollo. Esto ilustra un punto importante del SCA:
cada dependencia nueva amplía la superficie de ataque y debe analizarse al
incorporarla, no solo al final del proyecto.

---

## 6. Análisis de exposición

La severidad declarada no equivale al riesgo real: hay que preguntarse si el
código vulnerable llega a ejecutarse en un escenario de ataque.

| Pregunta | Respuesta |
|---|---|
| ¿El paquete se ejecuta en producción? | **No.** `nodemon` solo actúa con `npm run dev`. En producción se usa `npm start`, que llama a `node` directamente. |
| ¿Procesa entradas de usuarios externos? | **No.** `braces` interpreta patrones de nombres de archivo para que `chokidar` vigile el disco local. |
| ¿Quién controla esa entrada? | El desarrollador, en su propia máquina. Un atacante remoto no puede influir en ella. |
| ¿Impacto máximo? | Que el proceso de `nodemon` del desarrollador se bloquee localmente. |

**Conclusión:** severidad **HIGH**, riesgo real **BAJO** en el contexto de este proyecto.

```text
SEVERIDAD  ≠  RIESGO

severidad → qué tan grave puede ser la falla en el peor caso
riesgo    → qué tan expuesto estoy yo realmente a ella
```

Es pertinente señalar que esta misma ejecución de pruebas verificó las **otras**
capas de seguridad de la API, que sí dependen de nuestro código y no de terceros:
autenticación con PASETO (401), autorización por roles (403) y validación de
entradas con `express-validator` (400). El SCA cubre una dimensión distinta —
el riesgo heredado de las librerías — y por eso es complementario, no sustituto.

---

## 7. ¿Por qué NO se ejecutó `npm audit fix --force`?

El reporte ofrece la corrección, pero también advierte su consecuencia:

```text
fix available via `npm audit fix --force`
Will install nodemon@1.14.10, which is a breaking change
```

El comando **degradaría** `nodemon` de `3.1.14` a `1.14.10`: un retroceso de dos
versiones mayores, publicada años antes. Eso implicaría:

- Romper el script `npm run dev` del laboratorio.
- Cambiar un paquete actualizado y mantenido por uno antiguo, que muy
  probablemente arrastra **otras** vulnerabilidades no cubiertas por este aviso.
- Alterar el entorno de desarrollo para mitigar un riesgo que no afecta a producción.

El remedio sería peor que el problema. Un hallazgo de seguridad no se trata
ejecutando un comando de corrección forzada, sino siguiendo un proceso:

```text
HALLAZGO
   ↓
IDENTIFICAR PAQUETE            → braces@3.0.3
   ↓
IDENTIFICAR DEPENDENCIA        → nodemon → chokidar → braces
   ↓
DIRECTA / TRANSITIVA           → transitiva (3er nivel)
   ↓
DESARROLLO / PRODUCCIÓN        → desarrollo
   ↓
ANALIZAR EXPOSICIÓN            → no se ejecuta en producción, entrada local
   ↓
EVALUAR ACTUALIZACIÓN          → el "fix" degrada nodemon: inaceptable
   ↓
APLICAR TRATAMIENTO            → aceptar y monitorear
   ↓
VERIFICAR NUEVAMENTE           → repetir npm audit periódicamente
```

---

## 8. Tratamiento adoptado

**Decisión: aceptar el riesgo y monitorear.**

Justificación:

1. El hallazgo está confinado a dependencias de desarrollo
   (`npm audit --omit=dev` devuelve 0 vulnerabilidades).
2. El vector de ataque no es alcanzable desde la red: `braces` procesa patrones
   de archivos locales definidos por el desarrollador.
3. La corrección automática disponible degradaría una herramienta a una versión obsoleta.
4. La solución correcta depende de terceros: `chokidar` debe publicar una versión
   que use un `braces` corregido, y `nodemon` adoptarla.

Acciones de seguimiento:

- Repetir `npm audit` antes de cada entrega o despliegue.
- Mantener `nodemon` actualizado dentro de su versión mayor (`npm update nodemon`).
- Verificar siempre con `npm audit --omit=dev` antes de desplegar: es el análisis
  que refleja el riesgo real del artefacto publicado.
- No instalar dependencias de desarrollo en el servidor de producción
  (`npm ci --omit=dev`).
- Analizar cada dependencia nueva al incorporarla, como se hizo aquí con
  `express-validator`.

---

## 9. Conclusión

El análisis SCA de `lab-paseto-v3` detectó **3 vulnerabilidades de severidad alta**
en el árbol completo, todas originadas en una única cadena transitiva de desarrollo
(`nodemon → chokidar → braces`), y **0 vulnerabilidades** en el árbol de producción.

Respecto a la V2 no hubo cambios en el perfil de riesgo pese a incorporar una
dependencia de producción nueva.

El ejercicio confirma que un reporte de `npm audit` es el **punto de partida** de un
análisis, no su conclusión: el mismo hallazgo significa cosas muy distintas según
sea directo o transitivo, y según llegue o no al entorno de producción.
