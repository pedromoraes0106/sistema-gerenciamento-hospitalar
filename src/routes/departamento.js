const express = require("express");
const router = express.Router();
const db = require("../db");

/**
 * @swagger
 * /departamento:
 *   get:
 *     summary: Retorna todos os departamentos cadastrados.
 *     description: Busca todos os registros da tabela de departamentos. Retorna uma mensagem caso não haja departamentos cadastrados.
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
 *                   oneOf:
 *                     - type: string
 *                       example: "Nenhum departamento cadastrado."
 *                     - type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id_departamento:
 *                             type: integer
 *                             example: 1
 *                           nome:
 *                             type: string
 *                             example: "Cardiologia"
 *                           localizacao:
 *                             type: string
 *                             example: "Bloco A"
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

router.get("/", async (req, res) => {
    try {
        const result = await db.query("SELECT * FROM departamento ORDER BY id_departamento");

        if (result.rowCount === 0) {
            return res.status(200).json({ msg: "Nenhum departamento cadastrado." });
        }

        return res.status(200).json({ msg: result.rows });
    } catch (error) {
        console.error("Erro ao buscar departamentos:", error);
        return res.status(500).json({ msg: "Erro ao buscar departamentos no banco." });
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
 *         description: Departamento encontrado com sucesso.
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
 *                       example: 1
 *                     nome:
 *                       type: string
 *                       example: "Cardiologia"
 *                     localizacao:
 *                       type: string
 *                       example: "Bloco A"
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

router.get("/:id", async (req, res) => {
    const id = Number(req.params.id);

    if (Number.isNaN(id) || id <= 0) {
        return res.status(400).json({ msg: "Informe um id_departamento válido." });
    }

    try {
        const result = await db.query("SELECT * FROM departamento WHERE id_departamento = $1", [id]);

        if (result.rowCount === 0) {
            return res.status(404).json({ msg: "Departamento não cadastrado no banco." });
        }

        return res.status(200).json({ msg: result.rows[0] });

    } catch (error) {
        console.error("Erro ao buscar departamento:", error);
        return res.status(500).json({ msg: "Erro ao consultar departamento no banco." });
    }
});

/**
 * @swagger
 * /departamento:
 *   post:
 *     summary: Cria um novo departamento.
 *     description: Insere um novo registro na tabela de departamentos. O campo 'nome' é obrigatório; 'localizacao' é opcional.
 *     tags: [Departamentos]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nome
 *             properties:
 *               nome:
 *                 type: string
 *                 example: "Neurologia"
 *               localizacao:
 *                 type: string
 *                 example: "Bloco B"
 *     responses:
 *       201:
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
 *       400:
 *         description: Parâmetros inválidos ou departamento já existente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   example: "O campo 'nome' é obrigatório." 
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


router.post("/", async (req, res) => {
    const { nome, localizacao } = req.body;

    if (!nome || nome.trim() === "") {
        return res.status(400).json({ msg: "O campo 'nome' é obrigatório." });
    }

    try {
        const insert = await db.query("INSERT INTO departamento (nome, localizacao) VALUES ($1, $2) RETURNING *", [nome.trim(), localizacao ?? null]);

        return res.status(201).json({ msg: insert.rows[0] });
    } catch (error) {
        if (error.code === "23505") { 
            return res.status(400).json({ msg: "Já existe um departamento com este nome." });
        }

        console.error("Erro ao inserir departamento:", error);
        return res.status(500).json({ msg: "Erro ao inserir departamento no banco." });
    }
});


/**
 * @swagger
 * /departamento/{id}:
 *   delete:
 *     summary: Remove um departamento existente.
 *     description: Exclui um departamento com base no ID informado na URL.
 *     tags: [Departamentos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID do departamento que será removido.
 *         schema:
 *           type: integer
 *           example: 4
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
 *       400:
 *         description: ID inválido informado.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   example: "Informe um id_departamento válido."
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

router.delete("/:id", async (req, res) => {
    const id = Number(req.params.id);

    if (Number.isNaN(id) || id <= 0) {
        return res.status(400).json({ msg: "Informe um id_departamento válido." });
    }

    try {
        const busca = await db.query("SELECT * FROM departamento WHERE id_departamento = $1", [id]);

        if (busca.rowCount === 0) {
            return res.status(404).json({ msg: "Departamento não cadastrado no banco." });
        }

        const del = await db.query("DELETE FROM departamento WHERE id_departamento = $1 RETURNING *", [id]);

        return res.status(200).json({ msg: del.rows[0] });
    } catch (error) {
        console.error("Erro ao deletar departamento:", error);
        return res.status(500).json({ msg: "Erro ao excluir departamento no banco." });
    }
});


/**
 * @swagger
 * /departamento/{id}:
 *   put:
 *     summary: Atualiza um departamento existente.
 *     description: Atualiza os dados de um departamento já cadastrado. O ID do departamento deve ser informado na URL. Não é permitido atualizar para um nome já existente em outro departamento.
 *     tags: [Departamentos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID do departamento que será atualizado.
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
 *               - localizacao
 *             properties:
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
 *       400:
 *         description: Nome do departamento já existe ou parâmetros inválidos.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   example: "Já existe um departamento cadastrado com o nome 'Ortopedia'."
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
 *         description: Erro interno ao atualizar departamento.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   example: "Erro ao atualizar departamento no banco."
 */

router.put("/:id", async (req, res) => {
    const id = Number(req.params.id);
    const { nome, localizacao } = req.body;

    if (Number.isNaN(id) || id <= 0) {
        return res.status(400).json({ msg: "Informe um id_departamento válido." });
    }

    if (!nome || !localizacao) {
        return res.status(400).json({ msg: "Campos obrigatórios ausentes. Envie nome e localizacao." });
    }

    try {
        const busca = await db.query("SELECT * FROM departamento WHERE id_departamento = $1", [id]);
        if (busca.rowCount === 0) {
            return res.status(404).json({ msg: "Departamento não cadastrado no banco." });
        }

        const verificaNome = await db.query("SELECT * FROM departamento WHERE nome = $1 AND id_departamento <> $2", [nome, id]);

        if (verificaNome.rowCount > 0) {
            return res.status(400).json({ msg: `Já existe um departamento cadastrado com o nome ${nome}.` });
        }

        const update = await db.query("UPDATE departamento SET nome = $1, localizacao = $2 WHERE id_departamento = $3 RETURNING *", [nome, localizacao, id]);

        return res.status(200).json({ msg: update.rows[0] });
    } catch (error) {
        console.error("Erro ao atualizar departamento:", error);
        return res.status(500).json({ msg: "Erro ao atualizar departamento no banco." });
    }
});


module.exports = router;
    