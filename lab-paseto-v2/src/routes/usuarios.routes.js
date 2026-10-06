import express from "express";

import {
  listarUsuarios,
  obtenerUsuario,
} from "../controllers/usuarios.controller.js";

import autenticarPaseto
  from "../middlewares/auth.middleware.js";

import autorizarRoles
  from "../middlewares/rol.middleware.js";

const router = express.Router();

/**
 * @swagger
 * /api/usuarios:
 *   get:
 *     tags:
 *       - Usuarios
 *     summary: Listar usuarios
 *     description: Solo disponible para administradores.
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de usuarios
 *       401:
 *         description: No autenticado
 *       403:
 *         description: No autorizado
 */
router.get(
  "/",
  autenticarPaseto,
  autorizarRoles("administrador"),
  listarUsuarios
);

/**
 * @swagger
 * /api/usuarios/{id}:
 *   get:
 *     tags:
 *       - Usuarios
 *     summary: Obtener usuario por ID
 *     description: Disponible para administradores y médicos.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: Usuario encontrado
 *       401:
 *         description: No autenticado
 *       403:
 *         description: No autorizado
 *       404:
 *         description: Usuario no encontrado
 */
router.get(
  "/:id",
  autenticarPaseto,
  autorizarRoles(
    "administrador",
    "medico"
  ),
  obtenerUsuario
);

export default router;
