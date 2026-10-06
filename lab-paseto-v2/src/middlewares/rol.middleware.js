const autorizarRoles =
  (...rolesPermitidos) => {

    return (req, res, next) => {

      if (!req.usuario) {
        return res.status(401).json({
          mensaje:
            "Usuario no autenticado",
        });
      }

      if (
        !rolesPermitidos.includes(
          req.usuario.rol
        )
      ) {
        return res.status(403).json({
          mensaje:
            "No tiene permisos para acceder a este recurso",
        });
      }

      next();
    };
  };

export default autorizarRoles;
