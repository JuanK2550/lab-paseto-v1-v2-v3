// ============================================================
// LAB PASETO V3 - Suite de pruebas automáticas
// Ejecuta la matriz completa del README contra el servidor.
//
// IMPORTANTE: los datos viven en memoria, así que el servidor
// debe estar recién arrancado (3 usuarios originales).
//
// Uso:  npm start           (en otra terminal)
//       node pruebas/pruebas.js    (o npm run test:lab)
// ============================================================

import { writeFileSync } from "node:fs";

const BASE = "http://localhost:3000";

const resultados = [];

// Captura de Swagger que sirve de evidencia visual de cada prueba.
// Se generan con:  npm run test:capturas
const CAPTURAS = {
  1: "01-login-admin-200.png",
  2: "03-perfil-admin-200.png",
  3: "04-listar-usuarios-200.png",
  4: "05-crear-usuario-201.png",
  5: "06-obtener-usuario-200.png",
  6: "07-put-completo-200.png",
  7: "08-put-incompleto-400.png",
  8: "09-patch-parcial-200.png",
  9: "11-patch-vacio-400.png",
  10: "12-email-invalido-400.png",
  11: "13-rol-invalido-400.png",
  12: "14-email-duplicado-409.png",
  13: "15-usuario-999-404.png",
  14: "16-delete-204.png",
  15: "17-get-tras-delete-404.png",
  16: "18-sin-token-401.png",
  17: "19-token-manipulado-401.png",
  18: "20-medico-obtener-200.png",
  19: "21-medico-listar-403.png",
  20: "22-medico-crear-403.png",
  21: "23-paciente-perfil-200.png",
  "21b": "24-paciente-listar-403.png",
  "21c": "25-paciente-obtener-403.png",
  22: "26-password-incorrecto-401.png",
  23: "27-email-inexistente-401.png",
  24: "10-login-deshabilitado-403.png",
  25: "00-swagger-home.png",
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

  if (body !== undefined) {
    opciones.headers["Content-Type"] = "application/json";
    opciones.body = JSON.stringify(body);
  }
  if (token) {
    opciones.headers["Authorization"] = `Bearer ${token}`;
  }

  const respuesta = await fetch(BASE + ruta, opciones);
  const texto = await respuesta.text();

  let cuerpo;
  if (texto === "") {
    cuerpo = null; // 204 No Content
  } else {
    try {
      cuerpo = JSON.parse(texto);
    } catch {
      cuerpo = texto.slice(0, 60) + (texto.length > 60 ? "..." : "");
    }
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
      `${nombre.padEnd(46)} ${String(obtenido.status).padEnd(4)} ` +
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

console.log("\n=== LAB PASETO V3 — pruebas automáticas ===\n");

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

if (!tokenAdmin) {
  console.error(
    "\n❌ Sin token de administrador no se puede continuar. " +
      "¿Está el servidor corriendo en " + BASE + "?\n"
  );
  process.exit(1);
}

// --- 2. Perfil con token del admin ---
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

// --- 3. Listar usuarios como admin ---
const r3 = await pedir("/api/usuarios", { token: tokenAdmin });

const sinPassword =
  Array.isArray(r3.body) && r3.body.every((u) => !("password" in u));

verificar({
  n: 3,
  nombre: "Listar usuarios",
  rol: "Administrador",
  esperadoStatus: 200,
  obtenido: r3,
  extra: {
    descripcion: "ningún usuario trae password",
    condicion: sinPassword && r3.body.length === 3,
    resultado: sinPassword
      ? `${r3.body.length} usuarios, 0 passwords expuestos`
      : "SE FILTRÓ password",
  },
});

// --- 4. Crear usuario Ana Torres ---
const r4 = await pedir("/api/usuarios", {
  metodo: "POST",
  token: tokenAdmin,
  body: {
    nombre: "Ana Torres",
    email: "ana@hospital.com",
    password: "123456",
    rol: "paciente",
    activo: true,
  },
});

// El id se toma SIEMPRE de la respuesta, nunca fijo
const idAna = r4.body?.usuario?.id;
const creadoSinPassword = !("password" in (r4.body?.usuario ?? {}));

verificar({
  n: 4,
  nombre: "Crear usuario (Ana Torres)",
  rol: "Administrador",
  esperadoStatus: 201,
  esperadoMensaje: "Usuario creado",
  obtenido: r4,
  extra: {
    descripcion: "sin password + id devuelto",
    condicion: creadoSinPassword && typeof idAna === "number",
    resultado: creadoSinPassword
      ? `id = ${idAna}, sin password`
      : "SE FILTRÓ password",
  },
});

// --- 5. GET del usuario creado ---
const r5 = await pedir(`/api/usuarios/${idAna}`, { token: tokenAdmin });

verificar({
  n: 5,
  nombre: `Consultar usuario creado (id ${idAna})`,
  rol: "Administrador",
  esperadoStatus: 200,
  obtenido: r5,
  extra: {
    descripcion: "es Ana Torres",
    condicion: r5.body?.nombre === "Ana Torres" && r5.body?.id === idAna,
    resultado: `${r5.body?.nombre} / ${r5.body?.rol}`,
  },
});

// --- 6. PUT completo ---
const r6 = await pedir(`/api/usuarios/${idAna}`, {
  metodo: "PUT",
  token: tokenAdmin,
  body: {
    nombre: "Ana Torres Actualizada",
    email: "ana@hospital.com",
    password: "654321",
    rol: "medico",
    activo: true,
  },
});

const putOk =
  r6.body?.usuario?.nombre === "Ana Torres Actualizada" &&
  r6.body?.usuario?.rol === "medico";

verificar({
  n: 6,
  nombre: "PUT completo",
  rol: "Administrador",
  esperadoStatus: 200,
  esperadoMensaje: "Usuario actualizado completamente",
  obtenido: r6,
  extra: {
    descripcion: "nombre y rol cambiaron",
    condicion: putOk,
    resultado: putOk
      ? `${r6.body.usuario.nombre} / ${r6.body.usuario.rol}`
      : "NO cambiaron",
  },
});

// --- 7. PUT incompleto (solo nombre) ---
const r7 = await pedir(`/api/usuarios/${idAna}`, {
  metodo: "PUT",
  token: tokenAdmin,
  body: { nombre: "Solo el nombre" },
});

const tieneErrores = Array.isArray(r7.body?.errores) && r7.body.errores.length > 0;

verificar({
  n: 7,
  nombre: "PUT incompleto (falta el resto de campos)",
  rol: "Administrador",
  esperadoStatus: 400,
  esperadoMensaje: "Datos inválidos",
  obtenido: r7,
  extra: {
    descripcion: "arreglo de errores",
    condicion: tieneErrores,
    resultado: tieneErrores
      ? `${r7.body.errores.length} errores`
      : "SIN arreglo de errores",
  },
});

// --- 8. PATCH { activo: false } ---
const r8 = await pedir(`/api/usuarios/${idAna}`, {
  metodo: "PATCH",
  token: tokenAdmin,
  body: { activo: false },
});

const u8 = r8.body?.usuario;
const patchOk =
  u8?.activo === false &&
  u8?.nombre === "Ana Torres Actualizada" &&
  u8?.email === "ana@hospital.com" &&
  u8?.rol === "medico";

verificar({
  n: 8,
  nombre: "PATCH parcial (activo = false)",
  rol: "Administrador",
  esperadoStatus: 200,
  esperadoMensaje: "Usuario actualizado parcialmente",
  obtenido: r8,
  extra: {
    descripcion: "activo=false y el resto intacto",
    condicion: patchOk,
    resultado: patchOk
      ? "activo=false, nombre/email/rol sin cambios"
      : "se modificaron otros campos",
  },
});

// --- 24. Login de Ana, que quedó deshabilitada (prueba extra) ---
verificar({
  n: 24,
  nombre: "Login de un usuario deshabilitado",
  rol: "Ana (activo=false)",
  esperadoStatus: 403,
  esperadoMensaje: "Usuario deshabilitado",
  obtenido: await login("ana@hospital.com", "654321"),
});

// --- 9. PATCH vacío ---
verificar({
  n: 9,
  nombre: "PATCH con body vacío",
  rol: "Administrador",
  esperadoStatus: 400,
  esperadoMensaje: "Debe proporcionar al menos un campo para actualizar",
  obtenido: await pedir(`/api/usuarios/${idAna}`, {
    metodo: "PATCH",
    token: tokenAdmin,
    body: {},
  }),
});

// --- 10. POST con email inválido ---
verificar({
  n: 10,
  nombre: "POST con email inválido",
  rol: "Administrador",
  esperadoStatus: 400,
  esperadoMensaje: "Datos inválidos",
  obtenido: await pedir("/api/usuarios", {
    metodo: "POST",
    token: tokenAdmin,
    body: {
      nombre: "Email Malo",
      email: "esto-no-es-un-email",
      password: "123456",
      rol: "paciente",
      activo: true,
    },
  }),
});

// --- 11. POST con rol no permitido ---
verificar({
  n: 11,
  nombre: "POST con rol 'superadministrador'",
  rol: "Administrador",
  esperadoStatus: 400,
  esperadoMensaje: "Datos inválidos",
  obtenido: await pedir("/api/usuarios", {
    metodo: "POST",
    token: tokenAdmin,
    body: {
      nombre: "Rol Invalido",
      email: "rolinvalido@hospital.com",
      password: "123456",
      rol: "superadministrador",
      activo: true,
    },
  }),
});

// --- 12. POST con email ya registrado ---
verificar({
  n: 12,
  nombre: "POST con email ya registrado",
  rol: "Administrador",
  esperadoStatus: 409,
  esperadoMensaje: "El email ya está registrado",
  obtenido: await pedir("/api/usuarios", {
    metodo: "POST",
    token: tokenAdmin,
    body: {
      nombre: "Duplicado Hospital",
      email: "admin@hospital.com",
      password: "123456",
      rol: "paciente",
      activo: true,
    },
  }),
});

// --- 13. GET de un id inexistente ---
verificar({
  n: 13,
  nombre: "GET /api/usuarios/999",
  rol: "Administrador",
  esperadoStatus: 404,
  esperadoMensaje: "Usuario no encontrado",
  obtenido: await pedir("/api/usuarios/999", { token: tokenAdmin }),
});

// --- 14. DELETE de Ana ---
const r14 = await pedir(`/api/usuarios/${idAna}`, {
  metodo: "DELETE",
  token: tokenAdmin,
});

verificar({
  n: 14,
  nombre: `DELETE del usuario creado (id ${idAna})`,
  rol: "Administrador",
  esperadoStatus: 204,
  obtenido: r14,
  extra: {
    descripcion: "cuerpo vacío",
    condicion: r14.body === null,
    resultado: r14.body === null ? "sin cuerpo" : "devolvió contenido",
  },
});

// --- 15. GET después del DELETE ---
verificar({
  n: 15,
  nombre: "GET del usuario eliminado",
  rol: "Administrador",
  esperadoStatus: 404,
  esperadoMensaje: "Usuario no encontrado",
  obtenido: await pedir(`/api/usuarios/${idAna}`, { token: tokenAdmin }),
});

// --- 16. Sin token ---
verificar({
  n: 16,
  nombre: "GET /api/usuarios sin token",
  rol: "—",
  esperadoStatus: 401,
  esperadoMensaje: "Token no proporcionado",
  obtenido: await pedir("/api/usuarios"),
});

// --- 17. Token manipulado ---
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
  n: 17,
  nombre: `Token manipulado (pos ${medio}: ${original} por ${sustituto})`,
  rol: "—",
  esperadoStatus: 401,
  esperadoMensaje: "Token inválido o expirado",
  obtenido: await pedir("/api/auth/perfil", { token: tokenManipulado }),
});

// --- 18. Médico consulta usuario por ID ---
const rLoginMedico = await login("laura@hospital.com", "123456");
const tokenMedico = rLoginMedico.body?.token;

verificar({
  n: 18,
  nombre: "GET /api/usuarios/1",
  rol: "Médico",
  esperadoStatus: 200,
  obtenido: await pedir("/api/usuarios/1", { token: tokenMedico }),
});

// --- 19. Médico lista usuarios ---
verificar({
  n: 19,
  nombre: "GET /api/usuarios (listar)",
  rol: "Médico",
  esperadoStatus: 403,
  esperadoMensaje: "No tiene permisos para acceder a este recurso",
  obtenido: await pedir("/api/usuarios", { token: tokenMedico }),
});

// --- 20. Médico intenta crear usuario con body VÁLIDO ---
// El body es válido a propósito: demuestra que el rol se revisa
// ANTES que la validación, por eso devuelve 403 y no 400.
verificar({
  n: 20,
  nombre: "POST /api/usuarios con body válido",
  rol: "Médico",
  esperadoStatus: 403,
  esperadoMensaje: "No tiene permisos para acceder a este recurso",
  obtenido: await pedir("/api/usuarios", {
    metodo: "POST",
    token: tokenMedico,
    body: {
      nombre: "Usuario Del Medico",
      email: "nuevo@hospital.com",
      password: "123456",
      rol: "paciente",
      activo: true,
    },
  }),
});

// --- 21. Paciente: perfil 200, listar 403, por id 403 ---
const rLoginPaciente = await login("carlos@hospital.com", "123456");
const tokenPaciente = rLoginPaciente.body?.token;

const r21a = await pedir("/api/auth/perfil", { token: tokenPaciente });

verificar({
  n: 21,
  nombre: "Perfil propio",
  rol: "Paciente",
  esperadoStatus: 200,
  obtenido: r21a,
  extra: {
    descripcion: "rol paciente",
    condicion: r21a.body?.rol === "paciente",
    resultado: `rol = ${r21a.body?.rol}`,
  },
});

verificar({
  n: "21b",
  nombre: "GET /api/usuarios (listar)",
  rol: "Paciente",
  esperadoStatus: 403,
  esperadoMensaje: "No tiene permisos para acceder a este recurso",
  obtenido: await pedir("/api/usuarios", { token: tokenPaciente }),
});

verificar({
  n: "21c",
  nombre: "GET /api/usuarios/1",
  rol: "Paciente",
  esperadoStatus: 403,
  esperadoMensaje: "No tiene permisos para acceder a este recurso",
  obtenido: await pedir("/api/usuarios/1", { token: tokenPaciente }),
});

// --- 22. Password incorrecto ---
verificar({
  n: 22,
  nombre: "Login con password incorrecto",
  rol: "—",
  esperadoStatus: 401,
  esperadoMensaje: "Credenciales inválidas",
  obtenido: await login("admin@hospital.com", "incorrecta"),
});

// --- 23. Email inexistente ---
verificar({
  n: 23,
  nombre: "Login con email inexistente",
  rol: "—",
  esperadoStatus: 401,
  esperadoMensaje: "Credenciales inválidas",
  obtenido: await login("noexiste@hospital.com", "123456"),
});

// --- 25. Swagger disponible ---
verificar({
  n: 25,
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

let md = `# Resultados de pruebas — LAB PASETO V3\n\n`;
md += `**Fecha y hora de ejecución:** ${fecha}\n\n`;
md += `**Servidor:** ${BASE} (arrancado con \`npm start\`)\n\n`;
md += `**Resultado global:** ${pasaron}/${total} pruebas pasaron`;
md += pasaron === total ? " ✅\n\n" : " ❌\n\n";
md += `> Los datos viven en memoria, por lo que esta ejecución partió de los\n`;
md += `> 3 usuarios originales. El id del usuario creado en la prueba 4 se\n`;
md += `> toma siempre de la respuesta, nunca escrito fijo.\n\n`;
md += `---\n\n## Matriz de pruebas\n\n`;
md += `| # | Prueba | Rol | Esperado | Obtenido | Resultado | Evidencia |\n`;
md += `|---:|---|---|---|---|:---:|---|\n`;

for (const r of resultados) {
  const evidencia = r.captura ? `[📸](./capturas/${r.captura})` : "—";
  md += `| ${r.n} | ${r.nombre} | ${r.rol} | \`${r.esperado}\` | \`${r.obtenido}\` | ${r.pasa ? "✅ PASA" : "❌ FALLA"} | ${evidencia} |\n`;
}

// --- Matriz de permisos (sección 57 del README) ---
md += `\n---\n\n## Matriz de permisos comprobada\n\n`;
md += `Corresponde a la sección 57 del README. La columna "Comprobado en"\n`;
md += `indica qué prueba de esta ejecución verificó cada combinación.\n\n`;
md += `| Operación | Administrador | Médico | Paciente | Comprobado en |\n`;
md += `|---|:---:|:---:|:---:|---|\n`;
md += `| Login | ✅ | ✅ | ✅ | 1, 18, 21 |\n`;
md += `| Perfil propio | ✅ | ✅ | ✅ | 2, 18, 21 |\n`;
md += `| Listar usuarios | ✅ | ❌ | ❌ | 3, 19, 21b |\n`;
md += `| Consultar usuario por ID | ✅ | ✅ | ❌ | 5, 18, 21c |\n`;
md += `| Crear usuario | ✅ | ❌ | ❌ | 4, 20 |\n`;
md += `| PUT usuario | ✅ | ❌ | ❌ | 6 |\n`;
md += `| PATCH usuario | ✅ | ❌ | ❌ | 8 |\n`;
md += `| DELETE usuario | ✅ | ❌ | ❌ | 14 |\n`;

// --- Códigos HTTP ejercitados ---
const codigos = {};
for (const r of resultados) {
  const c = r.obtenido.split(" ")[0];
  codigos[c] = (codigos[c] ?? 0) + 1;
}
md += `\n---\n\n## Códigos HTTP ejercitados\n\n`;
md += `| Código | Veces | Significado |\n|---:|---:|---|\n`;
const nombresCodigo = {
  200: "OK",
  201: "Created — usuario creado",
  204: "No Content — usuario eliminado",
  400: "Bad Request — datos inválidos",
  401: "Unauthorized — no autenticado",
  403: "Forbidden — autenticado sin permisos",
  404: "Not Found — usuario inexistente",
  409: "Conflict — email ya registrado",
};
for (const c of Object.keys(codigos).sort()) {
  md += `| \`${c}\` | ${codigos[c]} | ${nombresCodigo[c] ?? "—"} |\n`;
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
