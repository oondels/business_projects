import express from "express";
import cors from "cors";
import { pool } from "./db.cjs";
import fileUpload from 'express-fileupload';
import { ip } from "../ip.js"

const app = express();

app.use(fileUpload());
app.use(cors());
app.use(express.json());

const port = 3049;

app.get('/', (req, res) => {
    res.send('Hello World');
});

app.listen(port, ip, () =>
    console.log(`App listening on port ${port} at ${ip}`)
);

// Busca critérios
app.get("/buscaCriteriosAuditoria", async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM auditoria_ferramentas.criterios");
        res.json(result.rows);
    } catch (error) {
        console.error('Erro ao buscar os critérios: ', error);
        res.status(500).json({ error: 'Erro ao buscar auditoria' });
    }
})

// Busca gerentes
app.get("/buscaNomesGerentes", async (req, res) => {
    let gerentes = [];
    try {
        const result = await pool.query("SELECT DISTINCT gerente FROM colaborador.lista_funcionario ORDER BY gerente ASC");
        result.rows.map(item => {
            gerentes.push(item.gerente)
        })
        res.json(gerentes);
    } catch (error) {
        console.error('Erro ao buscar os nomes dos gerentes: ', error);
    }
})

app.get("/buscaSetores", async (req, res) => {
    try {
        const gerente = req.query.gerente;
        const result = await pool.query(`SELECT DISTINCT nome_setor FROM colaborador.lista_funcionario WHERE gerente = $1 ORDER BY nome_setor ASC`, [gerente]);
        const setores = result.rows.map(row => row.nome_setor);
        res.json(setores);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar setores por gerente' })
    }
})

app.post("/salvaAuditoria", async (req, res) => {
    try {
        const { gerente, setor, celula, pontuacao, criterio, usuario_auditor, matricula_auditor } = req.body;
        if (!gerente || !setor || !celula || !pontuacao || !criterio || !usuario_auditor || !matricula_auditor) {
            res.status(422).json({ error: 'Dados obrigatórios não foram preenchidos' });
        } else {
            const result = await pool.query("INSERT INTO auditoria_ferramentas.auditoria (createdate, gerente, setor, celula, pontuacao, criterio, usuario_auditor, matricula_auditor) VALUES (NOW(), $1, $2, $3, $4, $5, $6, $7)", [gerente, setor, celula, pontuacao, criterio, usuario_auditor, matricula_auditor]);
            res.status(200).json({ message: 'Auditoria salva com sucesso' });
        }
    } catch (error) {
        console.error("Erro ao salvar auditoria:", error);
        res.status(500).json({ error: 'Erro ao Salvar auditoria' });
    }
})

app.get("/buscaAuditorias", async (req, res) => {
    const pagina = parseInt(req.query.pagina, 10) || 1;
    const tamanhoPagina = parseInt(req.query.tamanhoPagina, 10) || 30;
    const offset = (pagina - 1) * tamanhoPagina;
    const { data, gerente } = req.query;

    try {
        let query = `
            SELECT * 
            FROM auditoria_ferramentas.auditoria
            WHERE 1=1
        `;
        
        const params = [];
        
        if (gerente) {
            query += ` AND gerente = $${params.length + 1}`;
            params.push(gerente);
        }
        
        if (data) {
            query += ` AND EXTRACT(MONTH FROM createdate) = $${params.length + 1}`;
            params.push(data);
        }
        
        query += `
            ORDER BY id DESC
            LIMIT $${params.length + 1} OFFSET $${params.length + 2}
        `;
        params.push(tamanhoPagina, offset);
        
        const result = await pool.query(query, params);
        res.json(result.rows);
    } catch (error) {
        console.error("Erro ao buscar auditoria:", error);
        res.status(500).json({ error: 'Erro ao buscar auditoria' });
    }
});

app.get("/buscaDadoGlobaisAuditorias", async (req, res) => {
    const { gerente, data } = req.query;
    try {
        let query = `
            SELECT 
                EXTRACT(MONTH FROM createdate) AS mes, 
                EXTRACT(YEAR FROM createdate) AS ano, 
                COUNT(*) AS quantidade_registros, 
                AVG(pontuacao) AS soma_pontuacao 
            FROM 
                auditoria_ferramentas.auditoria 
            WHERE 
                EXTRACT(YEAR FROM CURRENT_DATE) = EXTRACT(YEAR FROM createdate)
        `;

        const params = [];

        if (gerente) {
            query += ` AND gerente = $${params.length + 1}`;
            params.push(gerente);
        }

        if (data) {
            query += ` AND EXTRACT(MONTH FROM createdate) = $${params.length + 1}`;
            params.push(data);
        }

        query += `
            GROUP BY 
                EXTRACT(MONTH FROM createdate), 
                EXTRACT(YEAR FROM createdate) 
            ORDER BY 
                ano, mes;
        `;

        const result = await pool.query(query, params);
        res.json(result.rows);
    } catch (error) {
        console.error("Erro ao buscar dados globais:", error);
        res.status(500).json({ error: 'Erro ao buscar dados globais' });
    }
});

app.get("/buscaDadoRankingAuditorias", async (req, res) => {
    try {
        let ranking = [];
        let icon = '';
        let color = '';
        const result = await pool.query("SELECT atual.gerente AS title, EXTRACT(MONTH FROM atual.createdate) AS mesatual, EXTRACT(MONTH FROM atual.createdate) - 1 AS mesanterior, EXTRACT(YEAR FROM atual.createdate) AS ano, COUNT(*) AS quantidade_registros, AVG(atual.pontuacao) AS amount_atual, AVG(anterior.pontuacao) AS amount_anterior FROM auditoria_ferramentas.auditoria AS atual LEFT JOIN auditoria_ferramentas.auditoria AS anterior ON atual.gerente = anterior.gerente AND EXTRACT(MONTH FROM atual.createdate) - 1 = EXTRACT(MONTH FROM anterior.createdate) AND EXTRACT(YEAR FROM atual.createdate) = EXTRACT(YEAR FROM anterior.createdate) WHERE EXTRACT(MONTH FROM atual.createdate) = EXTRACT(MONTH FROM CURRENT_DATE) AND EXTRACT(YEAR FROM atual.createdate) = EXTRACT(YEAR FROM CURRENT_DATE) GROUP by atual.gerente, EXTRACT(MONTH FROM atual.createdate), EXTRACT(YEAR FROM atual.createdate) ORDER BY amount_atual desc LIMIT 5;");
        for (let i = 0; i < result.rows.length; i++) {
            let amountMesAtual = Number(result.rows[i].amount_atual ? result.rows[i].amount_atual : 0);
            let amountMesAnterior = Number(result.rows[i].amount_anterior ? result.rows[i].amount_anterior : 0);

            if (amountMesAtual > amountMesAnterior) {
                icon = 'fa-arrow-up';
                color = 'success';
            } else if (amountMesAtual < amountMesAnterior) {
                icon = 'fa-arrow-down';
                color = 'danger';
            } else {
                icon = 'fa-grip-lines';
                color = 'warning';
            }
            ranking.push({
                title: result.rows[i].title,
                amount: Number(result.rows[i].amount_atual).toFixed(2) + '%',
                icon: icon,
                color: color,
            })
        }

        res.json(ranking);

    } catch (error) {
        console.error("Erro ao buscar dados globais:", error);
        res.status(500).json({ error: 'Erro ao buscar dados globais' });
    }
})

app.get("/buscaGerentesAuditados", async (req, res) => {
    try {
        let gerentes = [''];
        const result = await pool.query('SELECT DISTINCT gerente FROM auditoria_ferramentas.auditoria ORDER BY gerente ASC');

        result.rows.forEach(item => {
            gerentes.push(item.gerente);
        });

        res.json(gerentes);
    } catch (error) {
        console.error("Erro ao buscar gerentes auditados:", error);
        res.status(500).json({ error: 'Erro ao buscar gerentes auditados' });
    }
})