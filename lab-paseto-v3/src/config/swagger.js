import swaggerJsdoc
  from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.0",

    info: {
      title:
        "API PASETO V3",
      version: "3.0.0",
      description:
        "API REST CRUD con autenticación PASETO v4.public, autorización por roles y validaciones",
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
