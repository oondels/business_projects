import express from 'express';
import cors from 'cors';
import { pool } from './db.cjs';
import fileUpload from 'express-fileupload';
import { ip } from "../ip.js"

const app = express();

app.use(fileUpload());
app.use(cors());
app.use(express.json());

const port = 3044;

app.get('/', (req, res) => {
    res.send('Hello World');
});

app.listen(port, ip, () =>
    console.log(`App listening on port ${port}!`)
);

app.get('/colaborador', async (req, res) => {
    try {
        const { rfid } = req.query;

        if (!rfid) {
            return res.status(422).json({ error: 'RFID não informado' });
        }

        const colaborador = await pool.query(`
            SELECT 
                cc.codbarras, cc.rfid, lf.nome, lf.matricula, lf.nome_setor, lf.gerente, lf.funcao 
            FROM 
                colaborador.lista_funcionario lf 
            LEFT JOIN
                colaborador.colaboradores cc 
            ON 
                lf.matricula = cc.matricula 
            WHERE cc.rfid = $1 LIMIT 1`, [rfid]);

        if (colaborador.rowCount === 0) {
            return res.status(404).json({ error: 'Colaborador não encontrado' });
        }

        return res.status(200).json(colaborador.rows[0]);
    } catch (error) {
        return res.status(500).send('Erro interno do servidor')
    }
})

app.post("/atendimento", async (req, res) => {
    try {
        const { colaborador, atendente } = req.body;

        if (!colaborador.rfid || !colaborador.matricula || !colaborador.nome || !colaborador.gerente || !colaborador.nome_setor || !colaborador.codbarras || !colaborador.funcao || !atendente) {
            return res.status(422).json({ error: 'Dados inválidos ou ausentes' });
        }

        const atendimento = await pool.query(`
            INSERT INTO 
                departamento_pessoal.atendimentos (createdate, atendente, rfid, matricula, nome, gerente, nome_setor, codbarras, funcao) 
            VALUES(NOW(), $1, $2, $3, $4, $5, $6, $7, $8)`,
            [atendente, colaborador.rfid, colaborador.matricula, colaborador.nome, colaborador.gerente, colaborador.nome_setor, colaborador.codbarras, colaborador.funcao]);

        return res.status(200).send('Atendimento registrado com sucesso');

    } catch (error) {
        return res.status(500).send('Erro interno do servidor')
    }
})

app.get('/filtros', async (req, res) => {
    try {
        const { gerenteParam } = req.query;

        const gerente = await pool.query(`
            SELECT DISTINCT gerente FROM departamento_pessoal.atendimentos ORDER BY gerente`);

        const atendente = await pool.query(`
            SELECT DISTINCT atendente FROM departamento_pessoal.atendimentos ORDER BY atendente
            `);

        let setor = { rows: [] };

        if (gerenteParam) {
            setor = await pool.query(`
            SELECT DISTINCT nome_setor FROM departamento_pessoal.atendimentos WHERE gerente = $1 ORDER BY nome_setor`, [gerenteParam]);
        }

        return res.status(200).json({
            gerentes: gerente.rows.map(row => row.gerente),
            setores: setor.rows.map(row => row.nome_setor),
            atendentes: atendente.rows.map(row => row.atendente)
        });
    } catch (error) {
        return res.status(500).send('Erro interno do servidor');
    }
});

app.get("/atendimento", async (req, res) => {
    try {
        const { atendente, gerente, setor } = req.query;

        const params = [];

        let query = `
            SELECT EXTRACT(MONTH FROM createdate) AS mes, COUNT(*) AS atendimentos 
            FROM departamento_pessoal.atendimentos 
            WHERE EXTRACT(YEAR FROM createdate) = EXTRACT(YEAR FROM NOW()) `

        if (atendente) {
            query += ` AND atendente = $${params.length + 1} `;
            params.push(atendente);
        }

        if (gerente) {
            query += ` AND gerente = $${params.length + 1} `;
            params.push(gerente);
        }

        if (setor) {
            query += ` AND nome_setor = $${params.length + 1} `;
            params.push(setor);
        }

        query += ` GROUP BY EXTRACT(MONTH FROM createdate) 
            ORDER BY mes`

        const atendimentos = await pool.query(query, params);
        const labels = atendimentos.rows.map(row => row.mes);
        const data = atendimentos.rows.map(row => Number(row.atendimentos));

        const meses = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

        const monthLabels = labels.map(month => meses[month - 1]);

        const chart = {
            labels: monthLabels,
            datasets:
            {
                label: 'Atendimentos',
                data: data,
            }
        };

        return res.json(chart);
    } catch (error) {
        return res.status(500).send("Erro interno do servidor");
    }
});

app.post("/vincularRfidMatricula", async (req, res) => {
    try {
        const { codigoRfid, usuarioUpdate, matricula, nome } = req.body;
        if (!codigoRfid || !usuarioUpdate || !matricula || !nome) {
            return res.status(422).json({ error: 'Dados inválidos ou ausentes' });
        }
        const verificaExistencia = await pool.query("SELECT * FROM colaborador.colaboradores WHERE matricula = $1", [matricula]);

        if (verificaExistencia.rowCount > 0) {
            const atualizaRfid = await pool.query("UPDATE colaborador.colaboradores SET rfid = $1, usuarioupdate = $2, updatedate = NOW() WHERE matricula = $3", [codigoRfid, usuarioUpdate, matricula])
        } else {
            const criaRfid = await pool.query("INSERT INTO colaborador.colaboradores (rfid, usuarioupdate, updatedate, matricula, nome) VALUES($1, $2, 'NOW()', $3, $4)", [codigoRfid, usuarioUpdate, matricula, nome])
        }
        res.status(200).json({ message: "Provisório vinculado com sucesso!" });
    } catch (error) {
        res.status(500).json({ error: "Erro ao vincular matrícula" })
    }
})