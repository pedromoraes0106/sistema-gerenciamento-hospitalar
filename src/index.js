const express = require("express");
const cors = require("cors");
const { swaggerUi, specs } = require("./swagger");

const port = process.env.PORT || 3000;
const medico = require("./routes/medico");
const app = express();
const paciente = require("./routes/paciente");
const departamento = require("./routes/departamento");
const consulta = require("./routes/consulta");
  
app.use(express.json());
app.use(cors());

// Define endereço do swagger
app.use(
  "/api",
  swaggerUi.serve,
  swaggerUi.setup(specs, {
    customCss: ".swagger-ui .topbar { display: none }", // Remove a barra de identificação do swagger.
    customSiteTitle: "Documentação da API de exemplo",
  })
);

app.use("/medico", medico);
app.use("/paciente", paciente);
app.use("/departamento", departamento);
app.use("/consulta", consulta);

app.listen(port, () => {
  console.log(`Servidor executando em http://localhost:${port}`);
});