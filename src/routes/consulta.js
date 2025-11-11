const express = require("express");
const router = express.Router();
const db = require("../db");

router.get("/", async (req,res) => {
    try {
        const r = await db.query("SELECT * from consulta");
        res.status(200).json({msg: r.rows});
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
});

router.get("/:id", async (req,res) => {
    try {
        const r = await db.query("SELECT * from consulta WHERE id_consulta = $1", [id]);
        res.status(200).json({msg: r.rows});
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
});

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
         res.status(404).json({ msg: error.message });
    }   
});

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
         res.status(404).json({ msg: error.message });
    }   
});

module.exports = router;