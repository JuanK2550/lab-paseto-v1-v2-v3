import express from "express";

import {
  login,
} from "../controllers/auth.controller.js";

import autenticarPaseto
  from "../middlewares/auth.middleware.js";

const router = express.Router();

// ========================================
// Login
// ========================================

router.post("/login", login);

// ========================================
// Perfil protegido
// ========================================

router.get(
  "/perfil",
  autenticarPaseto,
  (req, res) => {
    return res.status(200).json({
      mensaje: "Acceso autorizado con PASETO",
      usuario: req.usuario,
    });
  }
);

export default router;
