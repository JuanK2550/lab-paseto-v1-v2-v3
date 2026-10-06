import swaggerJsdoc
  from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.0",

    info: {
      title: "API PASETO V2",
      version: "2.0.0",
      description:
        "Laboratorio de autenticación y autorización con PASETO v4.public",
    },

    servers: [
      {
        url: "http://localhost:3000",
        description:
          "Servidor local",
      },
    ],

    components: {
      securitySchemes: {
        BearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "PASETO",
          description:
            "Ingrese el token PASETO v4.public",
        },
      },
    },
  },

  apis: [
    "./src/routes/*.js",
  ],
};

const swaggerSpec =
  swaggerJsdoc(options);

export default swaggerSpec;
