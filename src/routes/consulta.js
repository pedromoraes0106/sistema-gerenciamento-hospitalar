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
 * /consulta:
 *   get:
 *     summary: Retorna todas as consultas cadastradas.
 *     description: Busca todos os registros da tabela de consultas.
 *     tags: [Consultas]
 *     responses:
 *       200:
 *         description: Lista de consultas retornada com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id_consulta:
 *                         type: integer
 *                         example: 1
 *                       id_paciente:
 *                         type: integer
 *                         example: 3
 *                       id_medico:
 *                         type: integer
 *                         example: 2
 *                       data_consulta:
 *                         type: string
 *                         example: "2025-11-10"
 *                       duracao_min:
 *                         type: integer
 *                         example: 45
 *                       diagnostico:
 *                         type: string
 *                         example: "Hipertensão leve"
 *                       observacoes:
 *                         type: string
 *                         example: "Paciente orientado a retornar em 30 dias."
 *       500:
 *         description: Erro interno ao buscar consultas.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   example: "Erro ao buscar consultas."
 */


router.get("/", async (req, res) => {
    try {
        const result = await db.query("SELECT id_consulta, id_paciente, id_medico, data_consulta, duracao_min, diagnostico, observacoes FROM consulta");

        if (result.rows.length === 0) {
            return res.status(200).json({ msg: "Nenhuma consulta encontrada", data: [] });
        }

        res.status(200).json({ data: result.rows });
    } catch (error) {
        res.status(500).json({ msg: "Erro ao buscar consultas." });
    }
});

/**
 * @swagger
 * /consulta/{id}:
 *   get:
 *     summary: Retorna uma consulta específica.
 *     description: Busca uma consulta pelo seu ID.
 *     tags: [Consultas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID da consulta.
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Consulta encontrada com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     id_consulta:
 *                       type: integer
 *                       example: 1
 *                     id_paciente:
 *                       type: integer
 *                       example: 3
 *                     id_medico:
 *                       type: integer
 *                       example: 2
 *                     data_consulta:
 *                       type: string
 *                       example: "2025-11-10"
 *                     duracao_min:
 *                       type: integer
 *                       example: 45
 *                     diagnostico:
 *                       type: string
 *                       example: "Hipertensão leve"
 *                     observacoes:
 *                       type: string
 *                       example: "Paciente orientado a retornar em 30 dias."
 *       400:
 *         description: ID inválido fornecido pelo cliente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   example: "Informe um id_consulta válido"
 *       404:
 *         description: Consulta não encontrada.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   example: "Consulta não encontrada"
 *       500:
 *         description: Erro interno ao buscar consulta.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   example: "Erro ao consultar o banco."
 */

router.get("/:id", async (req, res) => {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) return res.status(400).json({ msg: "Informe um id_consulta válido" });

    try {
        const result = await db.query("SELECT * FROM consulta WHERE id_consulta = $1", [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ msg: "Consulta não encontrada" });
        }

        res.status(200).json({ data: result.rows[0] });
    } catch (error) {
        res.status(500).json({ msg: "Erro ao consultar o banco." });
    }
});


/**
 * @swagger
 * /consulta:
 *   post:
 *     summary: Cadastra uma nova consulta.
 *     description: Insere uma nova consulta na tabela. A data deve estar no formato YYYY-MM-DD e ser válida. O id_paciente e id_medico devem existir no banco. Não permite duplicidade de consulta para o mesmo paciente com o mesmo médico na mesma data.
 *     tags: [Consultas]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id_paciente
 *               - id_medico
 *               - data_consulta
 *               - duracao_min
 *             properties:
 *               id_paciente:
 *                 type: integer
 *                 example: 3
 *               id_medico:
 *                 type: integer
 *                 example: 2
 *               data_consulta:
 *                 type: string
 *                 example: "2025-11-10"
 *               duracao_min:
 *                 type: integer
 *                 example: 45
 *               diagnostico:
 *                 type: string
 *                 example: "Hipertensão leve"
 *               observacoes:
 *                 type: string
 *                 example: "Paciente deve fazer exames adicionais."
 *     responses:
 *       201:
 *         description: Consulta cadastrada com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     id_consulta:
 *                       type: integer
 *                       example: 10
 *                     id_paciente:
 *                       type: integer
 *                       example: 3
 *                     id_medico:
 *                       type: integer
 *                       example: 2
 *                     data_consulta:
 *                       type: string
 *                       example: "2025-11-10"
 *                     duracao_min:
 *                       type: integer
 *                       example: 45
 *                     diagnostico:
 *                       type: string
 *                       example: "Hipertensão leve"
 *                     observacoes:
 *                       type: string
 *                       example: "Paciente deve fazer exames adicionais."
 *       400:
 *         description: Parâmetros inválidos, IDs de paciente/médico inexistentes ou consulta duplicada.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   example: "Já existe uma consulta para esse paciente com esse médico na mesma data."
 *       500:
 *         description: Erro ao cadastrar consulta.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   example: "Erro ao inserir consulta no banco."
 */

router.post("/", async (req, res) => {
    const { id_paciente, id_medico, data_consulta, duracao_min, diagnostico, observacoes } = req.body;

    if (!id_paciente || !id_medico || !data_consulta || !duracao_min) {
        return res.status(400).json({ msg: "Parâmetros obrigatórios ausentes" });
    }

    if (isNaN(Number(id_paciente)) || isNaN(Number(id_medico))) {
        return res.status(400).json({ msg: "IDs devem ser números" });
    }

    if (!isValidISODate(data_consulta)) {
        return res.status(400).json({ msg: "Data inválida. Use o formato YYYY-MM-DD." });
    }

    try {
        const paciente = await db.query("SELECT 1 FROM paciente WHERE id_paciente = $1", [id_paciente]);
        if (paciente.rowCount === 0) {
            return res.status(400).json({ msg: "id_paciente informado não existe." });
        }

        const medico = await db.query("SELECT 1 FROM medico WHERE id_medico = $1", [id_medico]);
        if (medico.rowCount === 0) {
            return res.status(400).json({ msg: "id_medico informado não existe." });
        }

        const result = await db.query(
            `INSERT INTO consulta(id_paciente, id_medico, data_consulta, duracao_min, diagnostico, observacoes)
             VALUES ($1, $2, $3, $4, $5, $6)
             RETURNING *`,
            [id_paciente, id_medico, data_consulta, Number(duracao_min), diagnostico ?? null, observacoes ?? null]
        );

        return res.status(201).json({ data: result.rows[0] });

    } catch (error) {
        if (error.code === "23505") {
            return res.status(400).json({ msg: "Já existe uma consulta para esse paciente com esse médico na mesma data." });
        }

        console.error("Erro ao inserir consulta:", error);
        return res.status(500).json({ msg: "Erro ao inserir consulta no banco." });
    }
});


/**
 * @swagger
 * /consulta/{id}:
 *   delete:
 *     summary: Remove uma consulta existente.
 *     description: Exclui uma consulta do sistema com base no ID informado pela URL.
 *     tags: [Consultas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID da consulta que será removida.
 *         schema:
 *           type: integer
 *           example: 4
 *     responses:
 *       200:
 *         description: Consulta removida com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: object
 *                   properties:
 *                     id_consulta:
 *                       type: integer
 *                       example: 4
 *                     id_paciente:
 *                       type: integer
 *                       example: 3
 *                     id_medico:
 *                       type: integer
 *                       example: 2
 *                     data_consulta:
 *                       type: string
 *                       example: "2025-11-10"
 *                     duracao_min:
 *                       type: integer
 *                       example: 45
 *                     diagnostico:
 *                       type: string
 *                       example: "Infecção respiratória"
 *                     observacoes:
 *                       type: string
 *                       example: "Paciente apresentava sintomas leves."
 *       400:
 *         description: ID inválido fornecido.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   example: "Informe um id_consulta válido."
 *       404:
 *         description: Consulta não cadastrada no banco.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   example: "Consulta não cadastrada no banco"
 *       500:
 *         description: Erro ao remover consulta.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   example: "Erro interno ao excluir consulta."
 */

router.delete("/:id", async (req, res) => {
    const id = Number(req.params.id);

    if (Number.isNaN(id) || id <= 0) {
        return res.status(400).json({ msg: "Informe um id_consulta válido." });
    }

    try {
        const busca = await db.query("SELECT * FROM consulta WHERE id_consulta = $1", [id]);

        if (busca.rowCount === 0) {
            return res.status(404).json({ msg: "Consulta não cadastrada no banco" });
        }

        const del = await db.query("DELETE FROM consulta WHERE id_consulta = $1 RETURNING *", [id]);

        return res.status(200).json({ msg: del.rows[0] });
    } catch (error) {
        return res.status(500).json({ msg: error.message });
    }
});


/**
 * @swagger
 * /consulta/{id}:
 *   put:
 *     summary: Atualiza uma consulta existente.
 *     description: Atualiza as informações de uma consulta já cadastrada. O ID da consulta deve ser informado na URL. Os IDs de paciente e médico devem existir no banco. Não permite duplicidade de consulta para o mesmo paciente com o mesmo médico na mesma data.
 *     tags: [Consultas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID da consulta que será atualizada.
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
 *               - id_paciente
 *               - id_medico
 *               - data_consulta
 *               - duracao_min
 *             properties:
 *               id_paciente:
 *                 type: integer
 *                 example: 3
 *               id_medico:
 *                 type: integer
 *                 example: 2
 *               data_consulta:
 *                 type: string
 *                 example: "2025-11-12"
 *               duracao_min:
 *                 type: integer
 *                 example: 60
 *               diagnostico:
 *                 type: string
 *                 example: "Enxaqueca crônica"
 *               observacoes:
 *                 type: string
 *                 example: "Paciente em acompanhamento."
 *     responses:
 *       200:
 *         description: Consulta atualizada com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: object
 *                   properties:
 *                     id_consulta:
 *                       type: integer
 *                       example: 2
 *                     id_paciente:
 *                       type: integer
 *                       example: 3
 *                     id_medico:
 *                       type: integer
 *                       example: 2
 *                     data_consulta:
 *                       type: string
 *                       example: "2025-11-12"
 *                     duracao_min:
 *                       type: integer
 *                       example: 60
 *                     diagnostico:
 *                       type: string
 *                       example: "Enxaqueca crônica"
 *                     observacoes:
 *                       type: string
 *                       example: "Paciente em acompanhamento."
 *       400:
 *         description: Parâmetros inválidos, IDs de paciente/médico inexistentes ou tentativa de duplicidade.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   example: "Já existe uma consulta para esse paciente com esse médico na mesma data."
 *       404:
 *         description: Consulta não cadastrada no banco.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   example: "Consulta não cadastrada no banco"
 *       500:
 *         description: Erro interno ao atualizar consulta.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   example: "Erro interno ao atualizar consulta."
 */

router.put("/:id", async (req, res) => {
    const id = Number(req.params.id);
    const body = req.body;

    if (!body) {
        return res.status(400).json({ msg: "Parâmetros incorretos" });
    }

    if (Number.isNaN(id) || id <= 0) {
        return res.status(400).json({ msg: "Informe um id_consulta válido." });
    }

    const { id_paciente,  id_medico,  data_consulta, duracao_min, diagnostico, observacoes } = body;

    if (!id_paciente || !id_medico || !data_consulta || !duracao_min) {
        return res.status(400).json({ msg: "Campos obrigatórios ausentes. Envie id_paciente, id_medico, data_consulta, duracao_min." });
    }

    if (isNaN(Number(id_paciente)) || Number(id_paciente) <= 0) {
        return res.status(400).json({ msg: "id_paciente inválido." });
    }

    if (isNaN(Number(id_medico)) || Number(id_medico) <= 0) {
        return res.status(400).json({ msg: "id_medico inválido." });
    }

    if (!isValidISODate(String(data_consulta))) {
        return res.status(400).json({ msg: "Data inválida. Use YYYY-MM-DD." });
    }

    if (isNaN(Number(duracao_min)) || Number(duracao_min) <= 0) {
        return res.status(400).json({ msg: "duracao_min deve ser um número inteiro positivo." });
    }

    try {
        const buscaConsulta = await db.query("SELECT * FROM consulta WHERE id_consulta = $1", [id]);
        if (buscaConsulta.rowCount === 0) {
            return res.status(404).json({ msg: "Consulta não cadastrada no banco" });
        }

        const buscaPaciente = await db.query("SELECT 1 FROM paciente WHERE id_paciente = $1", [id_paciente]);
        if (buscaPaciente.rowCount === 0) {
            return res.status(400).json({ msg: "id_paciente informado não existe." });
        }

        const buscaMedico = await db.query("SELECT 1 FROM medico WHERE id_medico = $1", [id_medico]);
        if (buscaMedico.rowCount === 0) {
            return res.status(400).json({ msg: "id_medico informado não existe." });
        }

        const update = await db.query("UPDATE consulta SET id_paciente = $1, id_medico = $2, data_consulta = $3, duracao_min = $4, diagnostico = $5, observacoes = $6 WHERE id_consulta = $7 RETURNING *", [id_paciente, id_medico, data_consulta, Number(duracao_min), diagnostico ?? null, observacoes ?? null, id]);

        return res.status(200).json({ msg: update.rows[0] });
    } catch (error) {
        if (error.code === "23505") {
            return res.status(400).json({ msg: "Já existe uma consulta para esse paciente com esse médico na mesma data." });
        }

        console.error("Erro ao atualizar consulta:", error);
        return res.status(500).json({ msg: "Erro ao atualizar consulta no banco." });
    }
});

module.exports = router;