import express from "express";

import {
  login,
  perfil,
} from "../controllers/auth.controller.js";

import autenticarPaseto
  from "../middlewares/auth.middleware.js";

const router = express.Router();

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     tags:
 *       - Autenticación
 *     summary: Iniciar sesión
 *     description: Valida las credenciales y genera un PASETO v4.public.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: admin@hospital.com
 *               password:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: Login correcto
 *       401:
 *         description: Credenciales inválidas
 *       403:
 *         description: Usuario deshabilitado
 */
router.post(
  "/login",
  login
);

/**
 * @swagger
 * /api/auth/perfil:
 *   get:
 *     tags:
 *       - Autenticación
 *     summary: Obtener perfil
 *     description: Obtiene el perfil del usuario autenticado mediante PASETO.
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Perfil obtenido correctamente
 *       401:
 *         description: Token ausente, inválido o expirado
 *       404:
 *         description: Usuario no encontrado
 */
router.get(
  "/perfil",
  autenticarPaseto,
  perfil
);

export default router;
