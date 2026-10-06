// ============================================================
// LAB PASETO V2 - Capturas automáticas de las pruebas del README
// Maneja Swagger UI con Chrome headless (DevTools Protocol).
// Uso:  node pruebas/capturas.js
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
// Helpers que se inyectan una sola vez en la página
// ------------------------------------------------------------
const instalarHelpers = async () => {
  await c.js(`
    window.__h = {
      // Localiza un opblock por su método y ruta
      op(metodo, ruta) {
        return [...document.querySelectorAll('.opblock')].find(o =>
          o.querySelector('.opblock-summary-method').textContent.trim() === metodo &&
          o.querySelector('.opblock-summary-path').textContent.trim() === ruta
        );
      },
      // Cierra todos los endpoints desplegados
      colapsarTodo() {
        document.querySelectorAll('.opblock.is-open .opblock-summary-control')
          .forEach(b => b.click());
      },
      // Despliega un endpoint
      abrir(metodo, ruta) {
        const op = this.op(metodo, ruta);
        if (!op.classList.contains('is-open')) {
          op.querySelector('.opblock-summary-control').click();
        }
        return true;
      },
      // Escribe en un input/textarea controlado por React
      escribir(el, valor) {
        const proto = el.tagName === 'TEXTAREA'
          ? HTMLTextAreaElement.prototype
          : HTMLInputElement.prototype;
        Object.getOwnPropertyDescriptor(proto, 'value').set.call(el, valor);
        el.dispatchEvent(new Event('input',  { bubbles: true }));
        el.dispatchEvent(new Event('change', { bubbles: true }));
      },
      // Lee el estado y el cuerpo de la respuesta mostrada
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
    return 'helpers instalados';
  `);
};

// Espera a que aparezca la respuesta del servidor
const esperarRespuesta = async (metodo, ruta, maxMs = 20000) => {
  const inicio = Date.now();
  while (Date.now() - inicio < maxMs) {
    const r = await c.js(
      `return JSON.stringify(window.__h.respuesta(${JSON.stringify(metodo)}, ${JSON.stringify(ruta)}));`
    );
    const dato = JSON.parse(r);
    if (dato && dato.status) return dato;
    await esperar(400);
  }
  throw new Error(`Sin respuesta para ${metodo} ${ruta}`);
};

// Ejecuta el "Try it out" + "Execute" de un endpoint
const ejecutar = async (metodo, ruta, { body, param } = {}) => {
  await c.js(`window.__h.colapsarTodo(); return 1;`);
  await esperar(500);
  await c.js(`window.__h.abrir(${JSON.stringify(metodo)}, ${JSON.stringify(ruta)}); return 1;`);
  await esperar(900);

  // Borra la respuesta de una ejecución anterior para no leerla por error
  await c.js(`
    const op = window.__h.op(${JSON.stringify(metodo)}, ${JSON.stringify(ruta)});
    const limpiar = op.querySelector('button.btn-clear');
    if (limpiar) limpiar.click();
    return 1;
  `);
  await esperar(600);

  // Try it out (si todavía no está activo)
  await c.js(`
    const op = window.__h.op(${JSON.stringify(metodo)}, ${JSON.stringify(ruta)});
    const btn = op.querySelector('.try-out__btn');
    if (btn && !btn.classList.contains('cancel')) btn.click();
    return 1;
  `);
  await esperar(800);

  if (body) {
    await c.js(`
      const op = window.__h.op(${JSON.stringify(metodo)}, ${JSON.stringify(ruta)});
      window.__h.escribir(op.querySelector('textarea'), ${JSON.stringify(body)});
      return 1;
    `);
    await esperar(500);
  }

  if (param !== undefined) {
    await c.js(`
      const op = window.__h.op(${JSON.stringify(metodo)}, ${JSON.stringify(ruta)});
      window.__h.escribir(op.querySelector('.parameters input'), ${JSON.stringify(String(param))});
      return 1;
    `);
    await esperar(500);
  }

  // Verifica que la respuesta anterior quedó borrada antes de ejecutar
  const previa = JSON.parse(
    await c.js(
      `return JSON.stringify(window.__h.respuesta(${JSON.stringify(metodo)}, ${JSON.stringify(ruta)}));`
    )
  );
  if (previa && previa.status) {
    throw new Error(
      `No se limpió la respuesta anterior de ${metodo} ${ruta} (quedó ${previa.status})`
    );
  }

  await c.js(`
    const op = window.__h.op(${JSON.stringify(metodo)}, ${JSON.stringify(ruta)});
    op.querySelector('button.execute').click();
    return 1;
  `);

  return esperarRespuesta(metodo, ruta);
};

// Autoriza Swagger con un token
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

const cerrarModal = async () => {
  await c.js(`
    const b = document.querySelector('.dialog-ux button.btn-done');
    if (b) b.click();
    return 1;
  `);
  await esperar(700);
};

const confirmarAutorizacion = async () => {
  await c.js(`
    document.querySelector('.dialog-ux button.authorize').click(); return 1;
  `);
  await esperar(900);
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

// Guarda la captura y anota el resultado
const capturar = async (archivo, titulo, esperado, obtenido) => {
  const ruta = new URL(archivo, DIR);
  await c.captura(ruta);
  const ok = String(obtenido.status).startsWith(String(esperado));
  registro.push({ archivo, titulo, esperado, obtenido, ok });
  console.log(
    `${ok ? "✅" : "❌"} ${archivo.padEnd(34)} ${String(obtenido.status).padEnd(24)} ${titulo}`
  );
};

// Obtiene un token real llamando a la API
const obtenerToken = async (email) => {
  const r = await fetch(`${BASE}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password: "123456" }),
  });
  return (await r.json()).token;
};

// ------------------------------------------------------------
// Secuencia de capturas
// ------------------------------------------------------------

console.log("\n=== Generando capturas de LAB PASETO V2 ===\n");

await c.ir(`${BASE}/api-docs/`, { espera: 4500 });
await instalarHelpers();

// --- 00. Swagger con los 4 endpoints ---
await c.captura(new URL("00-swagger-home.png", DIR));
console.log("📸 00-swagger-home.png                 Swagger UI con los 4 endpoints");
registro.push({
  archivo: "00-swagger-home.png",
  titulo: "Swagger UI — 4 endpoints documentados",
  esperado: "—",
  obtenido: { status: "4 endpoints", body: null },
  ok: true,
});

// --- 01. Login administrador (200) ---
let r = await ejecutar("POST", "/api/auth/login", {
  body: JSON.stringify({ email: "admin@hospital.com", password: "123456" }, null, 2),
});
await capturar("01-login-admin-200.png", "Prueba 1 — Login correcto (Administrador)", "200", r);

// --- 02. Authorize con el token del administrador ---
const tokenAdmin = await obtenerToken("admin@hospital.com");
await c.js(`window.__h.colapsarTodo(); return 1;`);
await esperar(400);
await autorizar(tokenAdmin);
await c.captura(new URL("02-authorize-admin.png", DIR));
console.log("📸 02-authorize-admin.png              Modal Authorize con el PASETO del admin");
registro.push({
  archivo: "02-authorize-admin.png",
  titulo: "Authorize 🔒 — token del administrador cargado",
  esperado: "—",
  obtenido: { status: "token cargado", body: null },
  ok: true,
});
await confirmarAutorizacion();
await cerrarModal();

// --- 03. Perfil con token (200) ---
r = await ejecutar("GET", "/api/auth/perfil");
await capturar("03-perfil-admin-200.png", "Prueba 2 — Perfil con PASETO (Administrador)", "200", r);

// --- 04. Listar usuarios como administrador (200) ---
r = await ejecutar("GET", "/api/usuarios");
await capturar("04-usuarios-admin-200.png", "Prueba 4 — Listar usuarios (Administrador)", "200", r);

// --- 05. Usuario inexistente por ID (404) ---
r = await ejecutar("GET", "/api/usuarios/{id}", { param: 99 });
await capturar("05-usuario-99-404.png", "Prueba 12 — Usuario inexistente por ID (Administrador)", "404", r);

// --- 06. Perfil sin token (401) ---
await cerrarSesionSwagger();
r = await ejecutar("GET", "/api/auth/perfil");
await capturar("06-perfil-sin-token-401.png", "Prueba 3 — Perfil sin PASETO", "401", r);

// --- 07. Login médico (200) ---
r = await ejecutar("POST", "/api/auth/login", {
  body: JSON.stringify({ email: "laura@hospital.com", password: "123456" }, null, 2),
});
await capturar("07-login-medico-200.png", "Prueba 5a — Login (Médico)", "200", r);

// --- 08. Médico consulta usuario por ID (200) ---
const tokenMedico = await obtenerToken("laura@hospital.com");
await autorizar(tokenMedico);
await confirmarAutorizacion();
await cerrarModal();
r = await ejecutar("GET", "/api/usuarios/{id}", { param: 1 });
await capturar("08-usuario-id-medico-200.png", "Prueba 5b — Consultar usuario por ID (Médico)", "200", r);

// --- 09. Médico intenta listar usuarios (403) ---
r = await ejecutar("GET", "/api/usuarios");
await capturar("09-usuarios-medico-403.png", "Prueba 6 — Listar usuarios (Médico) → prohibido", "403", r);

// --- 10. Paciente: perfil (200) ---
await cerrarSesionSwagger();
const tokenPaciente = await obtenerToken("carlos@hospital.com");
await autorizar(tokenPaciente);
await confirmarAutorizacion();
await cerrarModal();
r = await ejecutar("GET", "/api/auth/perfil");
await capturar("10-perfil-paciente-200.png", "Prueba 7 — Perfil (Paciente)", "200", r);

// --- 11. Paciente intenta listar usuarios (403) ---
r = await ejecutar("GET", "/api/usuarios");
await capturar("11-usuarios-paciente-403.png", "Prueba 8 — Listar usuarios (Paciente) → prohibido", "403", r);

// --- 12. Password incorrecto (401) ---
await cerrarSesionSwagger();
r = await ejecutar("POST", "/api/auth/login", {
  body: JSON.stringify({ email: "admin@hospital.com", password: "incorrecta" }, null, 2),
});
await capturar("12-password-incorrecto-401.png", "Prueba 9 — Password incorrecto", "401", r);

// --- 13. Usuario inexistente (401) ---
r = await ejecutar("POST", "/api/auth/login", {
  body: JSON.stringify({ email: "noexiste@hospital.com", password: "123456" }, null, 2),
});
await capturar("13-usuario-inexistente-401.png", "Prueba 10 — Usuario inexistente", "401", r);

// --- 14. PASETO manipulado (401) ---
const cuerpo = tokenAdmin.slice("v4.public.".length);
const medio = Math.floor(cuerpo.length / 2);
const sustituto = cuerpo[medio] === "A" ? "B" : "A";
const tokenManipulado =
  "v4.public." + cuerpo.slice(0, medio) + sustituto + cuerpo.slice(medio + 1);

await autorizar(tokenManipulado);
await confirmarAutorizacion();
await cerrarModal();
r = await ejecutar("GET", "/api/auth/perfil");
await capturar("14-token-manipulado-401.png", "Prueba 11 — PASETO manipulado", "401", r);

// ------------------------------------------------------------
// Índice en Markdown
// ------------------------------------------------------------

const fecha = new Date().toLocaleString("es-CO", {
  dateStyle: "full",
  timeStyle: "medium",
});

let md = `# Capturas de las pruebas — LAB PASETO V2\n\n`;
md += `**Fecha de captura:** ${fecha}\n\n`;
md += `**Entorno:** Swagger UI en ${BASE}/api-docs — Chrome headless\n\n`;
md += `Todas las capturas se tomaron ejecutando realmente cada endpoint desde Swagger UI.\n\n`;
md += `---\n\n| # | Captura | Prueba | Esperado | Obtenido |\n|---:|---|---|---|---|\n`;

registro.forEach((x, i) => {
  md += `| ${i} | [\`${x.archivo}\`](./${x.archivo}) | ${x.titulo} | \`${x.esperado}\` | \`${x.obtenido.status}\` |\n`;
});

md += `\n---\n\n## Vista de cada captura\n\n`;
registro.forEach((x) => {
  md += `### ${x.titulo}\n\n`;
  md += `**Resultado:** \`${x.obtenido.status}\`\n\n`;
  if (x.obtenido.body) {
    md += `\`\`\`json\n${x.obtenido.body}\n\`\`\`\n\n`;
  }
  md += `![${x.titulo}](./${x.archivo})\n\n`;
});

writeFileSync(new URL("./INDICE.md", DIR), md, "utf8");

const ok = registro.filter((x) => x.ok).length;
console.log(`\n=== ${ok}/${registro.length} capturas con el resultado esperado ===`);
console.log(`Guardadas en: pruebas/capturas/`);
console.log(`Índice: pruebas/capturas/INDICE.md\n`);

await c.cerrar();
process.exit(ok === registro.length ? 0 : 1);
