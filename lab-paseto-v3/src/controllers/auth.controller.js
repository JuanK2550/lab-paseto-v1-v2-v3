import { PublicProtocol } from "paseto";

import {
  GenerateKeyPairFactory,
  SignFactory,
} from "paseto/v4/public";

import usuarios from "../data/usuarios.js";

// ========================================
// Configuración PASETO v4.public
// ========================================

const v4 = new PublicProtocol(
  GenerateKeyPairFactory,
  SignFactory
);

let clavePrivada;
let clavePublica;

// ========================================
// Inicialización de claves
// ========================================

const inicializarClaves = async () => {
  try {
    const claves = await v4.GenerateKeyPair();

    clavePrivada = claves.secretKey;
    clavePublica = claves.publicKey;

    console.log("Claves PASETO generadas");
  } catch (error) {
    console.error(
      "Error generando claves PASETO:",
      error.message
    );
  }
};

await inicializarClaves();

// ========================================
// Login
// ========================================

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const usuario = usuarios.find(
      (u) => u.email === email
    );

    if (!usuario) {
      return res.status(401).json({
        mensaje: "Credenciales inválidas",
      });
    }

    if (usuario.password !== password) {
      return res.status(401).json({
        mensaje: "Credenciales inválidas",
      });
    }

    if (!usuario.activo) {
      return res.status(403).json({
        mensaje: "Usuario deshabilitado",
      });
    }

    const token = await v4.Sign(
      clavePrivada,
      {
        sub: String(usuario.id),
        email: usuario.email,
        rol: usuario.rol,
      }
    );

    return res.status(200).json({
      mensaje: "Login correcto",
      token,
    });

  } catch (error) {
    return res.status(500).json({
      mensaje: "Error generando PASETO",
      error: error.message,
    });
  }
};

// ========================================
// Obtener clave pública
// ========================================

const obtenerClavePublica = () =>
  clavePublica;

// ========================================
// Perfil
// ========================================

const perfil = (req, res) => {
  const usuario = usuarios.find(
    (u) =>
      String(u.id) === req.usuario.sub
  );

  if (!usuario) {
    return res.status(404).json({
      mensaje: "Usuario no encontrado",
    });
  }

  return res.status(200).json({
    id: usuario.id,
    nombre: usuario.nombre,
    email: usuario.email,
    rol: usuario.rol,
    activo: usuario.activo,
  });
};

export {
  login,
  perfil,
  obtenerClavePublica,
};
