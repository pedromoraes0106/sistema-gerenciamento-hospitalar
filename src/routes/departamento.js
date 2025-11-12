const express = require("express");
const router = express.Router();
const db = require("../db");

/**
 * @swagger
 * /departamento:
 *   get:
 *     summary: Retorna todos os departamentos cadastrados.
 *     description: Busca todos os registros da tabela de departamentos.
 *     tags: [Departamentos]
 *     responses:
 *       200:
 *         description: Lista de departamentos retornada com sucesso.
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
 *                       id_departamento:
 *                         type: integer
 *                         example: 1
 *                       nome:
 *                         type: string
 *                         example: "Cardiologia"
 *                       localizacao:
 *                         type: string
 *                         example: "Bloco A"
 *       500:
 *         description: Erro interno ao buscar departamentos.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   example: "Erro de conexão com o banco de dados."
 */

router.get("/", async (req,res) => {
    try {
        const r = await db.query("SELECT * from departamento");
        res.status(200).json({msg: r.rows});
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
});

/**
 * @swagger
 * /departamento/{id}:
 *   get:
 *     summary: Retorna um departamento específico.
 *     description: Busca um departamento pelo seu ID.
 *     tags: [Departamentos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID do departamento.
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Departamento encontrado ou mensagem informando que não foi cadastrado.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   example: "Departamento não cadastrado no banco"
 *       500:
 *         description: Erro interno ao buscar departamento.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   example: "Erro ao executar a consulta."
 */
router.get("/:id", async (req,res) => {

    let id = Number(req.params.id);
    if(Number.isNaN(id)) return res.status(400).json({msg: "Informe um id_departamento válido"});
    
    try {   
        const busca = await db.query("SELECT count(*) from DEPARTAMENTO WHERE id_departamento = $1", [id]);
        const qtd = Number(busca.rows[0].count);

        if (qtd == 0) {
            res.status(404).json({msg: "Departamento não cadastrado no banco"});
        } else {
            const departamento = await db.query("SELECT * from DEPARTAMENTO WHERE id_departamento = $1", [id]);
            res.status(200).json(departamento.rows);
        }    
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
});

/**
 * @swagger
 * /departamento:
 *   post:
 *     summary: Cria um novo departamento.
 *     description: Insere um novo registro na tabela de departamentos.
 *     tags: [Departamentos]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nome:
 *                 type: string
 *                 example: "Neurologia"
 *               localizacao:
 *                 type: string
 *                 example: "Bloco B"
 *     responses:
 *       200:
 *         description: Departamento criado com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: object
 *                   properties:
 *                     id_departamento:
 *                       type: integer
 *                       example: 5
 *                     nome:
 *                       type: string
 *                       example: "Neurologia"
 *                     localizacao:
 *                       type: string
 *                       example: "Bloco B"
 *       500:
 *         description: Erro ao criar departamento.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   example: "Erro ao inserir no banco de dados."
 */

router.post("/", async (req,res) => {
    let body = req.body;

    if(!body) return res.status(400).json({ msg: "Parâmetros incorretos" });
    
    let nome = body.nome;
    let localizacao = body.localizacao;

    try {
        const insert = await db.query("INSERT INTO DEPARTAMENTO(nome, localizacao) VALUES($1, $2) returning *", [nome, localizacao]);
        res.status(200).json({ msg: insert.rows[0]});
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
});

/**
 * @swagger
 * /departamento:
 *   delete:
 *     summary: Remove um departamento existente.
 *     description: Exclui um departamento com base no ID informado.
 *     tags: [Departamentos]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id_departamento:
 *                 type: integer
 *                 example: 4
 *     responses:
 *       200:
 *         description: Departamento removido com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: object
 *                   properties:
 *                     id_departamento:
 *                       type: integer
 *                       example: 4
 *                     nome:
 *                       type: string
 *                       example: "Pediatria"
 *                     localizacao:
 *                       type: string
 *                       example: "Bloco D"
 *       404:
 *         description: Departamento não cadastrado no banco.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   example: "Departamento não cadastrado no banco"
 *       500:
 *         description: Erro interno ao remover departamento.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   example: "Erro ao deletar no banco."
 */

router.delete("/", async (req,res) => {
    let body = req.body;
        
    if(!body) return res.status(400).json({ msg: "Parâmetros incorretos" });

    let id = Number(body.id_departamento);
    if(Number.isNaN(id)) return res.status(400).json({msg: "Informe um id_departamento válido"});

    try {
        const busca = await db.query("SELECT count(*) FROM DEPARTAMENTO WHERE id_departamento = $1", [id]);
        let qtd = Number(busca.rows[0].count);

        if ( qtd == 1 ) {
            const del = await db.query("DELETE FROM DEPARTAMENTO WHERE id_departamento = $1 returning*", [id]);
            res.status(200).json({msg: del.rows[0]});
        }
        else {
            res.status(404).json({ msg: "Departamento não cadastrado no banco" });
        }
    } catch (error) {   
            res.status(500).json({ msg: error.message });
    }   
}); 

/**
 * @swagger
 * /departamento:
 *   put:
 *     summary: Atualiza um departamento existente.
 *     description: Atualiza os dados de um departamento já cadastrado.
 *     tags: [Departamentos]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id_departamento:
 *                 type: integer
 *                 example: 2
 *               nome:
 *                 type: string
 *                 example: "Ortopedia"
 *               localizacao:
 *                 type: string
 *                 example: "Bloco C"
 *     responses:
 *       200:
 *         description: Departamento atualizado com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: object
 *                   properties:
 *                     id_departamento:
 *                       type: integer
 *                       example: 2
 *                     nome:
 *                       type: string
 *                       example: "Ortopedia"
 *                     localizacao:
 *                       type: string
 *                       example: "Bloco C"
 *       404:
 *         description: Departamento não cadastrado no banco.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   example: "Departamento não cadastrado no banco"
 *       500:
 *         description: Erro ao atualizar departamento.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   example: "Erro interno ao atualizar."
 */

router.put("/", async (req,res) => {
    let body = req.body;
    
    if(!body) return res.status(400).json({ msg: "Parâmetros incorretos" });

    let id = Number(body.id_departamento);
    if(Number.isNaN(id)) return res.status(400).json({msg: "Informe um id_departamento válido"});

    let nome = body.nome;
    let localizacao = body.localizacao;

    try {
        const busca = await db.query("SELECT count(*) FROM DEPARTAMENTO WHERE id_departamento = $1", [id]);
        let qtd = Number(busca.rows[0].count);

        if ( qtd == 1) {
            const update = await db.query("UPDATE DEPARTAMENTO SET nome = $1, localizacao = $2 WHERE id_departamento = $3 returning *", [nome, localizacao, id]);
            res.status(200).json({msg: update.rows[0]});
        }
        else {
            res.status(404).json({ msg: "Departamento não cadastrado no banco" });
        }
    } catch (error) {   
         res.status(500).json({ msg: error.message });
    }    
});

module.exports = router;
    