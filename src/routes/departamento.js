const express = require("express");
const router = express.Router();
const db = require("../db");

router.get("/", async (req,res) => {
    try {
        const r = await db.query("SELECT * from departamento");
        res.status(200).json({msg: r.rows});
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
});

router.get("/:id", async (req,res) => {

    let id = Number(req.params.id);
    if(Number.isNaN(id)) return res.status(400).json({msg: "Informe um id_departamento válido"});
    
    try {   
        const busca = await db.query("SELECT count(*) from DEPARTAMENTO WHERE id_departamento = $1", [id]);
        const qtd = Number(busca.rows[0].count);

        if (qtd == 0) {
            res.status(200).json({msg: "Departamento não cadastrado no banco"});
        } else {
            const departamento = await db.query("SELECT * from DEPARTAMENTO WHERE id_departamento = $1", [id]);
            res.status(200).json(departamento.rows);
        }    
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
});

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
            res.status(404).json({ msg: error.message });
    }   
}); 

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
         res.status(404).json({ msg: error.message });
    }    
});

module.exports = router;
    