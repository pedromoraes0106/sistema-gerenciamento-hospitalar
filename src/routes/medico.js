const express = require("express");
const router = express.Router();
const db = require("../db");

router.get("/", async (req,res) => {
    try {
        const r = await db.query("SELECT * from MEDICO");
        res.status(200).json({msg: r.rows});
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
});

router.get("/:id", async (req,res) => {

    let id = Number(req.params.id);
    if(Number.isNaN(id)) return res.status(400).json({msg: "Informe um id_medico válido"});

    try {   
            const busca = await db.query("SELECT count(*) from MEDICO WHERE id_medico = $1", [id]);
            const qtd = Number(busca.rows[0].count);
    
            if (qtd == 0) {
                res.status(200).json({msg: "Médico não cadastrado no banco"});
            } else {
                const medico = await db.query("SELECT * from MEDICO WHERE id_medico = $1", [id]);
                res.status(200).json(medico.rows);
            }    
        } catch (error) {
            res.status(500).json({ msg: error.message });
        }
});

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
             res.status(404).json({ msg: error.message });
        }   
}); 

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
            res.status(404).json({ msg: "Paciente não cadastrado no banco" });
        }
    } catch (error) {   
            res.status(404).json({ msg: error.message });
    } 
});

module.exports = router;