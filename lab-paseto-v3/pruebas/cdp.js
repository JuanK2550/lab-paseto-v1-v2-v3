// ============================================================
// Controlador mínimo de Chrome vía DevTools Protocol.
// Sin dependencias: usa el WebSocket nativo de Node 22+.
// ============================================================

import { spawn } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const PUERTO = 9333;

const esperar = (ms) => new Promise((r) => setTimeout(r, ms));

export class Chrome {
  constructor() {
    this.id = 0;
    this.pendientes = new Map();
  }

  async abrir({ ancho = 1440, alto = 1100 } = {}) {
    this.perfil = mkdtempSync(join(tmpdir(), "cdp-perfil-"));

    this.proceso = spawn(
      CHROME,
      [
        "--headless=new",
        `--remote-debugging-port=${PUERTO}`,
        `--user-data-dir=${this.perfil}`,
        `--window-size=${ancho},${alto}`,
        "--no-first-run",
        "--no-default-browser-check",
        "--disable-extensions",
        "--disable-gpu",
        "--hide-scrollbars",
        "--force-device-scale-factor=1",
        "about:blank",
      ],
      { stdio: "ignore", detached: false }
    );

    // Esperar a que el puerto de depuración responda
    let destino = null;
    for (let i = 0; i < 60; i++) {
      try {
        const r = await fetch(`http://127.0.0.1:${PUERTO}/json/list`);
        const lista = await r.json();
        destino = lista.find((t) => t.type === "page");
        if (destino) break;
      } catch {
        /* aún no levanta */
      }
      await esperar(500);
    }
    if (!destino) throw new Error("Chrome no abrió el puerto de depuración");

    this.ws = new WebSocket(destino.webSocketDebuggerUrl);

    await new Promise((resolve, reject) => {
      this.ws.onopen = resolve;
      this.ws.onerror = reject;
    });

    this.ws.onmessage = (evento) => {
      const msg = JSON.parse(evento.data);
      const p = this.pendientes.get(msg.id);
      if (!p) return;
      this.pendientes.delete(msg.id);
      msg.error ? p.rechazar(new Error(msg.error.message)) : p.resolver(msg.result);
    };

    await this.enviar("Page.enable");
    await this.enviar("Runtime.enable");
    return this;
  }

  enviar(method, params = {}) {
    const id = ++this.id;
    return new Promise((resolver, rechazar) => {
      this.pendientes.set(id, { resolver, rechazar });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }

  async ir(url, { espera = 1500 } = {}) {
    await this.enviar("Page.navigate", { url });
    await esperar(espera);
  }

  // Ejecuta JS en la página y devuelve el valor
  async js(expresion) {
    const r = await this.enviar("Runtime.evaluate", {
      expression: `(function(){ ${expresion} })()`,
      returnByValue: true,
      awaitPromise: true,
    });
    if (r.exceptionDetails) {
      throw new Error(
        r.exceptionDetails.exception?.description ??
          r.exceptionDetails.text
      );
    }
    return r.result.value;
  }

  async captura(ruta, { completa = true } = {}) {
    const params = { format: "png" };

    if (completa) {
      const m = await this.enviar("Page.getLayoutMetrics");
      const h = Math.min(Math.ceil(m.cssContentSize.height), 12000);
      const w = Math.ceil(m.cssContentSize.width);
      params.clip = { x: 0, y: 0, width: w, height: h, scale: 1 };
      params.captureBeyondViewport = true;
    }

    const { data } = await this.enviar("Page.captureScreenshot", params);
    const { writeFileSync } = await import("node:fs");
    writeFileSync(ruta, Buffer.from(data, "base64"));
    return ruta;
  }

  async cerrar() {
    try {
      this.ws?.close();
    } catch {
      /* ignorar */
    }
    try {
      this.proceso?.kill();
    } catch {
      /* ignorar */
    }
    await esperar(800);
    try {
      rmSync(this.perfil, { recursive: true, force: true });
    } catch {
      /* ignorar */
    }
  }
}

export { esperar };
