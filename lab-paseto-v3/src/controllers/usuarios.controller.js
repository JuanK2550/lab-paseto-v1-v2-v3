import usuarios
  from "../data/usuarios.js";

// ========================================
// Función auxiliar
// Ocultar password
// ========================================

const usuarioSeguro = (usuario) => {
  const {
    password,
    ...datosSeguros
  } = usuario;

  return datosSeguros;
};

// ========================================
// GET
// Listar usuarios
// ========================================

const listarUsuarios = (
  req,
  res
) => {
  const resultado =
    usuarios.map(usuarioSeguro);

  return res
    .status(200)
    .json(resultado);
};

// ========================================
// GET /:id
// Obtener usuario
// ========================================

const obtenerUsuario = (
  req,
  res
) => {
  const id =
    Number(req.params.id);

  const usuario =
    usuarios.find(
      (u) => u.id === id
    );

  if (!usuario) {
    return res.status(404).json({
      mensaje:
        "Usuario no encontrado",
    });
  }

  return res
    .status(200)
    .json(
      usuarioSeguro(usuario)
    );
};

// ========================================
// POST
// Crear usuario
// ========================================

const crearUsuario = (
  req,
  res
) => {
  const datos =
    req.datosValidados;

  const emailExiste =
    usuarios.some(
      (u) =>
        u.email === datos.email
    );

  if (emailExiste) {
    return res.status(409).json({
      mensaje:
        "El email ya está registrado",
    });
  }

  const nuevoId =
    usuarios.length > 0
      ? Math.max(
          ...usuarios.map(
            (u) => u.id
          )
        ) + 1
      : 1;

  const nuevoUsuario = {
    id: nuevoId,
    ...datos,
  };

  usuarios.push(
    nuevoUsuario
  );

  return res.status(201).json({
    mensaje: "Usuario creado",
    usuario:
      usuarioSeguro(
        nuevoUsuario
      ),
  });
};

// ========================================
// PUT
// Actualización completa
// ========================================

const actualizarUsuario = (
  req,
  res
) => {
  const id =
    Number(req.params.id);

  const indice =
    usuarios.findIndex(
      (u) => u.id === id
    );

  if (indice === -1) {
    return res.status(404).json({
      mensaje:
        "Usuario no encontrado",
    });
  }

  const datos =
    req.datosValidados;

  const emailExiste =
    usuarios.some(
      (u) =>
        u.email === datos.email &&
        u.id !== id
    );

  if (emailExiste) {
    return res.status(409).json({
      mensaje:
        "El email ya está registrado",
    });
  }

  const usuarioActualizado = {
    id,
    ...datos,
  };

  usuarios[indice] =
    usuarioActualizado;

  return res.status(200).json({
    mensaje:
      "Usuario actualizado completamente",
    usuario:
      usuarioSeguro(
        usuarioActualizado
      ),
  });
};

// ========================================
// PATCH
// Actualización parcial
// ========================================

const actualizarUsuarioParcial = (
  req,
  res
) => {
  const id =
    Number(req.params.id);

  const indice =
    usuarios.findIndex(
      (u) => u.id === id
    );

  if (indice === -1) {
    return res.status(404).json({
      mensaje:
        "Usuario no encontrado",
    });
  }

  const datos =
    req.datosValidados;

  if (
    Object.keys(datos).length === 0
  ) {
    return res.status(400).json({
      mensaje:
        "Debe proporcionar al menos un campo para actualizar",
    });
  }

  if (datos.email) {
    const emailExiste =
      usuarios.some(
        (u) =>
          u.email === datos.email &&
          u.id !== id
      );

    if (emailExiste) {
      return res.status(409).json({
        mensaje:
          "El email ya está registrado",
      });
    }
  }

  const usuarioActualizado = {
    ...usuarios[indice],
    ...datos,
    id,
  };

  usuarios[indice] =
    usuarioActualizado;

  return res.status(200).json({
    mensaje:
      "Usuario actualizado parcialmente",
    usuario:
      usuarioSeguro(
        usuarioActualizado
      ),
  });
};

// ========================================
// DELETE
// Eliminar usuario
// ========================================

const eliminarUsuario = (
  req,
  res
) => {
  const id =
    Number(req.params.id);

  const indice =
    usuarios.findIndex(
      (u) => u.id === id
    );

  if (indice === -1) {
    return res.status(404).json({
      mensaje:
        "Usuario no encontrado",
    });
  }

  usuarios.splice(
    indice,
    1
  );

  return res
    .status(204)
    .send();
};

// ========================================
// Exportaciones
// ========================================

export {
  listarUsuarios,
  obtenerUsuario,
  crearUsuario,
  actualizarUsuario,
  actualizarUsuarioParcial,
  eliminarUsuario,
};
