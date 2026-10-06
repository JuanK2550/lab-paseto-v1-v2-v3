import express from "express";
import dotenv from "dotenv";

import swaggerUi
  from "swagger-ui-express";

import swaggerSpec
  from "./config/swagger.js";

import authRoutes
  from "./routes/auth.routes.js";

import usuariosRoutes
  from "./routes/usuarios.routes.js";

// ========================================
// Variables de entorno
// ========================================

dotenv.config();

// ========================================
// Express
// ========================================

const app = express();

app.use(express.json());

// ========================================
// Swagger
// ========================================

app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec)
);

// ========================================
// Rutas
// ========================================

app.use(
  "/api/auth",
  authRoutes
);

app.use(
  "/api/usuarios",
  usuariosRoutes
);

// ========================================
// Servidor
// ========================================

const PORT =
  process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(
    `Servidor ejecutándose en http://localhost:${PORT}`
  );

  console.log(
    `Swagger disponible en http://localhost:${PORT}/api-docs`
  );
});
