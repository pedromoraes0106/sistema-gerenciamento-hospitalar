const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Sistema de Gerenciamento Hospitalar",
      version: "1.0.0",
      description: "Documentação da API do Sistema de Gerenciamento Hospitalar",
    },
  },
  apis: ["./src/routes/*.js"], // Caminho onde estão os arquivos de rotas a serem processados
};

const specs = swaggerJsdoc(options);

module.exports = { swaggerUi, specs };
