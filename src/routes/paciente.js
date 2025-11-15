const express = require("express");
const router = express.Router();
const db = require("../db");

function isValidISODate(dateStr) {
    
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return false;

    const [y, m, d] = dateStr.split("-").map(Number);

    const date = new Date(dateStr);
    
    if (isNaN(date.getTime())) return false;

    
    return (date.getFullYear() === y && date.getMonth() + 1 === m && date.getDate() === d);
}

function validaCPF(cpf) {
    if (typeof cpf !== "string") return false;
    
    cpf = cpf.replace(/[^\d]+/g, "");

    if (cpf.length !== 11) return false;

    if (/^(\d)\1{10}$/.test(cpf)) return false;

    let soma = 0;
    let resto;

    for (let i = 1; i <= 9; i++) {
        soma += parseInt(cpf.substring(i - 1, i)) * (11 - i);
    }
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpf.substring(9, 10))) return false;

    soma = 0;

    for (let i = 1; i <= 10; i++) {
        soma += parseInt(cpf.substring(i - 1, i)) * (12 - i);
    }
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpf.substring(10, 11))) return false;

    return true;
}

/**
 * @swagger
 * /paciente:
 *   get:
 *     summary: Retorna todos os pacientes cadastrados.
 *     description: Busca todos os registros da tabela PACIENTE.
 *     tags: [Pacientes]
 *     responses:
 *       200:
 *         description: Lista de pacientes retornada com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   oneOf:
 *                     - type: string
 *                       example: "Nenhum paciente cadastrado."
 *                     - type: array
 *                       items:
 *                         $ref: '#/components/schemas/Paciente'
 *             examples:
 *               com_pacientes:
 *                 value:
 *                   msg:
 *                     - id_paciente: 1
 *                       nome: "João Silva"
 *                       cpf: "12345678900"
 *                       data_nascimento: "1990-05-15"
 *                       endereco: "Rua das Flores, 123"
 *               vazio:
 *                 value:
 *                   msg: "Nenhum paciente cadastrado."
 *       500:
 *         description: Erro ao buscar pacientes.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *             examples:
 *               exemplo:
 *                 value:
 *                   msg: "Erro ao buscar pacientes."
 */

router.get("/", async (req, res) => {
    try {
        const result = await db.query("SELECT * FROM PACIENTE ORDER BY id_paciente");

        if (result.rowCount === 0) {
            return res.status(200).json({ msg: "Nenhum paciente cadastrado." });
        }

        return res.status(200).json({ msg: result.rows });
    } catch (error) {
        console.error("Erro ao buscar pacientes:", error);
        return res.status(500).json({ msg: "Erro interno ao buscar pacientes." });
    }
});


/**
 * @swagger
 * /paciente/{id}:
 *   get:
 *     summary: Retorna um paciente específico.
 *     description: Busca um paciente pelo ID informado.
 *     tags: [Pacientes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID do paciente.
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Paciente retornado com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   $ref: '#/components/schemas/Paciente'
 *             examples:
 *               sucesso:
 *                 value:
 *                   msg:
 *                     id_paciente: 1
 *                     nome: "João Silva"
 *                     cpf: "12345678900"
 *                     data_nascimento: "1990-05-15"
 *                     endereco: "Rua das Flores, 123"
 *       400:
 *         description: ID inválido fornecido.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *             examples:
 *               id_invalido:
 *                 value:
 *                   msg: "Informe um id_paciente válido."
 *       404:
 *         description: Paciente não encontrado.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *             examples:
 *               nao_encontrado:
 *                 value:
 *                   msg: "Paciente não cadastrado no banco."
 *       500:
 *         description: Erro interno ao buscar paciente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *             examples:
 *               erro_interno:
 *                 value:
 *                   msg: "Erro interno ao buscar paciente."
 */


router.get("/:id", async (req, res) => {
    const id = Number(req.params.id);

    if (Number.isNaN(id) || id <= 0) {
        return res.status(400).json({ msg: "Informe um id_paciente válido." });
    }

    try {
        const busca = await db.query("SELECT * FROM PACIENTE WHERE id_paciente = $1", [id]);

        if (busca.rowCount === 0) {
            return res.status(404).json({ msg: "Paciente não cadastrado no banco." });
        }

        return res.status(200).json({ msg: busca.rows[0] });
    } catch (error) {
        console.error("Erro ao buscar paciente:", error);
        return res.status(500).json({ msg: "Erro interno ao buscar paciente." });
    }
});


/**
 * @swagger
 * /paciente:
 *   post:
 *     summary: Cadastra um novo paciente.
 *     description: Insere um novo registro na tabela PACIENTE. Campos obrigatórios nome, cpf, data_nascimento, endereco. O CPF deve ser único.
 *     tags: [Pacientes]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nome
 *               - cpf
 *               - data_nascimento
 *               - endereco
 *             properties:
 *               nome:
 *                 type: string
 *                 example: "Maria Souza"
 *               cpf:
 *                 type: string
 *                 example: "98765432100"
 *               data_nascimento:
 *                 type: string
 *                 format: date
 *                 example: "1985-09-12"
 *               endereco:
 *                 type: string
 *                 example: "Av. Central, 45"
 *     responses:
 *       201:
 *         description: Paciente cadastrado com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   $ref: '#/components/schemas/Paciente'
 *             examples:
 *               sucesso:
 *                 value:
 *                   msg:
 *                     id_paciente: 2
 *                     nome: "Maria Souza"
 *                     cpf: "98765432100"
 *                     data_nascimento: "1985-09-12"
 *                     endereco: "Av. Central, 45"
 *       400:
 *         description: Dados inválidos ou CPF já cadastrado.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *             examples:
 *               campos_faltando:
 *                 value:
 *                   msg: "Campos obrigatórios ausentes. Envie nome, cpf, data_nascimento e endereco."
 *               cpf_duplicado:
 *                 value:
 *                   msg: "CPF já cadastrado para outro paciente."
 *               data_invalida:
 *                 value:
 *                   msg: "Data de nascimento inválida."
 *       500:
 *         description: Erro interno ao cadastrar paciente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *             examples:
 *               erro:
 *                 value:
 *                   msg: "Erro interno ao cadastrar paciente."
 */

router.post("/", async (req, res) => {
    const { nome, cpf, data_nascimento, endereco } = req.body;

    if (!nome || !cpf || !data_nascimento || !endereco) {
        return res.status(400).json({
            msg: "Campos obrigatórios ausentes. Envie nome, cpf, data_nascimento e endereco."
        });
    }

    if (!validaCPF(cpf)) {
        return res.status(400).json({ msg: "CPF inválido." });
    }

    if (!isValidISODate(String(data_nascimento))) {
        return res.status(400).json({ msg: "Data de nascimento inválida." });
    }

    try {
        const cpfExist = await db.query("SELECT 1 FROM PACIENTE WHERE cpf = $1", [cpf]);
        if (cpfExist.rowCount > 0) {
            return res.status(400).json({ msg: "CPF já cadastrado para outro paciente." });
        }

        const insert = await db.query(
            "INSERT INTO PACIENTE(nome, cpf, data_nascimento, endereco) VALUES($1, $2, $3, $4) RETURNING *",
            [nome, cpf, data_nascimento, endereco]
        );

        return res.status(201).json({ msg: insert.rows[0] });
    } catch (error) {
        console.error("Erro ao cadastrar paciente:", error);
        return res.status(500).json({ msg: "Erro interno ao cadastrar paciente." });
    }
});

/**
 * @swagger
 * /paciente/{id}:
 *   delete:
 *     summary: Remove um paciente do sistema.
 *     description: Exclui o registro de um paciente existente com base no ID informado na URL.
 *     tags: [Pacientes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID do paciente que será removido.
 *         schema:
 *           type: integer
 *           example: 3
 *     responses:
 *       200:
 *         description: Paciente removido com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   $ref: '#/components/schemas/Paciente'
 *             examples:
 *               sucesso:
 *                 value:
 *                   msg:
 *                     id_paciente: 3
 *                     nome: "Carlos Lima"
 *                     cpf: "44455566677"
 *                     data_nascimento: "1992-07-10"
 *                     endereco: "Rua A, 22"
 *       400:
 *         description: ID inválido fornecido.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *             examples:
 *               id_invalido:
 *                 value:
 *                   msg: "Informe um id_paciente válido."
 *       404:
 *         description: Paciente não encontrado.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *             examples:
 *               nao_encontrado:
 *                 value:
 *                   msg: "Paciente não cadastrado no banco."
 *       500:
 *         description: Erro interno ao remover paciente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *             examples:
 *               erro:
 *                 value:
 *                   msg: "Erro ao remover paciente do banco."
 */

router.delete("/:id", async (req, res) => {
    const id = Number(req.params.id);

    if (Number.isNaN(id) || id <= 0) {
        return res.status(400).json({ msg: "Informe um id_paciente válido." });
    }

    try {
        const busca = await db.query("SELECT * FROM PACIENTE WHERE id_paciente = $1", [id]);

        if (busca.rowCount === 0) {
            return res.status(404).json({ msg: "Paciente não cadastrado no banco." });
        }

        const del = await db.query("DELETE FROM PACIENTE WHERE id_paciente = $1 RETURNING *", [id]);

        return res.status(200).json({ msg: del.rows[0] });
    } catch (error) {
        console.error("Erro ao deletar paciente:", error);
        return res.status(500).json({ msg: "Erro ao remover paciente do banco." });
    }
});

/**
 * @swagger
 * /paciente/{id}:
 *   put:
 *     summary: Atualiza os dados de um paciente existente.
 *     description: Atualiza as informações de um paciente já cadastrado no sistema. O ID do paciente deve ser informado na URL.
 *     tags: [Pacientes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID do paciente que será atualizado.
 *         schema:
 *           type: integer
 *           example: 2
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nome
 *               - cpf
 *               - data_nascimento
 *               - endereco
 *             properties:
 *               nome:
 *                 type: string
 *                 example: "Maria Souza"
 *               cpf:
 *                 type: string
 *                 example: "98765432100"
 *               data_nascimento:
 *                 type: string
 *                 format: date
 *                 example: "1985-09-12"
 *               endereco:
 *                 type: string
 *                 example: "Rua Nova, 789"
 *     responses:
 *       200:
 *         description: Paciente atualizado com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   $ref: '#/components/schemas/Paciente'
 *             examples:
 *               sucesso:
 *                 value:
 *                   msg:
 *                     id_paciente: 2
 *                     nome: "Maria Souza"
 *                     cpf: "98765432100"
 *                     data_nascimento: "1985-09-12"
 *                     endereco: "Rua Nova, 789"
 *       400:
 *         description: Dados inválidos, campos obrigatórios ausentes, CPF inválido ou CPF duplicado.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *             examples:
 *               id_invalido:
 *                 value:
 *                   msg: "Informe um id_paciente válido."
 *               campos_faltando:
 *                 value:
 *                   msg: "Campos obrigatórios ausentes. Envie nome, cpf, data_nascimento e endereco."
 *               cpf_invalido:
 *                 value:
 *                   msg: "CPF inválido."
 *               cpf_duplicado:
 *                 value:
 *                   msg: "CPF já cadastrado para outro paciente."
 *               data_invalida:
 *                 value:
 *                   msg: "Data de nascimento inválida."
 *       404:
 *         description: Paciente não encontrado.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *             examples:
 *               nao_encontrado:
 *                 value:
 *                   msg: "Paciente não cadastrado no banco."
 *       500:
 *         description: Erro interno ao atualizar paciente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *             examples:
 *               erro_interno:
 *                 value:
 *                   msg: "Erro ao atualizar paciente no banco."
 */

router.put("/:id", async (req, res) => {
    const id = Number(req.params.id);
    const { nome, cpf, data_nascimento, endereco } = req.body;

    if (Number.isNaN(id) || id <= 0) {
        return res.status(400).json({ msg: "Informe um id_paciente válido." });
    }

    if (!nome || !cpf || !data_nascimento || !endereco) {
        return res.status(400).json({ msg: "Campos obrigatórios ausentes. Envie nome, cpf, data_nascimento e endereco." });
    }

    if (!validaCPF(cpf)) {
        return res.status(400).json({ msg: "CPF inválido." });
    }

    if (!isValidISODate(String(data_nascimento))) {
        return res.status(400).json({ msg: "Data de nascimento inválida." });
    }

    try {
        const busca = await db.query("SELECT * FROM PACIENTE WHERE id_paciente = $1", [id]);
        if (busca.rowCount === 0) {
            return res.status(404).json({ msg: "Paciente não cadastrado no banco." });
        }

        const cpfExist = await db.query("SELECT * FROM PACIENTE WHERE cpf = $1 AND id_paciente <> $2", [cpf, id]);
        if (cpfExist.rowCount > 0) {
            return res.status(400).json({ msg: "CPF já cadastrado para outro paciente." });
        }

        const update = await db.query("UPDATE PACIENTE SET nome = $1, cpf = $2, data_nascimento = $3, endereco = $4 WHERE id_paciente = $5 RETURNING *", [nome, cpf, data_nascimento, endereco, id]);

        return res.status(200).json({ msg: update.rows[0] });
    } catch (error) {
        console.error("Erro ao atualizar paciente:", error);
        return res.status(500).json({ msg: "Erro ao atualizar paciente no banco." });
    }
});


module.exports = router;