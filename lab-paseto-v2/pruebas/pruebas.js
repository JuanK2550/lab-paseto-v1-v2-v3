// ============================================================
// LAB PASETO V2 - Suite de pruebas automáticas
// Ejecuta la matriz completa del README contra el servidor.
// Uso:  node pruebas/pruebas.js    (o npm run test:lab)
// ============================================================

import { writeFileSync } from "node:fs";

const BASE = "http://localhost:3000";

const resultados = [];

// Captura de Swagger que sirve de evidencia visual de cada prueba.
// Se generan con:  npm run test:capturas
const CAPTURAS = {
  1: "01-login-admin-200.png",
  2: "03-perfil-admin-200.png",
  3: "06-perfil-sin-token-401.png",
  4: "04-usuarios-admin-200.png",
  5: "08-usuario-id-medico-200.png",
  6: "09-usuarios-medico-403.png",
  7: "10-perfil-paciente-200.png",
  8: "11-usuarios-paciente-403.png",
  9: "12-password-incorrecto-401.png",
  10: "13-usuario-inexistente-401.png",
  11: "14-token-manipulado-401.png",
  12: "05-usuario-99-404.png",
  13: "00-swagger-home.png",
};

// ------------------------------------------------------------
// Utilidades
// ------------------------------------------------------------

// Recorta los tokens para que el reporte sea legible
const recortar = (valor) => {
  if (typeof valor === "string" && valor.startsWith("v4.public.")) {
    return valor.slice(0, 30) + "...";
  }
  if (valor && typeof valor === "object") {
    if (Array.isArray(valor)) return valor.map(recortar);
    return Object.fromEntries(
      Object.entries(valor).map(([k, v]) => [k, recortar(v)])
    );
  }
  return valor;
};

// Realiza una petición y devuelve { status, body }
const pedir = async (ruta, { metodo = "GET", token, body } = {}) => {
  const opciones = { method: metodo, headers: {} };

  if (body) {
    opciones.headers["Content-Type"] = "application/json";
    opciones.body = JSON.stringify(body);
  }
  if (token) {
    opciones.headers["Authorization"] = `Bearer ${token}`;
  }

  const respuesta = await fetch(BASE + ruta, opciones);
  const texto = await respuesta.text();

  let cuerpo;
  try {
    cuerpo = JSON.parse(texto);
  } catch {
    cuerpo = texto.slice(0, 60) + (texto.length > 60 ? "..." : "");
  }

  return { status: respuesta.status, body: cuerpo };
};

// Registra el resultado de una prueba
const verificar = ({
  n,
  nombre,
  rol,
  esperadoStatus,
  esperadoMensaje,
  obtenido,
  extra,
}) => {
  const mensajeObtenido = obtenido.body?.mensaje ?? "—";

  let pasa = obtenido.status === esperadoStatus;

  if (pasa && esperadoMensaje) {
    pasa = mensajeObtenido === esperadoMensaje;
  }
  if (pasa && extra) {
    pasa = extra.condicion;
  }

  resultados.push({
    n,
    nombre,
    rol,
    esperado:
      `${esperadoStatus}` +
      (esperadoMensaje ? ` "${esperadoMensaje}"` : "") +
      (extra ? ` + ${extra.descripcion}` : ""),
    obtenido:
      `${obtenido.status}` +
      (mensajeObtenido !== "—" ? ` "${mensajeObtenido}"` : "") +
      (extra ? ` + ${extra.resultado}` : ""),
    pasa,
    json: recortar(obtenido.body),
    captura: CAPTURAS[n],
  });

  console.log(
    `${pasa ? "✅ PASA " : "❌ FALLA"}  ${String(n).padStart(2)}. ` +
      `${nombre.padEnd(42)} ${String(obtenido.status).padEnd(4)} ` +
      `${mensajeObtenido}`
  );

  return pasa;
};

const login = async (email, password) =>
  pedir("/api/auth/login", {
    metodo: "POST",
    body: { email, password },
  });

// ------------------------------------------------------------
// Ejecución de la matriz
// ------------------------------------------------------------

console.log("\n=== LAB PASETO V2 — pruebas automáticas ===\n");

// --- 1. Login administrador ---
const r1 = await login("admin@hospital.com", "123456");
const tokenAdmin = r1.body?.token;

const prefijoOk =
  typeof tokenAdmin === "string" && tokenAdmin.startsWith("v4.public.");

verificar({
  n: 1,
  nombre: "Login correcto",
  rol: "Administrador",
  esperadoStatus: 200,
  esperadoMensaje: "Login correcto",
  obtenido: r1,
  extra: {
    descripcion: "token empieza por v4.public.",
    condicion: prefijoOk,
    resultado: prefijoOk ? "prefijo correcto" : "prefijo INCORRECTO",
  },
});

// --- 2. Perfil con token de administrador ---
const r2 = await pedir("/api/auth/perfil", { token: tokenAdmin });

verificar({
  n: 2,
  nombre: "Perfil con PASETO",
  rol: "Administrador",
  esperadoStatus: 200,
  obtenido: r2,
  extra: {
    descripcion: "datos del admin",
    condicion:
      r2.body?.email === "admin@hospital.com" &&
      r2.body?.rol === "administrador",
    resultado: `${r2.body?.email} / ${r2.body?.rol}`,
  },
});

// --- 3. Perfil sin token ---
verificar({
  n: 3,
  nombre: "Perfil sin PASETO",
  rol: "—",
  esperadoStatus: 401,
  esperadoMensaje: "Token no proporcionado",
  obtenido: await pedir("/api/auth/perfil"),
});

// --- 4. Listar usuarios como administrador ---
const r4 = await pedir("/api/usuarios", { token: tokenAdmin });

const sinPassword =
  Array.isArray(r4.body) &&
  r4.body.length === 3 &&
  r4.body.every((u) => !("password" in u));

verificar({
  n: 4,
  nombre: "Listar usuarios",
  rol: "Administrador",
  esperadoStatus: 200,
  obtenido: r4,
  extra: {
    descripcion: "ningún usuario trae password",
    condicion: sinPassword,
    resultado: sinPassword
      ? "0 passwords expuestos"
      : "SE FILTRÓ password",
  },
});

// --- 5. Médico consulta usuario por ID ---
const rLoginMedico = await login("laura@hospital.com", "123456");
const tokenMedico = rLoginMedico.body?.token;
const r5 = await pedir("/api/usuarios/1", { token: tokenMedico });

const r5SinPassword = !("password" in (r5.body ?? {}));

verificar({
  n: 5,
  nombre: "Consultar usuario por ID",
  rol: "Médico",
  esperadoStatus: 200,
  obtenido: r5,
  extra: {
    descripcion: "sin password",
    condicion: r5.body?.id === 1 && r5SinPassword,
    resultado: r5SinPassword ? "sin password" : "SE FILTRÓ password",
  },
});

// --- 6. Médico intenta listar usuarios ---
verificar({
  n: 6,
  nombre: "Listar usuarios",
  rol: "Médico",
  esperadoStatus: 403,
  esperadoMensaje: "No tiene permisos para acceder a este recurso",
  obtenido: await pedir("/api/usuarios", { token: tokenMedico }),
});

// --- 7. Paciente consulta su perfil ---
const rLoginPaciente = await login("carlos@hospital.com", "123456");
const tokenPaciente = rLoginPaciente.body?.token;
const r7 = await pedir("/api/auth/perfil", { token: tokenPaciente });

verificar({
  n: 7,
  nombre: "Perfil",
  rol: "Paciente",
  esperadoStatus: 200,
  obtenido: r7,
  extra: {
    descripcion: "rol paciente",
    condicion: r7.body?.rol === "paciente",
    resultado: `rol = ${r7.body?.rol}`,
  },
});

// --- 8. Paciente intenta listar usuarios ---
verificar({
  n: 8,
  nombre: "Listar usuarios",
  rol: "Paciente",
  esperadoStatus: 403,
  esperadoMensaje: "No tiene permisos para acceder a este recurso",
  obtenido: await pedir("/api/usuarios", { token: tokenPaciente }),
});

// --- 9. Password incorrecto ---
verificar({
  n: 9,
  nombre: "Password incorrecto",
  rol: "—",
  esperadoStatus: 401,
  esperadoMensaje: "Credenciales inválidas",
  obtenido: await login("admin@hospital.com", "incorrecta"),
});

// --- 10. Usuario inexistente ---
verificar({
  n: 10,
  nombre: "Usuario inexistente (login)",
  rol: "—",
  esperadoStatus: 401,
  esperadoMensaje: "Credenciales inválidas",
  obtenido: await login("noexiste@hospital.com", "123456"),
});

// --- 11. PASETO manipulado ---
// Se modifica un carácter en la MITAD del token (no el último),
// para que el cambio caiga con seguridad dentro del payload firmado.
const cuerpoToken = tokenAdmin.slice("v4.public.".length);
const medio = Math.floor(cuerpoToken.length / 2);
const original = cuerpoToken[medio];
const sustituto = original === "A" ? "B" : "A";

const tokenManipulado =
  "v4.public." +
  cuerpoToken.slice(0, medio) +
  sustituto +
  cuerpoToken.slice(medio + 1);

verificar({
  n: 11,
  nombre: `PASETO manipulado (pos ${medio}: ${original} por ${sustituto})`,
  rol: "—",
  esperadoStatus: 401,
  esperadoMensaje: "Token inválido o expirado",
  obtenido: await pedir("/api/auth/perfil", { token: tokenManipulado }),
});

// --- 12. Usuario inexistente por ID ---
verificar({
  n: 12,
  nombre: "Usuario inexistente por ID (99)",
  rol: "Administrador",
  esperadoStatus: 404,
  esperadoMensaje: "Usuario no encontrado",
  obtenido: await pedir("/api/usuarios/99", { token: tokenAdmin }),
});

// --- 13. Swagger disponible ---
verificar({
  n: 13,
  nombre: "Swagger disponible (/api-docs)",
  rol: "—",
  esperadoStatus: 200,
  obtenido: await pedir("/api-docs/"),
});

// ------------------------------------------------------------
// Resumen y reporte
// ------------------------------------------------------------

const pasaron = resultados.filter((r) => r.pasa).length;
const total = resultados.length;

console.log(`\n=== RESULTADO: ${pasaron}/${total} pruebas pasaron ===\n`);

const fecha = new Date().toLocaleString("es-CO", {
  dateStyle: "full",
  timeStyle: "medium",
});

let md = `# Resultados de pruebas — LAB PASETO V2\n\n`;
md += `**Fecha y hora de ejecución:** ${fecha}\n\n`;
md += `**Servidor:** ${BASE}\n\n`;
md += `**Resultado global:** ${pasaron}/${total} pruebas pasaron`;
md += pasaron === total ? " ✅\n\n" : " ❌\n\n";
md += `---\n\n## Matriz de pruebas\n\n`;
md += `| # | Prueba | Rol | Esperado | Obtenido | Resultado | Evidencia |\n`;
md += `|---:|---|---|---|---|:---:|---|\n`;

for (const r of resultados) {
  const evidencia = r.captura
    ? `[📸](./capturas/${r.captura})`
    : "—";
  md += `| ${r.n} | ${r.nombre} | ${r.rol} | \`${r.esperado}\` | \`${r.obtenido}\` | ${r.pasa ? "✅ PASA" : "❌ FALLA"} | ${evidencia} |\n`;
}

md += `\n---\n\n## Detalle de cada prueba\n\n`;
md += `> Los tokens aparecen recortados a los primeros 30 caracteres.\n`;
md += `> Las capturas se tomaron ejecutando cada endpoint desde Swagger UI\n`;
md += `> (se regeneran con \`npm run test:capturas\`).\n\n`;

for (const r of resultados) {
  md += `### ${r.n}. ${r.nombre} — ${r.rol}\n\n`;
  md += `**Esperado:** \`${r.esperado}\`
**Obtenido:** \`${r.obtenido}\`
**Resultado:** ${r.pasa ? "✅ PASA" : "❌ FALLA"}\n\n`;
  md += `Respuesta del servidor:\n\n`;
  md += `\`\`\`json\n${JSON.stringify(r.json, null, 2)}\n\`\`\`\n\n`;
  if (r.captura) {
    md += `Evidencia en Swagger UI:\n\n`;
    md += `![Prueba ${r.n}](./capturas/${r.captura})\n\n`;
  }
}

writeFileSync(new URL("./resultados.md", import.meta.url), md, "utf8");

console.log("Reporte guardado en pruebas/resultados.md\n");

process.exit(pasaron === total ? 0 : 1);
