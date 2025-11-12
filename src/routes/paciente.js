const express = require("express");
const router = express.Router();
const db = require("../db");

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
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Paciente'
 *             examples:
 *               exemplo:
 *                 value:
 *                   msg:
 *                     - id_paciente: 1
 *                       nome: "João Silva"
 *                       cpf: "12345678900"
 *                       data_nascimento: "1990-05-15"
 *                       endereco: "Rua das Flores, 123"
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

router.get("/", async (req,res) => {
    try {
        const r = await db.query("SELECT * from PACIENTE");
        res.status(200).json({msg: r.rows});
    } catch (error) {
        res.status(500).json({ msg: error.message });
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
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Paciente'
 *             examples:
 *               exemplo:
 *                 value:
 *                   - id_paciente: 1
 *                     nome: "João Silva"
 *                     cpf: "12345678900"
 *                     data_nascimento: "1990-05-15"
 *                     endereco: "Rua das Flores, 123"
 *       500:
 *         description: Erro ao buscar paciente.
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
 *                   msg: "Erro ao buscar paciente."
 */

router.get("/:id", async (req,res) => {

    let id = Number(req.params.id);
    if(Number.isNaN(id)) return res.status(400).json({msg: "Informe um id_paciente válido"});

    try {   
        const busca = await db.query("SELECT count(*) from PACIENTE WHERE id_paciente = $1", [id]);
        const qtd = Number(busca.rows[0].count);

        if (qtd == 0) {
            res.status(404).json({ msg: "Paciente não cadastrado no banco" });
        } else {
            const paciente = await db.query("SELECT * from PACIENTE WHERE id_paciente = $1", [id]);
            res.status(200).json(paciente.rows);
        }    
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
});

/**
 * @swagger
 * /paciente:
 *   post:
 *     summary: Cadastra um novo paciente.
 *     description: Insere um novo registro na tabela PACIENTE.
 *     tags: [Pacientes]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Paciente'
 *           examples:
 *             exemplo:
 *               value:
 *                 nome: "Maria Souza"
 *                 cpf: "98765432100"
 *                 data_nascimento: "1985-09-12"
 *                 endereco: "Av. Central, 45"
 *     responses:
 *       200:
 *         description: Paciente cadastrado com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   $ref: '#/components/schemas/Paciente'
 *             examples:
 *               exemplo:
 *                 value:
 *                   msg:
 *                     id_paciente: 2
 *                     nome: "Maria Souza"
 *                     cpf: "98765432100"
 *                     data_nascimento: "1985-09-12"
 *                     endereco: "Av. Central, 45"
 *       500:
 *         description: Erro ao cadastrar paciente.
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
 *                   msg: "Erro ao cadastrar paciente."
 */

router.post("/", async (req,res) => {
    let body = req.body;

    if(!body) return res.status(400).json({ msg: "Parâmetros incorretos" });

    let nome = body.nome;
    let cpf = body.cpf;
    let data_nascimento = body.data_nascimento;
    let endereco = body.endereco;
    
    try {
        const insert = await db.query("INSERT INTO PACIENTE(nome, cpf, data_nascimento, endereco) VALUES($1, $2, $3, $4) returning *", [nome, cpf, data_nascimento, endereco]);
        res.status(200).json({ msg: insert.rows[0]});
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
});

/**
 * @swagger
 * /paciente:
 *   delete:
 *     summary: Remove um paciente do sistema.
 *     description: Exclui o registro de um paciente existente com base no ID informado.
 *     tags: [Pacientes]
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
 *               exemplo:
 *                 value:
 *                   msg:
 *                     id_paciente: 3
 *                     nome: "Carlos Lima"
 *                     cpf: "44455566677"
 *                     data_nascimento: "1992-07-10"
 *                     endereco: "Rua A, 22"
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
 *               exemplo:
 *                 value:
 *                   msg: "Paciente não cadastrado no banco."
 *       500:
 *         description: Erro ao remover paciente.
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
 *                   msg: "Erro ao remover paciente."
 */

router.delete("/", async (req,res) => {
    let body = req.body;
    
    if(!body) return res.status(400).json({ msg: "Parâmetros incorretos" });

    let id = Number(body.id_paciente);
    if(Number.isNaN(id)) return res.status(400).json({msg: "Informe um id_paciente válido"});

    try {
        const busca = await db.query("SELECT count(*) FROM PACIENTE WHERE id_paciente = $1", [id]);
        let qtd = Number(busca.rows[0].count);

        if ( qtd == 1 ) {
            const del = await db.query("DELETE FROM PACIENTE WHERE id_paciente = $1 returning*", [id]);
            res.status(200).json({msg: del.rows[0]});
        }
        else {
            res.status(404).json({ msg: "Paciente não cadastrado no banco" });
        }
    } catch (error) {   
         res.status(500).json({ msg: error.message });
    }   
}); 

/**
 * @swagger
 * /paciente:
 *   put:
 *     summary: Atualiza os dados de um paciente existente.
 *     description: Atualiza as informações de um paciente já cadastrado no sistema.
 *     tags: [Pacientes]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Paciente'
 *           examples:
 *             exemplo:
 *               value:
 *                 id_paciente: 2
 *                 nome: "Maria Souza"
 *                 cpf: "98765432100"
 *                 data_nascimento: "1985-09-12"
 *                 endereco: "Rua Nova, 789"
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
 *               exemplo:
 *                 value:
 *                   msg:
 *                     id_paciente: 2
 *                     nome: "Maria Souza"
 *                     cpf: "98765432100"
 *                     data_nascimento: "1985-09-12"
 *                     endereco: "Rua Nova, 789"
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
 *               exemplo:
 *                 value:
 *                   msg: "Paciente não cadastrado no banco."
 *       500:
 *         description: Erro ao atualizar paciente.
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
 *                   msg: "Erro ao atualizar paciente."
 */

router.put("/", async (req,res) => {
    let body = req.body;
    
    if(!body) return res.status(400).json({ msg: "Parâmetros incorretos" });

    let id = Number(body.id_paciente);
    if(Number.isNaN(id)) return res.status(400).json({msg: "Informe um id_paciente válido"});

    let nome = body.nome;
    let cpf = body.cpf;
    let data_nascimento = body.data_nascimento;
    let endereco = body.endereco;

    try {
        const busca = await db.query("SELECT count(*) FROM PACIENTE WHERE id_paciente = $1", [id]);
        let qtd = Number(busca.rows[0].count);

        if ( qtd == 1) {
            const update = await db.query("UPDATE PACIENTE SET nome = $1, cpf = $2, data_nascimento = $3 , endereco = $4 WHERE id_paciente = $5 returning *", [nome, cpf, data_nascimento, endereco, id]);
            res.status(200).json({msg: update.rows[0]});
        }
        else {
            res.status(404).json({ msg: "Paciente não cadastrado no banco" });
        }
    } catch (error) {   
         res.status(500).json({ msg: error.message });
    }   
});

module.exports = router;