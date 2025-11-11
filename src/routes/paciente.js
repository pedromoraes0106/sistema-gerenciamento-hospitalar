const express = require("express");
const router = express.Router();
const db = require("../db");

router.get("/", async (req,res) => {
    try {
        const r = await db.query("SELECT * from PACIENTE");
        res.status(200).json({msg: r.rows});
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
});

router.get("/:id", async (req,res) => {

    let id = Number(req.params.id);
    if(Number.isNaN(id)) return res.status(400).json({msg: "Informe um id_paciente válido"});

    try {   
        const busca = await db.query("SELECT count(*) from PACIENTE WHERE id_paciente = $1", [id]);
        const qtd = Number(busca.rows[0].count);

        if (qtd == 0) {
            res.status(200).json({msg: "Paciente não cadastrado no banco"});
        } else {
            const paciente = await db.query("SELECT * from PACIENTE WHERE id_paciente = $1", [id]);
            res.status(200).json(paciente.rows);
        }    
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
});

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
         res.status(404).json({ msg: error.message });
    }   
}); 

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
         res.status(404).json({ msg: error.message });
    }   
});

module.exports = router;