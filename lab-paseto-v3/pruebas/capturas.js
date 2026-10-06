// ============================================================
// LAB PASETO V3 - Capturas automáticas de las pruebas del README
// Maneja Swagger UI con Chrome headless (DevTools Protocol).
//
// IMPORTANTE: los datos viven en memoria. Arranca el servidor
// recién (npm start) antes de ejecutar este guion, porque las
// capturas crean, modifican y eliminan un usuario.
//
// Uso:  node pruebas/capturas.js    (o npm run test:capturas)
// ============================================================

import { Chrome, esperar } from "./cdp.js";
import { mkdirSync, writeFileSync } from "node:fs";

const DIR = new URL("./capturas/", import.meta.url);
mkdirSync(DIR, { recursive: true });

const BASE = "http://localhost:3000";
const registro = [];

const c = new Chrome();
await c.abrir({ ancho: 1440, alto: 1100 });

// ------------------------------------------------------------
// Helpers inyectados en la página
// ------------------------------------------------------------
const instalarHelpers = async () => {
  await c.js(`
    window.__h = {
      op(metodo, ruta) {
        return [...document.querySelectorAll('.opblock')].find(o =>
          o.querySelector('.opblock-summary-method').textContent.trim() === metodo &&
          o.querySelector('.opblock-summary-path').textContent.trim() === ruta
        );
      },
      colapsarTodo() {
        document.querySelectorAll('.opblock.is-open .opblock-summary-control')
          .forEach(b => b.click());
      },
      abrir(metodo, ruta) {
        const op = this.op(metodo, ruta);
        if (!op.classList.contains('is-open')) {
          op.querySelector('.opblock-summary-control').click();
        }
        return true;
      },
      escribir(el, valor) {
        const proto = el.tagName === 'TEXTAREA'
          ? HTMLTextAreaElement.prototype
          : HTMLInputElement.prototype;
        Object.getOwnPropertyDescriptor(proto, 'value').set.call(el, valor);
        el.dispatchEvent(new Event('input',  { bubbles: true }));
        el.dispatchEvent(new Event('change', { bubbles: true }));
      },
      respuesta(metodo, ruta) {
        const op = this.op(metodo, ruta);
        const fila = op.querySelector('.live-responses-table .response');
        if (!fila) return null;
        const estado = fila.querySelector('.response-col_status');
        const cuerpo = fila.querySelector('.response-col_description pre code, .microlight');
        return {
          status: estado ? estado.childNodes[0].textContent.trim() : null,
          body: cuerpo ? cuerpo.textContent.trim().slice(0, 400) : null
        };
      }
    };
    return 'ok';
  `);
};

const esperarRespuesta = async (metodo, ruta, maxMs = 20000) => {
  const inicio = Date.now();
  while (Date.now() - inicio < maxMs) {
    const r = await c.js(
      `return JSON.stringify(window.__h.respuesta(${JSON.stringify(metodo)}, ${JSON.stringify(ruta)}));`
    );
    const dato = JSON.parse(r);
    if (dato?.status) return dato;
    await esperar(400);
  }
  throw new Error(`Sin respuesta para ${metodo} ${ruta}`);
};

// Ejecuta "Try it out" + "Execute" sobre un endpoint
const ejecutar = async (metodo, ruta, { body, param } = {}) => {
  const M = JSON.stringify(metodo);
  const R = JSON.stringify(ruta);

  await c.js(`window.__h.colapsarTodo(); return 1;`);
  await esperar(500);
  await c.js(`window.__h.abrir(${M}, ${R}); return 1;`);
  await esperar(900);

  // Borra la respuesta de una ejecución anterior para no leerla por error
  await c.js(`
    const op = window.__h.op(${M}, ${R});
    const limpiar = op.querySelector('button.btn-clear');
    if (limpiar) limpiar.click();
    return 1;
  `);
  await esperar(600);

  await c.js(`
    const op = window.__h.op(${M}, ${R});
    const btn = op.querySelector('.try-out__btn');
    if (btn && !btn.classList.contains('cancel')) btn.click();
    return 1;
  `);
  await esperar(800);

  if (param !== undefined) {
    await c.js(`
      const op = window.__h.op(${M}, ${R});
      window.__h.escribir(op.querySelector('.parameters input'), ${JSON.stringify(String(param))});
      return 1;
    `);
    await esperar(500);
  }

  if (body !== undefined) {
    await c.js(`
      const op = window.__h.op(${M}, ${R});
      window.__h.escribir(op.querySelector('textarea'), ${JSON.stringify(body)});
      return 1;
    `);
    await esperar(500);
  }

  const previa = JSON.parse(
    await c.js(`return JSON.stringify(window.__h.respuesta(${M}, ${R}));`)
  );
  if (previa?.status) {
    throw new Error(`No se limpió la respuesta anterior de ${metodo} ${ruta}`);
  }

  await c.js(`
    const op = window.__h.op(${M}, ${R});
    op.querySelector('button.execute').click();
    return 1;
  `);

  return esperarRespuesta(metodo, ruta);
};

// --- Authorize / Logout de Swagger ---
const autorizar = async (token) => {
  await c.js(`document.querySelector('.auth-wrapper .btn.authorize').click(); return 1;`);
  await esperar(900);
  await c.js(`
    const d = document.querySelector('.dialog-ux');
    window.__h.escribir(d.querySelector('input[type=text]'), ${JSON.stringify(token)});
    return 1;
  `);
  await esperar(500);
};

const confirmarAutorizacion = async () => {
  await c.js(`document.querySelector('.dialog-ux button.authorize').click(); return 1;`);
  await esperar(900);
};

const cerrarModal = async () => {
  await c.js(`
    const b = document.querySelector('.dialog-ux button.btn-done');
    if (b) b.click();
    return 1;
  `);
  await esperar(700);
};

const cerrarSesionSwagger = async () => {
  await c.js(`document.querySelector('.auth-wrapper .btn.authorize').click(); return 1;`);
  await esperar(900);
  await c.js(`
    const b = [...document.querySelectorAll('.dialog-ux button')]
      .find(x => x.textContent.trim() === 'Logout');
    if (b) b.click();
    return 1;
  `);
  await esperar(700);
  await cerrarModal();
};

const entrarComo = async (token) => {
  await cerrarSesionSwagger();
  await autorizar(token);
  await confirmarAutorizacion();
  await cerrarModal();
};

// --- Captura + registro ---
const capturar = async (archivo, titulo, esperado, obtenido) => {
  await c.captura(new URL(archivo, DIR));
  const ok = String(obtenido.status) === String(esperado);
  registro.push({ archivo, titulo, esperado, obtenido, ok });
  console.log(
    `${ok ? "✅" : "❌"} ${archivo.padEnd(36)} ${String(obtenido.status).padEnd(5)} ${titulo}`
  );
};

const anotar = async (archivo, titulo, nota) => {
  await c.captura(new URL(archivo, DIR));
  registro.push({
    archivo,
    titulo,
    esperado: "—",
    obtenido: { status: nota, body: null },
    ok: true,
  });
  console.log(`📸 ${archivo.padEnd(36)} ${nota.padEnd(5)} ${titulo}`);
};

const obtenerToken = async (email, password = "123456") => {
  const r = await fetch(`${BASE}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  return (await r.json()).token;
};

// ------------------------------------------------------------
// Secuencia
// ------------------------------------------------------------

console.log("\n=== Generando capturas de LAB PASETO V3 ===\n");

await c.ir(`${BASE}/api-docs/`, { espera: 4500 });
await instalarHelpers();

// --- 00. Swagger con los 8 endpoints ---
await anotar("00-swagger-home.png", "Swagger UI — 8 endpoints documentados", "8 ops");

// --- 01. Login administrador ---
let r = await ejecutar("POST", "/api/auth/login", {
  body: JSON.stringify({ email: "admin@hospital.com", password: "123456" }, null, 2),
});
await capturar("01-login-admin-200.png", "Prueba 1 — Login correcto (Administrador)", 200, r);

// --- 02. Authorize ---
const tokenAdmin = await obtenerToken("admin@hospital.com");
await c.js(`window.__h.colapsarTodo(); return 1;`);
await esperar(400);
await autorizar(tokenAdmin);
await anotar("02-authorize-admin.png", "Authorize 🔒 — PASETO del administrador", "token");
await confirmarAutorizacion();
await cerrarModal();

// --- 03. Perfil ---
r = await ejecutar("GET", "/api/auth/perfil");
await capturar("03-perfil-admin-200.png", "Prueba 2 — Perfil con PASETO (Administrador)", 200, r);

// --- 04. Listar usuarios ---
r = await ejecutar("GET", "/api/usuarios");
await capturar("04-listar-usuarios-200.png", "Prueba 3 — Listar usuarios, sin passwords", 200, r);

// --- 05. POST crear Ana (201) ---
r = await ejecutar("POST", "/api/usuarios", {
  body: JSON.stringify(
    {
      nombre: "Ana Torres",
      email: "ana@hospital.com",
      password: "123456",
      rol: "paciente",
      activo: true,
    },
    null,
    2
  ),
});
await capturar("05-crear-usuario-201.png", "Prueba 4 — Crear usuario (201 Created)", 201, r);

// Id real del usuario creado (nunca fijo)
const idAna = JSON.parse(
  await (await fetch(`${BASE}/api/usuarios`, {
    headers: { Authorization: `Bearer ${tokenAdmin}` },
  })).text()
).find((u) => u.email === "ana@hospital.com").id;

console.log(`   (id de Ana Torres: ${idAna})`);

// --- 06. GET por id ---
r = await ejecutar("GET", "/api/usuarios/{id}", { param: idAna });
await capturar("06-obtener-usuario-200.png", `Prueba 5 — Consultar el usuario creado (id ${idAna})`, 200, r);

// --- 07. PUT completo (200) ---
r = await ejecutar("PUT", "/api/usuarios/{id}", {
  param: idAna,
  body: JSON.stringify(
    {
      nombre: "Ana Torres Actualizada",
      email: "ana@hospital.com",
      password: "654321",
      rol: "medico",
      activo: true,
    },
    null,
    2
  ),
});
await capturar("07-put-completo-200.png", "Prueba 6 — PUT completo (reemplazo total)", 200, r);

// --- 08. PUT incompleto (400) ---
r = await ejecutar("PUT", "/api/usuarios/{id}", {
  param: idAna,
  body: JSON.stringify({ nombre: "Solo el nombre" }, null, 2),
});
await capturar("08-put-incompleto-400.png", "Prueba 7 — PUT incompleto → Datos inválidos", 400, r);

// --- 09. PATCH parcial (200) ---
r = await ejecutar("PATCH", "/api/usuarios/{id}", {
  param: idAna,
  body: JSON.stringify({ activo: false }, null, 2),
});
await capturar("09-patch-parcial-200.png", "Prueba 8 — PATCH parcial (activo = false)", 200, r);

// --- 10. Login de Ana, deshabilitada (403) ---
r = await ejecutar("POST", "/api/auth/login", {
  body: JSON.stringify({ email: "ana@hospital.com", password: "654321" }, null, 2),
});
await capturar("10-login-deshabilitado-403.png", "Prueba 24 — Login de un usuario deshabilitado", 403, r);

// --- 11. PATCH vacío (400) ---
r = await ejecutar("PATCH", "/api/usuarios/{id}", {
  param: idAna,
  body: "{}",
});
await capturar("11-patch-vacio-400.png", "Prueba 9 — PATCH con body vacío", 400, r);

// --- 12. POST email inválido (400) ---
r = await ejecutar("POST", "/api/usuarios", {
  body: JSON.stringify(
    {
      nombre: "Email Malo",
      email: "esto-no-es-un-email",
      password: "123456",
      rol: "paciente",
      activo: true,
    },
    null,
    2
  ),
});
await capturar("12-email-invalido-400.png", "Prueba 10 — POST con email inválido", 400, r);

// --- 13. POST rol no permitido (400) ---
r = await ejecutar("POST", "/api/usuarios", {
  body: JSON.stringify(
    {
      nombre: "Rol Invalido",
      email: "rolinvalido@hospital.com",
      password: "123456",
      rol: "superadministrador",
      activo: true,
    },
    null,
    2
  ),
});
await capturar("13-rol-invalido-400.png", "Prueba 11 — POST con rol 'superadministrador'", 400, r);

// --- 14. POST email duplicado (409) ---
r = await ejecutar("POST", "/api/usuarios", {
  body: JSON.stringify(
    {
      nombre: "Duplicado Hospital",
      email: "admin@hospital.com",
      password: "123456",
      rol: "paciente",
      activo: true,
    },
    null,
    2
  ),
});
await capturar("14-email-duplicado-409.png", "Prueba 12 — POST con email ya registrado (409)", 409, r);

// --- 15. GET id inexistente (404) ---
r = await ejecutar("GET", "/api/usuarios/{id}", { param: 999 });
await capturar("15-usuario-999-404.png", "Prueba 13 — GET /api/usuarios/999", 404, r);

// --- 16. DELETE (204) ---
r = await ejecutar("DELETE", "/api/usuarios/{id}", { param: idAna });
await capturar("16-delete-204.png", `Prueba 14 — DELETE del usuario creado (id ${idAna})`, 204, r);

// --- 17. GET tras el DELETE (404) ---
r = await ejecutar("GET", "/api/usuarios/{id}", { param: idAna });
await capturar("17-get-tras-delete-404.png", "Prueba 15 — GET del usuario eliminado", 404, r);

// --- 18. Sin token (401) ---
await cerrarSesionSwagger();
r = await ejecutar("GET", "/api/usuarios");
await capturar("18-sin-token-401.png", "Prueba 16 — GET /api/usuarios sin token", 401, r);

// --- 19. Token manipulado (401) ---
const cuerpoToken = tokenAdmin.slice("v4.public.".length);
const medio = Math.floor(cuerpoToken.length / 2);
const sustituto = cuerpoToken[medio] === "A" ? "B" : "A";
const tokenManipulado =
  "v4.public." + cuerpoToken.slice(0, medio) + sustituto + cuerpoToken.slice(medio + 1);

await entrarComo(tokenManipulado);
r = await ejecutar("GET", "/api/auth/perfil");
await capturar("19-token-manipulado-401.png", "Prueba 17 — PASETO manipulado", 401, r);

// --- 20. Médico: GET por id (200) ---
const tokenMedico = await obtenerToken("laura@hospital.com");
await entrarComo(tokenMedico);
r = await ejecutar("GET", "/api/usuarios/{id}", { param: 1 });
await capturar("20-medico-obtener-200.png", "Prueba 18 — GET /api/usuarios/1 (Médico)", 200, r);

// --- 21. Médico: listar (403) ---
r = await ejecutar("GET", "/api/usuarios");
await capturar("21-medico-listar-403.png", "Prueba 19 — Listar usuarios (Médico) → prohibido", 403, r);

// --- 22. Médico: POST con body válido (403) ---
r = await ejecutar("POST", "/api/usuarios", {
  body: JSON.stringify(
    {
      nombre: "Usuario Del Medico",
      email: "nuevo@hospital.com",
      password: "123456",
      rol: "paciente",
      activo: true,
    },
    null,
    2
  ),
});
await capturar("22-medico-crear-403.png", "Prueba 20 — POST con body VÁLIDO (Médico) → 403, no 400", 403, r);

// --- 23. Paciente: perfil (200) ---
const tokenPaciente = await obtenerToken("carlos@hospital.com");
await entrarComo(tokenPaciente);
r = await ejecutar("GET", "/api/auth/perfil");
await capturar("23-paciente-perfil-200.png", "Prueba 21 — Perfil propio (Paciente)", 200, r);

// --- 24. Paciente: listar (403) ---
r = await ejecutar("GET", "/api/usuarios");
await capturar("24-paciente-listar-403.png", "Prueba 21b — Listar usuarios (Paciente) → prohibido", 403, r);

// --- 25. Paciente: por id (403) ---
r = await ejecutar("GET", "/api/usuarios/{id}", { param: 1 });
await capturar("25-paciente-obtener-403.png", "Prueba 21c — GET /api/usuarios/1 (Paciente) → prohibido", 403, r);

// --- 26. Password incorrecto (401) ---
r = await ejecutar("POST", "/api/auth/login", {
  body: JSON.stringify({ email: "admin@hospital.com", password: "incorrecta" }, null, 2),
});
await capturar("26-password-incorrecto-401.png", "Prueba 22 — Login con password incorrecto", 401, r);

// --- 27. Email inexistente (401) ---
r = await ejecutar("POST", "/api/auth/login", {
  body: JSON.stringify({ email: "noexiste@hospital.com", password: "123456" }, null, 2),
});
await capturar("27-email-inexistente-401.png", "Prueba 23 — Login con email inexistente", 401, r);

// ------------------------------------------------------------
// Índice
// ------------------------------------------------------------

const fecha = new Date().toLocaleString("es-CO", {
  dateStyle: "full",
  timeStyle: "medium",
});

let md = `# Capturas de las pruebas — LAB PASETO V3\n\n`;
md += `**Fecha de captura:** ${fecha}\n\n`;
md += `**Entorno:** Swagger UI en ${BASE}/api-docs — Chrome headless\n\n`;
md += `Cada captura se tomó ejecutando realmente el endpoint desde Swagger UI,\n`;
md += `por eso muestra el \`curl\` generado, la Request URL, el código HTTP,\n`;
md += `el cuerpo de la respuesta y las cabeceras.\n\n`;
md += `---\n\n| # | Captura | Prueba | Esperado | Obtenido |\n|---:|---|---|---|---|\n`;

registro.forEach((x, i) => {
  md += `| ${i} | [\`${x.archivo}\`](./${x.archivo}) | ${x.titulo} | \`${x.esperado}\` | \`${x.obtenido.status}\` |\n`;
});

md += `\n---\n\n## Vista de cada captura\n\n`;
registro.forEach((x) => {
  md += `### ${x.titulo}\n\n**Resultado:** \`${x.obtenido.status}\`\n\n`;
  if (x.obtenido.body) md += `\`\`\`json\n${x.obtenido.body}\n\`\`\`\n\n`;
  md += `![${x.titulo}](./${x.archivo})\n\n`;
});

writeFileSync(new URL("./INDICE.md", DIR), md, "utf8");

const ok = registro.filter((x) => x.ok).length;
console.log(`\n=== ${ok}/${registro.length} capturas con el resultado esperado ===`);
console.log(`Guardadas en: pruebas/capturas/`);
console.log(`Índice: pruebas/capturas/INDICE.md\n`);

await c.cerrar();
process.exit(ok === registro.length ? 0 : 1);
