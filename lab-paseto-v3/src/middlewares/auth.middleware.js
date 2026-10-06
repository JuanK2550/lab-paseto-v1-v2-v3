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
// Middleware de autenticación
// ========================================

const autenticarPaseto =
  async (req, res, next) => {

    try {
      const authorization =
        req.headers.authorization;

      if (!authorization) {
        return res.status(401).json({
          mensaje: "Token no proporcionado",
        });
      }

      const [tipo, token] =
        authorization.split(" ");

      if (
        tipo !== "Bearer" ||
        !token
      ) {
        return res.status(401).json({
          mensaje:
            "Formato de token inválido",
        });
      }

      const clavePublica =
        obtenerClavePublica();

      const resultado =
        await v4.Verify(
          clavePublica,
          token
        );

      req.usuario =
        resultado.claims;

      next();

    } catch (error) {
      return res.status(401).json({
        mensaje:
          "Token inválido o expirado",
      });
    }
  };

export default autenticarPaseto;
