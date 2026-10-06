import { PublicProtocol } from "paseto";

import {
  GenerateKeyPairFactory,
  SignFactory,
} from "paseto/v4/public";

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
// Inicialización de claves PASETO
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

    // Usuario ficticio para el laboratorio
    if (
      email !== "admin@hospital.com" ||
      password !== "123456"
    ) {
      return res.status(401).json({
        mensaje: "Credenciales inválidas",
      });
    }

    // ========================================
    // Generar PASETO
    // ========================================

    const token = await v4.Sign(
      clavePrivada,
      {
        sub: "1",
        email: "admin@hospital.com",
        rol: "administrador",
      }
    );

    console.log("TOKEN GENERADO:", token);

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

const obtenerClavePublica = () => clavePublica;

// ========================================
// Exportaciones
// ========================================

export {
  login,
  obtenerClavePublica,
};
