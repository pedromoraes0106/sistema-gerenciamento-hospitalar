const express = require("express");
const router = express.Router();
const db = require("../db");

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
 *               exemplo:
 *                 value:
 *                   msg:
 *                     - id_medico: 1
 *                       nome: "Dr. João"
 *                       crm: "12345"
 *                       especialidade: "Cardiologia"
 *                       data_contratacao: "2020-01-10"
 *                       id_departamento: 2
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

router.get("/", async (req,res) => {
    try {
        const r = await db.query("SELECT * from MEDICO");
        res.status(200).json({msg: r.rows});
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
});

/**
 * @swagger
 * /medico/{id}:
 *   get:
 *     summary: Retorna um médico específico.
 *     description: Busca um médico pelo ID informado.
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
 *         description: Médico retornado com sucesso.
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
 *               exemplo:
 *                 value:
 *                   msg:
 *                     - id_medico: 1
 *                       nome: "Dr. João"
 *                       crm: "12345"
 *                       especialidade: "Cardiologia"
 *                       data_contratacao: "2020-01-10"
 *                       id_departamento: 2
 *       500:
 *         description: Erro ao buscar médico.
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
 *                   msg: "Erro ao buscar médico."
 */

router.get("/:id", async (req,res) => {

    let id = Number(req.params.id);
    if(Number.isNaN(id)) return res.status(400).json({msg: "Informe um id_medico válido"});

    try {   
            const busca = await db.query("SELECT count(*) from MEDICO WHERE id_medico = $1", [id]);
            const qtd = Number(busca.rows[0].count);
    
            if (qtd == 0) {
                res.status(404).json({ msg: "Médico não cadastrado no banco" });
            } else {
                const medico = await db.query("SELECT * from MEDICO WHERE id_medico = $1", [id]);
                res.status(200).json(medico.rows);
            }    
        } catch (error) {
            res.status(500).json({ msg: error.message });
        }
});

/**
 * @swagger
 * /medico:
 *   post:
 *     summary: Cadastra um novo médico.
 *     description: Insere um novo registro na tabela MEDICO.
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
 *       200:
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
 *               exemplo:
 *                 value:
 *                   msg: "Erro ao cadastrar médico."
 */

router.post("/", async (req,res) => {
    let body = req.body;

    if(!body) return res.status(400).json({ msg: "Parâmetros incorretos" });

    let nome = body.nome;
    let crm = body.crm;
    let especialidade = body.especialidade;
    let data_contratacao = body.data_contratacao;
    let id_departamento = body.id_departamento;

    try {
        const insert = await db.query("INSERT INTO MEDICO(nome, crm, especialidade, data_contratacao, id_departamento) VALUES($1, $2, $3, $4, $5) returning *", [nome, crm, especialidade, data_contratacao, id_departamento]);
        res.status(200).json({ msg: insert.rows[0]});
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
});

/**
 * @swagger
 * /medico:
 *   delete:
 *     summary: Remove um médico do sistema.
 *     description: Exclui o registro de um médico existente com base no ID informado.
 *     tags: [Médicos]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id_medico:
 *                 type: integer
 *                 example: 4
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
 *         description: Erro ao remover médico.
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
 *                   msg: "Erro ao remover médico."
 */

router.delete("/", async (req,res) => {
    let body = req.body;
    
    if(!body) return res.status(400).json({ msg: "Parâmetros incorretos" });

    let id = Number(body.id_medico);
    if(Number.isNaN(id)) return res.status(400).json({msg: "Informe um id_medico válido"});
    
        try {
            const busca = await db.query("SELECT count(*) FROM MEDICO WHERE id_medico = $1", [id]);
            let qtd = Number(busca.rows[0].count);
    
            if ( qtd == 1 ) {
                const del = await db.query("DELETE FROM MEDICO WHERE id_medico = $1 returning*", [id]);
                res.status(200).json({msg: del.rows[0]});
            }
            else {
                res.status(404).json({ msg: "Médico não cadastrado no banco" });
            }
        } catch (error) {   
             res.status(500).json({ msg: error.message });
        }   
}); 

/**
 * @swagger
 * /medico:
 *   put:
 *     summary: Atualiza os dados de um médico existente.
 *     description: Atualiza as informações de um médico já cadastrado no sistema.
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
 *                 id_medico: 2
 *                 nome: "Dr. Pedro"
 *                 crm: "11111"
 *                 especialidade: "Neurologia"
 *                 data_contratacao: "2021-08-20"
 *                 id_departamento: 1
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
 *               exemplo:
 *                 value:
 *                   msg:
 *                     id_medico: 2
 *                     nome: "Dr. Pedro"
 *                     crm: "11111"
 *                     especialidade: "Neurologia"
 *                     data_contratacao: "2021-08-20"
 *                     id_departamento: 1
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
 *         description: Erro ao atualizar médico.
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
 *                   msg: "Erro ao atualizar médico."
 */

router.put("/", async (req,res) => {
    let body = req.body;
    
    if(!body) return res.status(400).json({ msg: "Parâmetros incorretos" });

    let id = Number(body.id_medico);
    if(Number.isNaN(id)) return res.status(400).json({msg: "Informe um id_medico válido"});

    let crm = body.crm;
    let nome = body.nome;
    let especialidade = body.especialidade;
    let data_contratacao = body.data_contratacao;
    let id_departamento = body.id_departamento;

    try {
        const busca = await db.query("SELECT count(*) FROM MEDICO WHERE id_medico = $1", [id]);
        let qtd = Number(busca.rows[0].count);

        if ( qtd == 1) {
            const update = await db.query("UPDATE MEDICO SET nome = $1, crm = $2, especialidade = $3, data_contratacao = $4, id_departamento = $5 WHERE id_medico = $6 returning *", [nome, crm, especialidade, data_contratacao, id_departamento, id]);
            res.status(200).json({msg: update.rows[0]});
        }
        else {
            res.status(404).json({ msg: "Médico não cadastrado no banco" });
        }
    } catch (error) {   
            res.status(500).json({ msg: error.message });
    } 
});

module.exports = router;