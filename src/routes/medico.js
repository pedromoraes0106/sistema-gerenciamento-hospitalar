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

/**
 * @swagger
 * /medico:
 *   get:
 *     summary: Retorna todos os médicos cadastrados.
 *     description: Busca todos os registros da tabela MEDICO.
 *     tags: [Médicos]
 *     responses:
 *       200:
 *         description: Lista de médicos retornada com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Medico'
 *             examples:
 *               com_medicos:
 *                 value:
 *                   msg:
 *                     - id_medico: 1
 *                       nome: "Dr. João"
 *                       crm: "12345"
 *                       especialidade: "Cardiologia"
 *                       data_contratacao: "2020-01-10"
 *                       id_departamento: 2
 *               vazio:
 *                 value:
 *                   msg: []
 *       500:
 *         description: Erro ao buscar médicos.
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
 *                   msg: "Erro ao buscar médicos."
 */


router.get("/", async (req, res) => {
    try {
        const result = await db.query("SELECT * FROM medico ORDER BY id_medico");

        if (result.rowCount === 0) {
            return res.status(200).json({ msg: "Nenhum médico cadastrado." });
        }

        return res.status(200).json({ msg: result.rows });
    } catch (error) {
        console.error("Erro ao buscar médicos:", error);
        return res.status(500).json({ msg: "Erro interno ao buscar médicos." });
    }
});

/**
 * @swagger
 * /medico/{id}:
 *   get:
 *     summary: Retorna um médico específico.
 *     description: Busca um médico pelo seu ID. Retorna um objeto com os dados do médico se encontrado.
 *     tags: [Médicos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID do médico.
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Médico encontrado com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   $ref: '#/components/schemas/Medico'
 *             examples:
 *               exemplo:
 *                 value:
 *                   msg:
 *                     id_medico: 1
 *                     nome: "Dr. João"
 *                     crm: "12345"
 *                     especialidade: "Cardiologia"
 *                     data_contratacao: "2020-01-10"
 *                     id_departamento: 2
 *       400:
 *         description: ID do médico inválido.
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
 *                   msg: "Informe um id_medico válido."
 *       404:
 *         description: Médico não encontrado.
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
 *                   msg: "Médico não cadastrado no banco."
 *       500:
 *         description: Erro interno ao buscar médico.
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
 *                   msg: "Erro interno ao buscar médico."
 */

router.get("/:id", async (req, res) => {
    const id = Number(req.params.id);
    if (Number.isNaN(id) || id <= 0) {
        return res.status(400).json({ msg: "Informe um id_medico válido." });
    }

    try {
        const busca = await db.query("SELECT * FROM medico WHERE id_medico = $1", [id]);

        if (busca.rowCount === 0) {
            return res.status(404).json({ msg: "Médico não cadastrado no banco." });
        }

        return res.status(200).json({ msg: busca.rows[0] });
    } catch (error) {
        console.error("Erro ao buscar médico:", error);
        return res.status(500).json({ msg: "Erro interno ao buscar médico." });
    }
});


/**
 * @swagger
 * /medico:
 *   post:
 *     summary: Cadastra um novo médico.
 *     description: Insere um novo registro na tabela MEDICO. Os campos obrigatórios são nome, crm, especialidade, data_contratacao e id_departamento. O CRM deve ser único e o id_departamento deve existir.
 *     tags: [Médicos]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Medico'
 *           examples:
 *             exemplo:
 *               value:
 *                 nome: "Dra. Maria"
 *                 crm: "67890"
 *                 especialidade: "Pediatria"
 *                 data_contratacao: "2023-05-12"
 *                 id_departamento: 3
 *     responses:
 *       201:
 *         description: Médico cadastrado com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   $ref: '#/components/schemas/Medico'
 *             examples:
 *               exemplo:
 *                 value:
 *                   msg:
 *                     id_medico: 5
 *                     nome: "Dra. Maria"
 *                     crm: "67890"
 *                     especialidade: "Pediatria"
 *                     data_contratacao: "2023-05-12"
 *                     id_departamento: 3
 *       400:
 *         description: Campos inválidos, CRM duplicado ou departamento inexistente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *             examples:
 *               campo_ausente:
 *                 value: { msg: "Campos obrigatórios ausentes. Envie nome, crm, especialidade, data_contratacao e id_departamento." }
 *               crm_duplicado:
 *                 value: { msg: "CRM informado já está cadastrado." }
 *               dept_inexistente:
 *                 value: { msg: "id_departamento informado não existe." }
 *       500:
 *         description: Erro ao cadastrar médico.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *             examples:
 *               erro_interno:
 *                 value: { msg: "Erro interno ao cadastrar médico." }
 */

router.post("/", async (req,res) => {
    const { nome, crm, especialidade, data_contratacao, id_departamento } = req.body;

    if (!nome || !crm || !especialidade || !data_contratacao || !id_departamento) {
        return res.status(400).json({ msg: "Campos obrigatórios ausentes. Envie nome, crm, especialidade, data_contratacao e id_departamento." });
    }

    if (isNaN(Number(id_departamento)) || Number(id_departamento) <= 0) {
        return res.status(400).json({ msg: "id_departamento inválido." });
    }

    if (!isValidISODate(String(data_contratacao))) {
        return res.status(400).json({ msg: "Data inválida. Use YYYY-MM-DD." });
    }

    try {
        const dept = await db.query("SELECT 1 FROM departamento WHERE id_departamento = $1", [id_departamento]);
        if (dept.rowCount === 0) {
            return res.status(400).json({ msg: "id_departamento informado não existe." });
        }

        const crmExist = await db.query("SELECT 1 FROM medico WHERE crm = $1", [crm]);
        if (crmExist.rowCount > 0) {
            return res.status(400).json({ msg: "CRM informado já está cadastrado." });
        }

        const insert = await db.query("INSERT INTO medico(nome, crm, especialidade, data_contratacao, id_departamento) VALUES($1, $2, $3, $4, $5) RETURNING *", [nome, crm, especialidade, data_contratacao, id_departamento]);

        return res.status(201).json({ msg: insert.rows[0] });
    } catch (error) {
        console.error("Erro ao inserir médico:", error);
        return res.status(500).json({ msg: "Erro interno ao cadastrar médico." });
    }
});


/**
 * @swagger
 * /medico/{id}:
 *   delete:
 *     summary: Remove um médico do sistema.
 *     description: Exclui o registro de um médico existente com base no ID informado na URL.
 *     tags: [Médicos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID do médico que será removido.
 *         schema:
 *           type: integer
 *           example: 4
 *     responses:
 *       200:
 *         description: Médico removido com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   $ref: '#/components/schemas/Medico'
 *             examples:
 *               exemplo:
 *                 value:
 *                   msg:
 *                     id_medico: 4
 *                     nome: "Dr. Carlos"
 *                     crm: "22222"
 *                     especialidade: "Ortopedia"
 *                     data_contratacao: "2019-02-14"
 *                     id_departamento: 3
 *       400:
 *         description: ID inválido.
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
 *                   msg: "Informe um id_medico válido."
 *       404:
 *         description: Médico não encontrado.
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
 *                   msg: "Médico não cadastrado no banco."
 *       500:
 *         description: Erro interno ao remover médico.
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
 *                   msg: "Erro ao deletar médico."
 */

router.delete("/:id", async (req, res) => {
    const id = Number(req.params.id);

    if (Number.isNaN(id) || id <= 0) {
        return res.status(400).json({ msg: "Informe um id_medico válido." });
    }

    try {
        const busca = await db.query("SELECT * FROM MEDICO WHERE id_medico = $1", [id]);

        if (busca.rowCount === 0) {
            return res.status(404).json({ msg: "Médico não cadastrado no banco" });
        }

        const del = await db.query("DELETE FROM MEDICO WHERE id_medico = $1 RETURNING *", [id]);

        return res.status(200).json({ msg: del.rows[0] });
    } catch (error) {
        console.error("Erro ao deletar médico:", error);
        return res.status(500).json({ msg: error.message });
    }
});


/**
 * @swagger
 * /medico/{id}:
 *   put:
 *     summary: Atualiza os dados de um médico existente.
 *     description: Atualiza as informações de um médico já cadastrado no sistema. O ID do médico deve ser informado na URL.
 *     tags: [Médicos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID do médico que será atualizado.
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
 *               - crm
 *               - especialidade
 *               - data_contratacao
 *               - id_departamento
 *             properties:
 *               nome:
 *                 type: string
 *                 example: "Dr. Pedro"
 *               crm:
 *                 type: string
 *                 example: "11111"
 *               especialidade:
 *                 type: string
 *                 example: "Neurologia"
 *               data_contratacao:
 *                 type: string
 *                 format: date
 *                 example: "2021-08-20"
 *               id_departamento:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       200:
 *         description: Médico atualizado com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   $ref: '#/components/schemas/Medico'
 *             examples:
 *               sucesso:
 *                 value:
 *                   msg:
 *                     id_medico: 2
 *                     nome: "Dr. Pedro"
 *                     crm: "11111"
 *                     especialidade: "Neurologia"
 *                     data_contratacao: "2021-08-20"
 *                     id_departamento: 1
 *       400:
 *         description: Dados inválidos, campos obrigatórios ausentes, CRM duplicado, data inválida ou departamento inexistente.
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
 *                   msg: "Informe um id_medico válido."
 *               campos_faltando:
 *                 value:
 *                   msg: "Campos obrigatórios ausentes. Envie nome, crm, especialidade, data_contratacao e id_departamento."
 *               crm_duplicado:
 *                 value:
 *                   msg: "CRM já cadastrado para outro médico."
 *               data_invalida:
 *                 value:
 *                   msg: "Data de contratação inválida."
 *               dept_inexistente:
 *                 value:
 *                   msg: "id_departamento informado não existe."
 *       404:
 *         description: Médico não encontrado.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *             examples:
 *               medico_nao_encontrado:
 *                 value:
 *                   msg: "Médico não cadastrado no banco."
 *       500:
 *         description: Erro interno ao atualizar médico.
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
 *                   msg: "Erro ao atualizar médico no banco."
 */


router.put("/:id", async (req, res) => {
    const id = Number(req.params.id);
    const { nome, crm, especialidade, data_contratacao, id_departamento } = req.body;

    if (Number.isNaN(id) || id <= 0) {
        return res.status(400).json({ msg: "Informe um id_medico válido." });
    }

    if (!nome || !crm || !especialidade || !data_contratacao || !id_departamento) {
        return res.status(400).json({ msg: "Campos obrigatórios ausentes. Envie nome, crm, especialidade, data_contratacao e id_departamento." });
    }

    if (!isValidISODate(String(data_contratacao))) {
        return res.status(400).json({ msg: "Data de contratação inválida." });
    }

    if (isNaN(Number(id_departamento)) || Number(id_departamento) <= 0) {
        return res.status(400).json({ msg: "id_departamento inválido." });
    }

    try {
        const busca = await db.query("SELECT * FROM MEDICO WHERE id_medico = $1", [id]);
        if (busca.rowCount === 0) {
            return res.status(404).json({ msg: "Médico não cadastrado no banco." });
        }

        const dept = await db.query("SELECT 1 FROM DEPARTAMENTO WHERE id_departamento = $1", [id_departamento]);
        if (dept.rowCount === 0) {
            return res.status(400).json({ msg: "id_departamento informado não existe." });
        }

        const crmExist = await db.query("SELECT * FROM MEDICO WHERE crm = $1 AND id_medico <> $2", [crm, id]);
        if (crmExist.rowCount > 0) {
            return res.status(400).json({ msg: "CRM já cadastrado para outro médico." });
        }

        const update = await db.query("UPDATE MEDICO SET nome = $1, crm = $2, especialidade = $3, data_contratacao = $4, id_departamento = $5 WHERE id_medico = $6 RETURNING *", [nome, crm, especialidade, data_contratacao, id_departamento, id]);

        return res.status(200).json({ msg: update.rows[0] });
    } catch (error) {
        console.error("Erro ao atualizar médico:", error);
        return res.status(500).json({ msg: "Erro ao atualizar médico no banco." });
    }
});


module.exports = router;