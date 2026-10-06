import usuarios
  from "../data/usuarios.js";

// ========================================
// Listar usuarios
// ========================================

const listarUsuarios = (req, res) => {

  const resultado = usuarios.map(
    ({
      password,
      ...usuarioSeguro
    }) => usuarioSeguro
  );

  return res.status(200).json(
    resultado
  );
};

// ========================================
// Obtener usuario por ID
// ========================================

const obtenerUsuario = (req, res) => {

  const id = Number(req.params.id);

  const usuario = usuarios.find(
    (u) => u.id === id
  );

  if (!usuario) {
    return res.status(404).json({
      mensaje:
        "Usuario no encontrado",
    });
  }

  const {
    password,
    ...usuarioSeguro
  } = usuario;

  return res.status(200).json(
    usuarioSeguro
  );
};

export {
  listarUsuarios,
  obtenerUsuario,
};
