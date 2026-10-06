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
