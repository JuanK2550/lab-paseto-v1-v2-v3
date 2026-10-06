import {
  body,
  validationResult,
  matchedData,
} from "express-validator";

// ========================================
// Validar resultado
// ========================================

const validarResultado = (
  req,
  res,
  next
) => {
  const errores =
    validationResult(req);

  if (!errores.isEmpty()) {
    return res.status(400).json({
      mensaje: "Datos inválidos",
      errores: errores.array(),
    });
  }

  req.datosValidados =
    matchedData(req);

  next();
};

// ========================================
// POST - Crear usuario
// ========================================

const validarCrearUsuario = [
  body("nombre")
    .trim()
    .notEmpty()
    .withMessage(
      "El nombre es obligatorio"
    )
    .isLength({
      min: 3,
      max: 100,
    })
    .withMessage(
      "El nombre debe tener entre 3 y 100 caracteres"
    ),

  body("email")
    .trim()
    .notEmpty()
    .withMessage(
      "El email es obligatorio"
    )
    .isEmail()
    .withMessage(
      "El email no es válido"
    )
    .normalizeEmail(),

  body("password")
    .notEmpty()
    .withMessage(
      "La contraseña es obligatoria"
    )
    .isLength({ min: 6 })
    .withMessage(
      "La contraseña debe tener mínimo 6 caracteres"
    ),

  body("rol")
    .notEmpty()
    .withMessage(
      "El rol es obligatorio"
    )
    .isIn([
      "administrador",
      "medico",
      "paciente",
    ])
    .withMessage(
      "El rol no es válido"
    ),

  body("activo")
    .notEmpty()
    .withMessage(
      "El campo activo es obligatorio"
    )
    .isBoolean()
    .withMessage(
      "Activo debe ser booleano"
    )
    .toBoolean(),

  validarResultado,
];

// ========================================
// PUT - Actualización completa
// ========================================

const validarActualizarUsuario = [
  body("nombre")
    .trim()
    .notEmpty()
    .withMessage(
      "El nombre es obligatorio"
    )
    .isLength({
      min: 3,
      max: 100,
    })
    .withMessage(
      "El nombre debe tener entre 3 y 100 caracteres"
    ),

  body("email")
    .trim()
    .notEmpty()
    .withMessage(
      "El email es obligatorio"
    )
    .isEmail()
    .withMessage(
      "El email no es válido"
    )
    .normalizeEmail(),

  body("password")
    .notEmpty()
    .withMessage(
      "La contraseña es obligatoria"
    )
    .isLength({ min: 6 })
    .withMessage(
      "La contraseña debe tener mínimo 6 caracteres"
    ),

  body("rol")
    .notEmpty()
    .withMessage(
      "El rol es obligatorio"
    )
    .isIn([
      "administrador",
      "medico",
      "paciente",
    ])
    .withMessage(
      "El rol no es válido"
    ),

  body("activo")
    .notEmpty()
    .withMessage(
      "El campo activo es obligatorio"
    )
    .isBoolean()
    .withMessage(
      "Activo debe ser booleano"
    )
    .toBoolean(),

  validarResultado,
];

// ========================================
// PATCH - Actualización parcial
// ========================================

const validarActualizarParcial = [
  body("nombre")
    .optional()
    .trim()
    .isLength({
      min: 3,
      max: 100,
    })
    .withMessage(
      "El nombre debe tener entre 3 y 100 caracteres"
    ),

  body("email")
    .optional()
    .trim()
    .isEmail()
    .withMessage(
      "El email no es válido"
    )
    .normalizeEmail(),

  body("password")
    .optional()
    .isLength({ min: 6 })
    .withMessage(
      "La contraseña debe tener mínimo 6 caracteres"
    ),

  body("rol")
    .optional()
    .isIn([
      "administrador",
      "medico",
      "paciente",
    ])
    .withMessage(
      "El rol no es válido"
    ),

  body("activo")
    .optional()
    .isBoolean()
    .withMessage(
      "Activo debe ser booleano"
    )
    .toBoolean(),

  validarResultado,
];

export {
  validarCrearUsuario,
  validarActualizarUsuario,
  validarActualizarParcial,
};
