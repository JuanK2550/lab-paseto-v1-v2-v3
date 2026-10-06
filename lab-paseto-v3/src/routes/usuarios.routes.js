import express from "express";

import {
  listarUsuarios,
  obtenerUsuario,
  crearUsuario,
  actualizarUsuario,
  actualizarUsuarioParcial,
  eliminarUsuario,
} from "../controllers/usuarios.controller.js";

import autenticarPaseto
  from "../middlewares/auth.middleware.js";

import autorizarRoles
  from "../middlewares/rol.middleware.js";

import {
  validarCrearUsuario,
  validarActualizarUsuario,
  validarActualizarParcial,
} from "../validators/usuarios.validator.js";

const router =
  express.Router();

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
  autorizarRoles(
    "administrador"
  ),
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

/**
 * @swagger
 * /api/usuarios:
 *   post:
 *     tags:
 *       - Usuarios
 *     summary: Crear usuario
 *     description: Solo disponible para administradores.
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombre
 *               - email
 *               - password
 *               - rol
 *               - activo
 *             properties:
 *               nombre:
 *                 type: string
 *                 example: Ana Torres
 *               email:
 *                 type: string
 *                 example: ana@hospital.com
 *               password:
 *                 type: string
 *                 example: "123456"
 *               rol:
 *                 type: string
 *                 enum:
 *                   - administrador
 *                   - medico
 *                   - paciente
 *                 example: paciente
 *               activo:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       201:
 *         description: Usuario creado
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autenticado
 *       403:
 *         description: No autorizado
 *       409:
 *         description: Email ya registrado
 */
router.post(
  "/",
  autenticarPaseto,
  autorizarRoles(
    "administrador"
  ),
  validarCrearUsuario,
  crearUsuario
);

/**
 * @swagger
 * /api/usuarios/{id}:
 *   put:
 *     tags:
 *       - Usuarios
 *     summary: Reemplazar completamente un usuario
 *     description: Todos los campos son requeridos. Solo disponible para administradores.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombre
 *               - email
 *               - password
 *               - rol
 *               - activo
 *             properties:
 *               nombre:
 *                 type: string
 *                 example: Ana Torres Actualizada
 *               email:
 *                 type: string
 *                 example: ana@hospital.com
 *               password:
 *                 type: string
 *                 example: "654321"
 *               rol:
 *                 type: string
 *                 enum:
 *                   - administrador
 *                   - medico
 *                   - paciente
 *                 example: medico
 *               activo:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: Usuario actualizado completamente
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autenticado
 *       403:
 *         description: No autorizado
 *       404:
 *         description: Usuario no encontrado
 *       409:
 *         description: Email ya registrado
 */
router.put(
  "/:id",
  autenticarPaseto,
  autorizarRoles(
    "administrador"
  ),
  validarActualizarUsuario,
  actualizarUsuario
);

/**
 * @swagger
 * /api/usuarios/{id}:
 *   patch:
 *     tags:
 *       - Usuarios
 *     summary: Actualizar parcialmente un usuario
 *     description: Permite modificar uno o varios campos. Solo disponible para administradores.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *                 example: Ana Torres
 *               email:
 *                 type: string
 *                 example: ana@hospital.com
 *               password:
 *                 type: string
 *                 example: "123456"
 *               rol:
 *                 type: string
 *                 enum:
 *                   - administrador
 *                   - medico
 *                   - paciente
 *               activo:
 *                 type: boolean
 *                 example: false
 *     responses:
 *       200:
 *         description: Usuario actualizado parcialmente
 *       400:
 *         description: Datos inválidos o actualización vacía
 *       401:
 *         description: No autenticado
 *       403:
 *         description: No autorizado
 *       404:
 *         description: Usuario no encontrado
 *       409:
 *         description: Email ya registrado
 */
router.patch(
  "/:id",
  autenticarPaseto,
  autorizarRoles(
    "administrador"
  ),
  validarActualizarParcial,
  actualizarUsuarioParcial
);

/**
 * @swagger
 * /api/usuarios/{id}:
 *   delete:
 *     tags:
 *       - Usuarios
 *     summary: Eliminar usuario
 *     description: Solo disponible para administradores.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Usuario eliminado
 *       401:
 *         description: No autenticado
 *       403:
 *         description: No autorizado
 *       404:
 *         description: Usuario no encontrado
 */
router.delete(
  "/:id",
  autenticarPaseto,
  autorizarRoles(
    "administrador"
  ),
  eliminarUsuario
);

export default router;
