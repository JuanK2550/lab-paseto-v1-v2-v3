import express from "express";
import dotenv from "dotenv";

import authRoutes from "./routes/auth.routes.js";

// ========================================
// Configuración de variables de entorno
// ========================================

dotenv.config();

// ========================================
// Configuración de Express
// ========================================

const app = express();

app.use(express.json());

// ========================================
// Rutas
// ========================================
app.get("/", (req, res) => {
  res.json({
    lab: "Lab PASETO",
    version: process.env.npm_package_version || "No especificada",
  });
});

app.use("/api/auth", authRoutes);

// ========================================
// Servidor
// ========================================

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(
    `Servidor ejecutándose en http://localhost:${PORT}`
  );
});
