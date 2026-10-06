# Análisis de dependencias (SCA) — LAB PASETO V2

**Proyecto:** `lab-paseto-v2`
**Herramienta utilizada:** `npm audit` (Node.js v24.15.0 / npm 11.12.1)
**Fecha del análisis:** 6 de octubre de 2026

**SCA** (*Software Composition Analysis*) es el análisis de los componentes de terceros
que un proyecto incorpora. No examina el código propio, sino las librerías instaladas
y las librerías de las que esas librerías dependen.

---

## 1. Comandos ejecutados

```bash
npm audit               # árbol completo (producción + desarrollo)
npm audit --omit=dev    # solo dependencias de producción
```

Las salidas completas están guardadas como evidencia en:

- `pruebas/npm-audit.txt`
- `pruebas/npm-audit-prod.txt`

---

## 2. Resultado del árbol completo (`npm audit`)

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
| Tipo de vulnerabilidad | Denegación de servicio por agotamiento de pila (*stack exhaustion*) |
| Vector | Patrones con anidamiento muy profundo |

### Cadena de dependencias

Verificada con `npm ls braces`:

```text
lab-paseto-v2@1.0.0
└── nodemon@3.1.14          ← dependencia DIRECTA (devDependency)
    └── chokidar@3.6.0      ← transitiva
        └── braces@3.0.3    ← transitiva (paquete vulnerable)
```

Por tanto:

- `braces` **no fue instalado directamente** por este proyecto.
- Es una **dependencia transitiva** de tercer nivel.
- Llega al árbol a través de `nodemon`, que sí es una dependencia directa.
- Las 3 vulnerabilidades reportadas corresponden a los 3 eslabones de esta
  única cadena (`braces`, `chokidar` y `nodemon` quedan marcados por arrastre).

---

## 3. Resultado de producción (`npm audit --omit=dev`)

```text
found 0 vulnerabilities
```

Este resultado es el dato clave del análisis. En `package.json`, `nodemon` está declarado
como herramienta de desarrollo:

```json
"devDependencies": {
  "nodemon": "^3.1.14"
}
```

Al excluir las dependencias de desarrollo, la cadena `nodemon → chokidar → braces`
desaparece del árbol y **no queda ningún hallazgo**.

Las dependencias que sí llegan a producción (`express`, `paseto`, `dotenv`,
`swagger-jsdoc`, `swagger-ui-express`) están limpias.

---

## 4. Tabla resumen del análisis

| Análisis | Resultado | Interpretación |
|---|---|---|
| `npm audit` | **3 HIGH** | Hallazgos en el árbol completo |
| Paquete afectado | `braces@3.0.3` | Dependencia **transitiva** |
| Cadena | `nodemon → chokidar → braces` | Origen identificado |
| Dependencia directa afectada | `nodemon@3.1.14` | Herramienta de **desarrollo** |
| Clasificación | Transitiva / desarrollo | No llega al entorno de producción |
| `npm audit --omit=dev` | **0 vulnerabilities** | Sin hallazgos en dependencias de producción |
| `npm audit fix --force` | **No aplicado** | Propone un cambio incompatible (ver sección 6) |
| Tratamiento adoptado | Analizar, documentar y monitorear | No aplicar correcciones forzadas sin evaluación |

---

## 5. Análisis de exposición

Para valorar el riesgo real no basta con la severidad declarada; hay que preguntarse
si el código vulnerable llega a ejecutarse en un escenario de ataque.

| Pregunta | Respuesta |
|---|---|
| ¿El paquete se ejecuta en producción? | **No.** `nodemon` solo se usa con `npm run dev`. En producción se arranca con `npm start`, que invoca `node` directamente. |
| ¿Procesa entradas de usuarios externos? | **No.** `braces` interpreta patrones de nombres de archivo para que `chokidar` vigile el disco local. |
| ¿Quién controla esa entrada? | El desarrollador, en su propia máquina. Un atacante remoto no puede influir en ella. |
| ¿Cuál sería el impacto máximo? | Que el proceso de `nodemon` del desarrollador se bloquee en su equipo local. |

**Conclusión del análisis de exposición:** severidad declarada **HIGH**, pero riesgo
real **BAJO** en el contexto de este proyecto. La severidad de un aviso es una medida
genérica del peor caso posible; el riesgo depende del contexto en que se usa el paquete.

Esto ilustra el principio central del SCA:

```text
SEVERIDAD  ≠  RIESGO

severidad → qué tan grave puede llegar a ser la falla
riesgo    → qué tan expuesto estoy yo realmente a ella
```

---

## 6. ¿Por qué NO se ejecutó `npm audit fix --force`?

El propio reporte ofrece la corrección, pero también advierte su consecuencia:

```text
fix available via `npm audit fix --force`
Will install nodemon@1.14.10, which is a breaking change
```

El comando **degradaría** `nodemon` de la versión `3.1.14` a la `1.14.10`: un retroceso
de dos versiones mayores, publicada años antes. Eso implicaría:

- Romper el script `npm run dev` del laboratorio.
- Sustituir un paquete actualizado y mantenido por uno antiguo, que muy probablemente
  arrastra **otras** vulnerabilidades no reportadas por este aviso.
- Cambiar el entorno de desarrollo para mitigar un riesgo que, como se analizó arriba,
  no afecta a producción.

El remedio sería peor que el problema. Un hallazgo de seguridad no se trata ejecutando
un comando de corrección automática, sino siguiendo un proceso:

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

## 7. Tratamiento adoptado

**Decisión: aceptar el riesgo y monitorear.**

Justificación:

1. El hallazgo está confinado a dependencias de desarrollo (`npm audit --omit=dev`
   devuelve 0 vulnerabilidades).
2. El vector de ataque no es alcanzable desde la red: `braces` procesa patrones de
   archivos locales definidos por el desarrollador.
3. La corrección automática disponible degradaría una herramienta a una versión obsoleta.
4. La solución correcta depende de un tercero: `chokidar` debe publicar una versión que
   use un `braces` corregido, y `nodemon` adoptarla.

Acciones de seguimiento recomendadas:

- Repetir `npm audit` antes de cada entrega o despliegue.
- Mantener `nodemon` actualizado dentro de su versión mayor (`npm update nodemon`).
- Verificar siempre con `npm audit --omit=dev` antes de desplegar, que es el análisis
  que refleja el riesgo real del artefacto que se publica.
- No instalar dependencias de desarrollo en el servidor de producción
  (`npm ci --omit=dev`).

---

## 8. Conclusión

El análisis SCA de `lab-paseto-v2` detectó **3 vulnerabilidades de severidad alta**
en el árbol completo, todas originadas en una única cadena transitiva de desarrollo
(`nodemon → chokidar → braces`), y **0 vulnerabilidades** en el árbol de producción.

El ejercicio demuestra que un reporte de `npm audit` es el **punto de partida** de un
análisis, no su conclusión: el mismo hallazgo significa cosas muy distintas según sea
directo o transitivo, y según llegue o no al entorno de producción.
