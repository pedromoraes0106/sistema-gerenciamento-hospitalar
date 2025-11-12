const express = require("express");
const router = express.Router();
const db = require("../db");

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
 *                 msg:
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
 *                   example: "Erro ao consultar o banco."
 */

router.get("/", async (req,res) => {
    try {
        const r = await db.query("SELECT * from consulta");
        res.status(200).json({msg: r.rows});
    } catch (error) {
        res.status(500).json({ msg: error.message });
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
 *                 msg:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id_consulta:
 *                         type: integer
 *                         example: 1
 *                       diagnostico:
 *                         type: string
 *                         example: "Hipertensão leve"
 *       500:
 *         description: Erro ao buscar consulta.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   example: "Erro de consulta no banco."
 */

router.get("/:id", async (req, res) => {
    let id = Number(req.params.id);
    if (Number.isNaN(id)) return res.status(400).json({ msg: "Informe um id_consulta válido" });

    try {
        const busca = await db.query("SELECT count(*) from CONSULTA WHERE id_consulta = $1", [id]);
        const qtd = Number(busca.rows[0].count);

        if (qtd == 0) {
            res.status(404).json({ msg: "Consulta não cadastrada no banco" });
        } else {
            const consulta = await db.query("SELECT * from consulta WHERE id_consulta = $1", [id]);
            res.status(200).json(consulta.rows);
        }
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
});

/**
 * @swagger
 * /consulta:
 *   post:
 *     summary: Cadastra uma nova consulta.
 *     description: Insere uma nova consulta na tabela.
 *     tags: [Consultas]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
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
 *       200:
 *         description: Consulta cadastrada com sucesso.
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
 *                       example: 10
 *                     diagnostico:
 *                       type: string
 *                       example: "Hipertensão leve"
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

router.post("/", async (req,res) => {
    let body = req.body;

    if(!body) return res.status(400).json({ msg: "Parâmetros incorretos" });
    
    let id_paciente = body.id_paciente;
    let id_medico = body.id_medico;
    let data_consulta = body.data_consulta;
    let duracao_min = body.duracao_min;
    let diagnostico = body.diagnostico;
    let observacoes = body.observacoes;

    try {
        const insert = await db.query("INSERT INTO CONSULTA(id_paciente, id_medico, data_consulta, duracao_min, diagnostico, observacoes) VALUES($1, $2, $3, $4, $5, $6) returning *", [id_paciente, id_medico, data_consulta, duracao_min, diagnostico, observacoes]);
        res.status(200).json({ msg: insert.rows[0]});
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
});

/**
 * @swagger
 * /consulta:
 *   delete:
 *     summary: Remove uma consulta existente.
 *     description: Exclui uma consulta do sistema com base no ID informado.
 *     tags: [Consultas]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id_consulta:
 *                 type: integer
 *                 example: 4
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
 *                     diagnostico:
 *                       type: string
 *                       example: "Infecção respiratória"
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

router.delete("/", async (req,res) => {
    let body = req.body;
    
    if(!body) return res.status(400).json({ msg: "Parâmetros incorretos" });

    let id = Number(body.id_consulta);
    if(Number.isNaN(id)) return res.status(400).json({msg: "Informe um id_consulta válido"});

    try {
        const busca = await db.query("SELECT count(*) FROM CONSULTA WHERE id_consulta = $1", [id]);
        let qtd = Number(busca.rows[0].count);

        if ( qtd == 1 ) {
            const del = await db.query("DELETE FROM CONSULTA WHERE id_consulta = $1 returning*", [id]);
            res.status(200).json({msg: del.rows[0]});
        }
        else {
            res.status(404).json({ msg: "Consulta não cadastrada no banco" });
        }
    } catch (error) {   
         res.status(500).json({ msg: error.message });
    }   
});

/**
 * @swagger
 * /consulta:
 *   put:
 *     summary: Atualiza uma consulta existente.
 *     description: Atualiza as informações de uma consulta já cadastrada.
 *     tags: [Consultas]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id_consulta:
 *                 type: integer
 *                 example: 2
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
 *                     diagnostico:
 *                       type: string
 *                       example: "Enxaqueca crônica"
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
 *         description: Erro ao atualizar consulta.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   example: "Erro interno ao atualizar consulta."
 */

router.put("/", async (req,res) => {
    let body = req.body;
    
    if(!body) return res.status(400).json({ msg: "Parâmetros incorretos" });

    let id = Number(body.id_consulta);
    if(Number.isNaN(id)) return res.status(400).json({msg: "Informe um id_consulta válido"});

    let id_paciente = body.id_paciente;
    let id_medico = body.id_medico;
    let data_consulta = body.data_consulta;
    let duracao_min = body.duracao_min;
    let diagnostico = body.diagnostico;
    let observacoes = body.observacoes;

    try {
        const busca = await db.query("SELECT count(*) FROM CONSULTA WHERE id_consulta = $1", [id]);
        let qtd = Number(busca.rows[0].count);

        if ( qtd == 1) {
            const update = await db.query("UPDATE CONSULTA SET id_paciente = $1, id_medico = $2, data_consulta = $3 , duracao_min = $4, diagnostico = $5, observacoes = $6 WHERE id_consulta = $7 returning *", [id_paciente, id_medico, data_consulta, duracao_min, diagnostico, observacoes, id]);
            res.status(200).json({msg: update.rows[0]});
        }
        else {
            res.status(404).json({ msg: "Consulta não cadastrada no banco" });
        }
    } catch (error) {   
         res.status(500).json({ msg: error.message });
    }   
});

module.exports = router;